"""Standalone test for the path-restoration logic in api/index.py.

Run: python test_path_restoration.py

Tests three layers:
  1. _normalize_path() - pure helper, no Django needed.
  2. _restore_path()   - restores PATH_INFO from __phg_path query param.
  3. Django URL resolution - verify that the restored path resolves to
     the correct view via the standard Django URLconf
     (path("admin/", ...) and path("api/", include("core.urls"))).
"""
import os
import sys
from pathlib import Path

# Set up environment *before* importing Django or api/index.py
PROJECT_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(PROJECT_ROOT))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()

from api.index import _normalize_path, _restore_path
from django.urls import resolve


def make_environ(query_string):
    return {
        "QUERY_STRING": query_string,
        "PATH_INFO": "/",
        "REQUEST_URI": "/",
        "SCRIPT_NAME": "",
    }


def check(label, actual, expected):
    ok = actual == expected
    status = "PASS" if ok else "FAIL"
    print("  [{}] {}".format(status, label))
    if not ok:
        print("         got: {!r}".format(actual))
        print("         expected: {!r}".format(expected))
    return ok


print("=" * 60)
print("Layer 1: _normalize_path()")
print("=" * 60)
all_pass = True
all_pass &= check("_normalize_path('/api/auth/token/')", _normalize_path("/api/auth/token/"), "/api/auth/token/")
all_pass &= check("_normalize_path('api/auth/token/')", _normalize_path("api/auth/token/"), "/api/auth/token/")
all_pass &= check("_normalize_path('//api/auth/token/')", _normalize_path("//api/auth/token/"), "/api/auth/token/")
all_pass &= check("_normalize_path('')", _normalize_path(""), "/")
all_pass &= check("_normalize_path('/')", _normalize_path("/"), "/")
all_pass &= check("_normalize_path('/admin/core/contribution/add/')",
                  _normalize_path("/admin/core/contribution/add/"), "/admin/core/contribution/add/")
all_pass &= check("_normalize_path('/api/')", _normalize_path("/api/"), "/api/")
all_pass &= check("_normalize_path('/admin/')", _normalize_path("/admin/"), "/admin/")

print()
print("=" * 60)
print("Layer 2: _restore_path()")
print("=" * 60)

amp = "&"
restore_cases = [
    ("__phg_path=/api/auth/token/", "/api/auth/token/", ""),
    ("__phg_path=/api/", "/api/", ""),
    ("__phg_path=/api/projects/", "/api/projects/", ""),
    ("__phg_path=/admin/", "/admin/", ""),
    ("__phg_path=/admin/login/", "/admin/login/", ""),
    ("__phg_path=/admin/core/contribution/add/", "/admin/core/contribution/add/", ""),
    ("__phg_path=/api/projects/" + amp + "page=2", "/api/projects/", "page=2"),
    ("__phg_path=/admin/core/contribution/" + amp + "q=test", "/admin/core/contribution/", "q=test"),
    ("__phg_path=/api/auth/token", "/api/auth/token", ""),
    ("page=2" + amp + "__phg_path=/api/auth/token/", "/api/auth/token/", "page=2"),
]

for qs, expected_pi, expected_qs in restore_cases:
    env = make_environ(qs)
    _restore_path(env)
    pi_ok = check("qs={!r} -> PATH_INFO".format(qs), env["PATH_INFO"], expected_pi)
    qs_ok = check("qs={!r} -> QUERY_STRING".format(qs), env["QUERY_STRING"], expected_qs)
    script_ok = check("qs={!r} -> SCRIPT_NAME".format(qs), env["SCRIPT_NAME"], "")
    all_pass &= pi_ok and qs_ok and script_ok

env = make_environ("q=search")
original_pi = env["PATH_INFO"]
_restore_path(env)
no_phg_ok = check("no __phg_path leaves PATH_INFO unchanged", env["PATH_INFO"], original_pi)
all_pass &= no_phg_ok

env = make_environ("")
original_pi = env["PATH_INFO"]
_restore_path(env)
empty_qs_ok = check("empty query string leaves PATH_INFO unchanged", env["PATH_INFO"], original_pi)
all_pass &= empty_qs_ok

print()
print("=" * 60)
print("Layer 3: Django URL resolution")
print("=" * 60)

resolve_cases = [
    ("/api/auth/token/", "token_obtain"),
    ("/api/auth/token/refresh/", "token_refresh"),
    ("/api/auth/signup/", "signup"),
    ("/api/summary/", "summary"),
    ("/api/projects/", "project"),
    ("/admin/", "admin:index"),
    ("/admin/core/contribution/add/", "admin:core_contribution_add"),
    ("/", "home"),
    ("/about/", "about"),
    ("/terms/", "terms"),
]

for path, expected_view in resolve_cases:
    try:
        match = resolve(path)
        view_name = match.view_name
        ok = expected_view in view_name or view_name == expected_view
        status = "PASS" if ok else "FAIL"
        print("  [{}] resolve({!r}) -> {!r}".format(status, path, view_name))
        if not ok:
            print("         expected view_name containing: {!r}".format(expected_view))
        all_pass &= ok
    except Exception as exc:
        status = "FAIL"
        print("  [{}] resolve({!r}) raised: {!r}".format(status, path, exc))
        all_pass = False

print()
print("=" * 60)
if all_pass:
    print("ALL TESTS PASSED")
else:
    print("SOME TESTS FAILED")
    sys.exit(1)