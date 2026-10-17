"""Vercel single catch-all WSGI entrypoint (repo root).

Per Vercel's Python runtime docs, an explicit [tool.vercel] entrypoint in
pyproject.toml makes Vercel run the whole app as one Function that receives
EVERY request with its original path — so Django's URL config serves /api/*
directly (dual-mounted at /api/ and / in config/urls.py) with no rewrites.

The __phg_path recovery is kept as a safety net: if a rewrite ever forwards
the path as a query parameter, it is restored as PATH_INFO here.
"""
import os
import re
import sys
from pathlib import Path
from urllib.parse import unquote

PROJECT_ROOT = Path(__file__).resolve().parent
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
        if restored:
            if restored != "/" and not restored.endswith("/"):
                restored += "/"
            environ["PATH_INFO"] = restored
    return _django_app(environ, start_response)


app = application
