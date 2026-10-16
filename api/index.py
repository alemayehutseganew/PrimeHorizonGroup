"""Vercel serverless entrypoint for the Django API.

Vercel's Python runtime imports this file and serves the ``app`` object
for every request rewritten to /api/*.
"""
import os
import sys

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
# Make `backend/` importable as `config` / `core` packages live under it.
sys.path.insert(0, os.path.join(PROJECT_ROOT, "backend"))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from django.core.wsgi import get_wsgi_application

app = get_wsgi_application()
