"""
WSGI entrypoint (used by gunicorn locally and by the Django management
commands). api/index.py creates its own WSGI app for Vercel - this module
is only used by local development and gunicorn.
"""
import os
import sys

# Repository root: config / core / website packages live here.
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()
