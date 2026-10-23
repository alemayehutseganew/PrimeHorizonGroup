#!/bin/bash
# Vercel build steps — kept out of vercel.json to respect the 256-char limit.
set -e

# Ensure the project root is on the Python path and Django settings are
# discovered without the --settings flag.
export PYTHONPATH="${PYTHONPATH:-}:."
export DJANGO_SETTINGS_MODULE=config.settings

# Diagnostic: first line of the build log tells us whether the database
# URL reaches this build (value itself is never printed).
python -c "import os; print('DBURL_PRESENT=' + str(bool(os.environ.get('DATABASE_URL'))))"

pip install --break-system-packages -r requirements.txt
# Vercel pre-installs deps with a different interpreter (3.14) while the app
# runs on 3.12: pure-Python wheels survive that, but psycopg2-binary's compiled
# extension does not ("No module named 'psycopg2._psycopg'"). Reinstall it for
# the interpreter that actually runs this script and manage.py.
python -m pip install --break-system-packages --force-reinstall --no-cache-dir --no-deps psycopg2-binary

python manage.py migrate --noinput

# Create the first production superuser from PHG_SUPERUSER_* env vars.
# No-op unless (a) no superuser exists yet and (b) the variables are set in
# Vercel. Never overwrites an existing admin or password.
python manage.py ensure_superuser

# --- ROLE-TEST ACCOUNTS PROVISIONING ---
# Only execute when PHG_ROLE_TEST_PASSWORD is set in Vercel Environment Variables.
# This prevents accidental runs against SQLite in local/dev environments.
if [ -n "$PHG_ROLE_TEST_PASSWORD" ]; then
    echo "Ensuring role test users..."
    python manage.py ensure_role_test_users
else
    echo "PHG_ROLE_TEST_PASSWORD not configured; skipping role test users."
fi

# NOTE: seed_demo intentionally removed from production builds.
# Demo/sample business records must never be auto-seeded in production.
# The portal loads real data from the Django REST API against PostgreSQL.
python manage.py collectstatic --noinput
