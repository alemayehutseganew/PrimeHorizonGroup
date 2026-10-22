"""Management command to create dedicated role-test accounts.

Creates exactly six test accounts (admin, gm, finance, transport, projects, shareholder)
in the production Neon PostgreSQL database. Requires PHG_ROLE_TEST_PASSWORD environment
variable. Aborts with a clear error if the database engine is not PostgreSQL.

Usage:
    python manage.py ensure_role_test_users

Password from env var: PHG_ROLE_TEST_PASSWORD

Never creates AUDITOR or SALES accounts in production.
"""
import os
import sys

from django.core.management.base import BaseCommand, CommandError
from django.db import connection
from django.contrib.auth import get_user_model

from core.models import Role

User = get_user_model()

# Exactly six test accounts — no auditor, no sales in production
TEST_ACCOUNTS = [
    ("admin", "admin.test@primehorizon.local", Role.ADMIN),
    ("gm", "gm.test@primehorizon.local", Role.GM),
    ("finance", "finance.test@primehorizon.local", Role.FINANCE),
    ("transport", "transport.test@primehorizon.local", Role.TRANSPORT),
    ("projects", "projects.test@primehorizon.local", Role.PROJECTS),
    ("shareholder", "shareholder.test@primehorizon.local", Role.SHAREHOLDER),
]


class Command(BaseCommand):
    help = "Create dedicated role-test accounts for portal CRUD verification."

    def handle(self, *args, **options):
        # STEP 1: Verify PostgreSQL engine — abort on SQLite
        engine = connection.settings_dict["ENGINE"]
        if engine != "django.db.backends.postgresql":
            raise CommandError(
                f"STOPPED: Engine is {engine}, not PostgreSQL. "
                "Set DATABASE_URL env var for Neon production database. "
                "Do NOT run this command against SQLite."
            )

        # STEP 2: Require PHG_ROLE_TEST_PASSWORD
        password = os.environ.get("PHG_ROLE_TEST_PASSWORD", "")
        if not password:
            raise CommandError(
                "PHG_ROLE_TEST_PASSWORD environment variable is not set. "
                "Configure it in Vercel Project Settings > Environment Variables "
                "and redeploy, or set it locally before running this command."
            )

        # STEP 3: Create/verify each test account — idempotent get_or_create
        for username, email, role in TEST_ACCOUNTS:
            user, created = User.objects.get_or_create(email=email, defaults={
                "username": username,
                "role": role,
                "status": "Active",
                "is_active": True,
            })
            if not created:
                # Update fields if account already exists but needs syncing
                updated = False
                if user.username != username:
                    user.username = username
                    updated = True
                if str(user.role) != str(role):
                    user.role = role
                    updated = True
                if user.status != "Active":
                    user.status = "Active"
                    updated = True
                if user.is_active != True:
                    user.is_active = True
                    updated = True
                if updated:
                    user.save(update_fields=["username", "role", "status", "is_active"])
            # Set password using set_password (hashes it properly)
            user.set_password(password)
            user.save(update_fields=["password"])

        # STEP 4: Report — never print passwords, hashes, or credentials
        self.stdout.write(
            self.style.SUCCESS(
                f"Ensured {len(TEST_ACCOUNTS)} role-test accounts in PostgreSQL "
                f"(engine={connection.settings_dict['ENGINE']})."
            )
        )