#!/bin/bash
# Vercel build steps — kept out of vercel.json to respect the 256-char limit.
set -e

# Diagnostic: first line of the build log tells us whether the database
# URL reaches this build (value itself is never printed).
python -c "import os; print('DBURL_PRESENT=' + str(bool(os.environ.get('DATABASE_URL'))))"

pip install --break-system-packages -r requirements.txt
python manage.py migrate --noinput
python manage.py seed_demo
python manage.py collectstatic --noinput
