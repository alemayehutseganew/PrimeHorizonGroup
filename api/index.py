"""Vercel serverless entrypoint for the Django API.

Routing facts established by live testing on this deployment:
  * a per-file function in api/ is addressable at /api/index (rewrite
    destination) and natively at /api (exact);
  * a rewrite does NOT hand the original request path to the function,
    so /api/<rest> is forwarded as ?__phg_path=/<rest> and restored
    as PATH_INFO here before Django resolves the URL.

Both ``application`` (WSGI convention) and ``app`` (Vercel convention)
are exposed for compatibility.
"""
import os
import re
import sys
from pathlib import Path
from urllib.parse import unquote

PROJECT_ROOT = Path(__file__).resolve().parent.parent
# Repository root: `config` / `core` packages live here.
sys.path.insert(0, str(PROJECT_ROOT))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from django.core.wsgi import get_wsgi_application

_django_app = get_wsgi_application()
_PHG_PATH = re.compile(r"(?:^|&)__phg_path=([^&]*)")


def application(environ, start_response):
    match = _PHG_PATH.search(environ.get("QUERY_STRING", ""))
    if match:
        restored = unquote(match.group(1))
        if restored and restored != "/":
            # Every API URL pattern in core/urls.py ends with a slash.
            if not restored.endswith("/"):
                restored += "/"
            environ["PATH_INFO"] = restored
        elif restored == "/":
            environ["PATH_INFO"] = "/"
    return _django_app(environ, start_response)


app = application
