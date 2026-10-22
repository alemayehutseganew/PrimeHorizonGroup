"""Vercel serverless entrypoint for the Django API.

Routes /api/* and /admin/* to this function via vercel.json rewrites.
The original request path is forwarded via the __phg_path query parameter
and restored here before Django processes the WSGI request.
"""
import os
import sys
from pathlib import Path
from urllib.parse import unquote

PROJECT_ROOT = Path(__file__).resolve().parent.parent
# Repository root: `config` / `core` packages live here.
sys.path.insert(0, str(PROJECT_ROOT))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from django.core.wsgi import get_wsgi_application

_django_app = get_wsgi_application()


def _normalize_path(path):
    """Ensure exactly one leading slash; preserve trailing slash."""
    if not path:
        return "/"
    # URL-decode the forwarded path.
    path = unquote(path)
    # Ensure exactly one leading slash.
    if not path.startswith("/"):
        path = "/" + path
    while path.startswith("//"):
        path = path[1:]
    return path


def _restore_path(environ):
    """Read __phg_path from the query string, restore PATH_INFO, strip it."""
    qs = environ.get("QUERY_STRING", "")
    if not qs:
        return

    params = []
    phg_path = None
    for part in qs.split("&"):
        if not part:
            continue
        if "=" in part:
            key, value = part.split("=", 1)
        else:
            key, value = part, ""
        if key == "__phg_path":
            phg_path = value
        else:
            params.append((key, value))

    if phg_path is None:
        return

    normalized = _normalize_path(phg_path)
    environ["PATH_INFO"] = normalized
    # Some WSGI adapters also consult REQUEST_URI / RAW_PATH_INFO.
    if "REQUEST_URI" in environ:
        # Keep REQUEST_URI consistent with the restored path + remaining qs.
        remaining = "&".join(
            f"{k}={v}" if v != "" else k for k, v in params
        )
        environ["REQUEST_URI"] = normalized + (("?" + remaining) if remaining else "")
    # Rebuild QUERY_STRING without __phg_path.
    environ["QUERY_STRING"] = "&".join(
        f"{k}={v}" if v != "" else k for k, v in params
    )
    # Ensure SCRIPT_NAME is empty so Django sees the full path.
    environ["SCRIPT_NAME"] = ""


def app(environ, start_response):
    _restore_path(environ)
    return _django_app(environ, start_response)


# Vercel looks for 'app', 'application', or 'handler'.
application = app
handler = app