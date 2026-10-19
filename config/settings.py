"""Prime Horizon Group Plc — API settings.

Deployment model:
  * Local dev  → SQLite, DEBUG on, CORS open for localhost ports.
  * Vercel     → Postgres via DATABASE_URL env var (Vercel Postgres),
                 DEBUG off, WhiteNoise for static files.
"""
import os
from datetime import timedelta
from pathlib import Path

import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get("SECRET_KEY", "django-insecure-local-dev-only-change-me")
if os.environ.get("VERCEL") and SECRET_KEY.startswith("django-insecure-"):
    raise RuntimeError("SECRET_KEY must be set to a long random value in Vercel env.")
# Local dev defaults to True; Vercel defaults to False (production-safe).
DEBUG = os.environ.get(
    "DEBUG", "False" if os.environ.get("VERCEL") else "True",
).lower() in ("1", "true", "yes")
if os.environ.get("VERCEL") and DEBUG:
    raise RuntimeError("DEBUG must be False on Vercel production.")

# Hosts / origins -----------------------------------------------------------
_default_hosts = ["127.0.0.1", "localhost"]
_vercel_url = os.environ.get("VERCEL_URL", "")
if _vercel_url:
    _default_hosts.append(_vercel_url)
ALLOWED_HOSTS = [
    h.strip() for h in os.environ.get("ALLOWED_HOSTS", "").split(",") if h.strip()
] or _default_hosts
if os.environ.get("VERCEL"):
    # Vercel sets VERCEL=1 in both build and runtime environments.
    if ".vercel.app" not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append(".vercel.app")

_cors_env = os.environ.get("CORS_ALLOWED_ORIGINS", "")
CORS_ALLOWED_ORIGINS = [
    o.strip() for o in _cors_env.split(",") if o.strip()
] or ["http://127.0.0.1:8000", "http://localhost:8000", "http://127.0.0.1:5500", "http://localhost:5500"]
if _vercel_url:
    CORS_ALLOWED_ORIGINS.append(f"https://{_vercel_url}")
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
CORS_ALLOW_HEADERS = ["content-type", "authorization", "content-length", "accept", "origin", "x-requested-with", "sec-fetch-mode", "sec-fetch-site", "user-agent", "cache-control"]


# Applications ---------------------------------------------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "django_filters",
    "core.apps.CoreConfig",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "website"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# Database -------------------------------------------------------------------
# Vercel-Neon integration injects POSTGRES_URL_NON_POOLING / POSTGRES_URL
# automatically when connected; an explicit DATABASE_URL still wins.
_db_url = (
    os.environ.get("DATABASE_URL", "").strip()
    or os.environ.get("POSTGRES_URL_NON_POOLING", "").strip()
    or os.environ.get("POSTGRES_URL", "").strip()
)
if _db_url:
    # Serverless (Vercel): never reuse connections across invocations —
    # a pooled connection held warm between requests goes stale and the
    # next write fails with a 500 while reads still succeed.
    # conn_max_age=0 closes each connection after its request.
    # Prefer the UNPOOLED (direct) Neon host for full Django/psycopg2
    # compat — the pooler URL is only a last-resort fallback here.
    _db_cfg = dj_database_url.parse(
        _db_url,
        conn_max_age=int(os.environ.get("DB_CONN_MAX_AGE", "0")),
        conn_health_checks=True,
        ssl_require=True,
    )
    # libpq's `channel_binding` keyword (present in Neon dashboard URLs)
    # is not understood by every psycopg2/libpq build and breaks connects
    # through pgbouncer. Plain SCRAM-over-TLS still applies without it.
    _db_cfg.get("OPTIONS", {}).pop("channel_binding", None)
    DATABASES = {"default": _db_cfg}
else:
    if os.environ.get("VERCEL"):
        # Loud, early failure instead of a silent read-only SQLite: on Vercel
        # the bundled sqlite lives in the immutable /var/task bundle — reads
        # work but every write fails with "attempt to write a readonly database".
        raise RuntimeError(
            "No Postgres connection string found. Set DATABASE_URL "
            "(or connect the Neon integration so POSTGRES_URL_NON_POOLING "
            "is injected) in Vercel Project Settings -> Environment "
            "Variables (value must start with postgresql://), then redeploy."
        )
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }


# Auth -----------------------------------------------------------------------
AUTH_USER_MODEL = "core.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
     "OPTIONS": {"min_length": 8}},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Africa/Addis_Ababa"
USE_I18N = True
USE_TZ = True


# Static files ---------------------------------------------------------------
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [
    BASE_DIR / "website" / "css",
    BASE_DIR / "website" / "js",
]
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {
        "BACKEND": "django.core.files.storage.FileSystemStorage"
    },
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# DRF ------------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 100,
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {"anon": "60/minute", "user": "600/minute"},
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": True,
}


# Business constants (SRS planning scenario) ----------------------------------
SHARE_PRICE_ETB = int(os.environ.get("SHARE_PRICE_ETB", "250000"))
