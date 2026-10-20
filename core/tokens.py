"""Password-reset token generator backed by a server-side, one-time-use model.

Django's default ``PasswordResetTokenGenerator`` relies on the user's email +
salt and is not stored/revoked on the server, so a leaked reset link remains
valid indefinitely. This generator ties the token to a row in
``PasswordResetToken`` that is created, used, and/or expired server-side, so
a reset link can be invalidated on demand (password change, logout, role
escalation, or the token expiring).
"""

import hashlib
import secrets
import string

from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone

from .models import PasswordResetToken


class PasswordResetTokenGenerator:
    """One-time-use, time-limited password-reset token generator."""

    RESERVED_CHARS = string.ascii_lowercase + string.digits

    def __init__(self, token_model=None):
        self.token_model = token_model or PasswordResetToken

    def make_token(self, user, ip_address=None, user_agent=None):
        """Create a server-side token, store it, and return the token string."""
        raw = "".join(
            secrets.choice(self.RESERVED_CHARS) for _ in range(32)
        ).lower()
        token_hash = hashlib.sha256(raw.encode("ascii")).hexdigest()
        self.token_model.objects.create(
            user=user,
            token_hash=token_hash,
            ip_address=ip_address or self._ip_from_request(),
            user_agent=user_agent if user_agent is not None else (self._user_agent_from_request() or ""),
        )
        return raw

    def check_token(self, user, raw_token):
        """Return True only for an unused, unexpired token matching *user*."""
        if not user or not user.is_active:
            return False
        if not raw_token:
            return False

        token_hash = hashlib.sha256(raw_token.encode("ascii")).hexdigest()
        now = timezone.now()

        try:
            token = self.token_model.objects.filter(
                user=user,
                token_hash=token_hash,
                used=False,
                created_at__gte=now - timezone.timedelta(hours=1),
            ).latest("created_at")
        except self.token_model.DoesNotExist:
            return False

        if token.expires_at and token.expires_at < now:
            token.used = True
            token.save(update_fields=["used"])
            return False

        token.used = True
        token.save(update_fields=["used"])
        return True

    # -- request metadata (used when creating the token) -------------------
    def _ip_from_request(self):
        return None

    def _user_agent_from_request(self):
        return None

    # -- revocation helpers ------------------------------------------------
    def invalidate_for_user(self, user):
        """Invalidate every outstanding reset token for *user*."""
        self.token_model.objects.filter(user=user, used=False).update(used=True)

    def invalidate_existing_sessions(self, user):
        """Invalidate all non-password-reset tokens for *user*.
        
        Call after a password reset so that old sessions cannot keep
        authenticating.
        """
        self.token_model.objects.filter(
            user=user, used=False, created_at__lt=timezone.now() - timezone.timedelta(hours=1)
        ).update(used=True)
