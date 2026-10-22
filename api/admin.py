"""Vercel serverless entrypoint for Django admin (no query-param path recovery)."""
import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from django.core.wsgi import get_wsgi_application

_django_app = get_wsgi_application()


def application(environ, start_response):
    # Vercel rewrites /admin (and /admin/*) to this function; restore the
    # original admin path so Django resolves admin.site.urls correctly.
    original = environ.get("PATH_INFO", "/")
    if original.startswith("/api/admin"):
        suffix = original[len("/api/admin"):]
        if not suffix or suffix == "/":
            restored = "/admin/"
        else:
            restored = "/admin" + suffix
            if not restored.endswith("/"):
                restored += "/"
    else:
        restored = "/admin/"
    environ["PATH_INFO"] = restored
    return _django_app(environ, start_response)


app = application