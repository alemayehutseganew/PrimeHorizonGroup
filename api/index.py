"""Vercel serverless entrypoint for the Django API.

Vercel's Python runtime imports this file and serves the WSGI callable
for every request rewritten to /api/*. Both ``application`` (WSGI
convention) and ``app`` (Vercel convention) are exposed.
"""
import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = PROJECT_ROOT / "backend"

# Make `backend/` importable as `config` / `core` packages live under it.
sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()
app = application
