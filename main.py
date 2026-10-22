"""Vercel entrypoint (repo root).

With Vercel's official Django architecture, routing is handled automatically:
Vercel detects manage.py and uses the WSGI_APPLICATION setting. This file
is kept as a fallback entrypoint for backward compatibility only.
"""
import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent
# Repository root: `config` / `core` packages live here.
sys.path.insert(0, str(PROJECT_ROOT))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()
app = application
