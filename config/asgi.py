"""ASGI entrypoint for Vercel Services backend.

Serves the existing Django WSGI application through the Python runtime.
Vercel Services routes /api/* and /admin/* to this service; Django's
config/urls.py resolves them natively via path("admin/", ...) and
path("api/", include("core.urls")). No __phg_path forwarding is required
because the service receives the original request path.
"""
import os
import sys
from pathlib import Path

# Repository root: config / core / website packages live here.
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from django.core.asgi import get_asgi_application

application = get_asgi_application()