"""JWT authentication with server-side session revocation.

Access and refresh tokens carry a ``session_version`` claim. Changing or
resetting a password bumps ``User.session_version`` (alongside the
``SessionRevocation`` high-water mark), so every token minted before the
bump is rejected here and at refresh time.
"""

from django.contrib.auth import get_user_model

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from rest_framework_simplejwt.settings import api_settings

SESSION_VERSION_CLAIM = "session_version"


def get_token_user(payload):
    """Return the user identified by a token payload, or None."""
    User = get_user_model()
    user_id = payload.get(api_settings.USER_ID_CLAIM)
    if user_id in (None, ""):
        return None
    try:
        return User.objects.get(**{api_settings.USER_ID_FIELD: user_id})
    except User.DoesNotExist:
        return None


def check_session_version(payload, user):
    """Raise AuthenticationFailed when the token predates a revocation."""
    if user is None:
        return
    expected = getattr(user, "session_version", None)
    if expected is None:
        # Token-user style object without versioning; nothing to check.
        return
    try:
        claimed = int(payload.get(SESSION_VERSION_CLAIM, 0) or 0)
    except (TypeError, ValueError):
        claimed = -1
    if claimed != int(expected or 0):
        raise AuthenticationFailed(
            "Session has been revoked. Please sign in again.",
            code="session_revoked",
        )


class SessionVersionJWTAuthentication(JWTAuthentication):
    """JWT auth that rejects tokens minted before the latest revocation."""

    def get_user(self, validated_token):
        user = super().get_user(validated_token)
        check_session_version(validated_token, user)
        return user
