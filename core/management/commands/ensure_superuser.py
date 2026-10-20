"""Create the first production superuser — only if one does not exist.

Safe to run repeatedly and safe to wire into a build: it never overwrites
an existing superuser and never changes anyone's password. Credentials come
from the environment so they never appear in source or shell history:

    PHG_SUPERUSER_EMAIL      (required) login email for the admin
    PHG_SUPERUSER_USERNAME   (required) username for the admin
    PHG_SUPERUSER_PASSWORD   (required) initial password (min 8 chars)

Run against the production database only after confirming the DATABASE_URL
target, e.g. with the Vercel/Neon connection variables present:

    python manage.py ensure_superuser

If the variables are not set the command exits without touching the DB,
so it is harmless to include in vercel-build.sh.
"""
import os
import sys

from django.core.management.base import BaseCommand, CommandError

from core.models import User


class Command(BaseCommand):
    help = "Create a superuser from PHG_SUPERUSER_* env vars if none exists."

    def handle(self, *args, **options):
        if User.objects.filter(is_superuser=True).exists():
            self.stdout.write("Superuser already exists — nothing to do.")
            return

        email = os.environ.get("PHG_SUPERUSER_EMAIL", "").strip().lower()
        username = os.environ.get("PHG_SUPERUSER_USERNAME", "").strip()
        password = os.environ.get("PHG_SUPERUSER_PASSWORD", "")

        missing = [
            name for name, value in (
                ("PHG_SUPERUSER_EMAIL", email),
                ("PHG_SUPERUSER_USERNAME", username),
                ("PHG_SUPERUSER_PASSWORD", password),
            ) if not value
        ]
        if missing:
            # Not an error: the build must not fail just because admin
            # provisioning is handled out-of-band.
            self.stdout.write(
                "No superuser created (missing: " + ", ".join(missing) + ")."
            )
            return

        if len(password) < 8:
            raise CommandError("PHG_SUPERUSER_PASSWORD must be at least 8 characters.")
        if User.objects.filter(email=email).exists():
            raise CommandError(
                "A non-superuser account already exists with that email. "
                "Promote it deliberately instead, e.g. in a Django shell: "
                "u = User.objects.get(email=%r); u.is_staff = True; "
                "u.is_superuser = True; u.role = 'admin'; u.save()" % email
            )

        User.objects.create_superuser(
            username=username, email=email, password=password,
            role="admin", status="Active",
        )
        self.stdout.write(self.style.SUCCESS(
            "Superuser created: " + email + " (role=admin, status=Active)."
        ))
