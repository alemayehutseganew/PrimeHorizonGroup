"""
DRF serializers for authentication endpoints. Field names match the
frontend data.js shape.
"""

import hashlib

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils import timezone

from rest_framework import serializers

from .models import (
    EmailVerification,
    PasswordResetToken,
    SessionRevocation,
    User,
)
from .authentication import SESSION_VERSION_CLAIM, get_token_user
from .tokens import PasswordResetTokenGenerator

class UserRegistrationSerializer(serializers.Serializer):
    """Public signup: email, username, password. No role/privilege fields."""

    email = serializers.EmailField(write_only=True)
    username = serializers.CharField(min_length=3, max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("That username is already taken.")
        return value

    def validate_password(self, value):
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value

    def create(self, validated_data):
        email = validated_data.pop("email")
        username = validated_data.pop("username")
        password = validated_data.pop("password")
        return User.objects.create_user(
            username=username,
            email=email,
            password=password,
            is_active=False,  # activate via email verification or admin approval
        )

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.strip().lower()

    def save(self, **kwargs):
        email = self.validated_data["email"]
        user = User.objects.filter(email=email).first()
        if user is None:
            # Return the same result whether or not the account exists.
            return None
        generator = PasswordResetTokenGenerator()
        self.reset_token = generator.make_token(
            user,
            ip_address=kwargs.get("ip_address"),
            user_agent=kwargs.get("user_agent"),
        )
        return user


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    password_confirmation = serializers.CharField(write_only=True, min_length=8)

    def validate(self, data):
        if data["new_password"] != data["password_confirmation"]:
            raise serializers.ValidationError({"password_confirmation": "Passwords do not match."})
        return data

    def save(self, **kwargs):
        raw_token = self.validated_data["token"]
        new_password = self.validated_data["new_password"]
        token_instance = PasswordResetToken.objects.filter(
            token_hash=hashlib.sha256(raw_token.encode("ascii")).hexdigest(),
            used=False,
            expires_at__gt=timezone.now(),
        ).first()
        if token_instance is None:
            raise serializers.ValidationError("Invalid, expired, or already-used reset token.")
        user = token_instance.user
        user.set_password(new_password)
        # Bump the session version so all existing sessions are revoked.
        user.session_version = (user.session_version or 0) + 1
        user.save(update_fields=["password", "session_version"])
        SessionRevocation.next_revision(user)
        token_instance.used = True
        token_instance.save(update_fields=["used"])
        return user


class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    password_confirmation = serializers.CharField(write_only=True, min_length=8)

    def validate(self, data):
        if data["new_password"] != data["password_confirmation"]:
            raise serializers.ValidationError({"password_confirmation": "Passwords do not match."})
        user = self.context["request"].user
        if not user.check_password(data["current_password"]):
            raise serializers.ValidationError({"current_password": "Current password is incorrect."})
        try:
            validate_password(data["new_password"], user=user)
        except ValidationError as e:
            raise serializers.ValidationError({"new_password": e.messages})
        return data

    def save(self, **kwargs):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.session_version = (user.session_version or 0) + 1
        user.save(update_fields=["password", "session_version"])
        SessionRevocation.next_revision(user)
        return user


class EmailVerificationSerializer(serializers.Serializer):
    token = serializers.CharField(write_only=True)

    def validate(self, data):
        token_str = data["token"]
        token_obj = EmailVerification.objects.filter(
            token=token_str,
            used=False,
            expires_at__gt=timezone.now(),
        ).first()
        if token_obj is None:
            raise serializers.ValidationError("Invalid or expired verification token.")
        data["user"] = token_obj.user
        return data

    def save(self, **kwargs):
        user = self.validated_data["user"]
        token_obj = EmailVerification.objects.get(user=user, token=self.validated_data["token"])
        token_obj.used = True
        token_obj.save(update_fields=["used"])
        user.is_active = True
        if not user.email:
            user.email = kwargs.get("email")
        user.save(update_fields=["is_active", "email"])
        return user


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(write_only=True)

    def validate(self, data):
        refresh_token = data.get("refresh")
        if not refresh_token:
            raise serializers.ValidationError({"refresh": "Refresh token is required."})
        # Attach the token string to the instance for the view to blacklist.
        self._refresh_token = refresh_token
        return data

    def save(self, **kwargs):
        # The blacklist is performed in the view using `verify_token`,
        # so this serializer only validates and returns the token.
        return self._refresh_token


class UserProfileSerializer(serializers.ModelSerializer):
    """Safe profile fields returned by /auth/me/. Never exposes password."""

    name = serializers.SerializerMethodField()
    title = serializers.CharField(source="role_label", read_only=True)

    class Meta:
        model = User
        fields = [
            "id", "email", "username", "name", "title", "role", "phone",
            "status", "last_login",
        ]
        read_only_fields = fields

    def get_name(self, obj):
        return obj.get_full_name() or obj.email


class TokenInputSerializer(serializers.Serializer):
    """Credentials for sign-in. Accepts either email or username."""

    email = serializers.EmailField(required=False, allow_blank=True)
    username = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        email = (data.get("email") or "").strip()
        username = (data.get("username") or "").strip()
        if not email and not username:
            raise serializers.ValidationError("An email address or username is required.")
        if email and "@" not in email:
            raise serializers.ValidationError("A valid email address is required.")
        if username and " " in username:
            raise serializers.ValidationError("Username must not contain spaces.")
        data["email"] = email or None
        data["username"] = username or None
        return data


class TokenResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    token_type = serializers.CharField(default="Bearer")
    expires_in = serializers.IntegerField()
    role = serializers.CharField()
    status = serializers.CharField()
    user = serializers.DictField()


class SessionVersionTokenRefreshSerializer(serializers.Serializer):
    """Refresh serializer that rejects pre-revocation refresh tokens."""

    refresh = serializers.CharField()
    access = serializers.CharField(read_only=True)

    def validate(self, attrs):
        from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
        from rest_framework_simplejwt.tokens import RefreshToken

        try:
            refresh = RefreshToken(attrs["refresh"])
        except TokenError as e:
            raise InvalidToken(e.args[0] if e.args else "Token is invalid or expired.")

        user = get_token_user(refresh.payload)
        if user is None or not user.is_active:
            raise InvalidToken("Token is invalid or expired.")
        try:
            claimed = int(refresh.payload.get(SESSION_VERSION_CLAIM, 0) or 0)
        except (TypeError, ValueError):
            raise InvalidToken("Token is invalid or expired.")
        if claimed != int(getattr(user, "session_version", 0) or 0):
            raise InvalidToken("Session has been revoked. Please sign in again.")

        data = {"access": str(refresh.access_token)}
        try:
            from rest_framework_simplejwt.settings import api_settings

            if api_settings.ROTATE_REFRESH_TOKENS:
                if api_settings.BLACKLIST_AFTER_ROTATION:
                    try:
                        refresh.blacklist()
                    except AttributeError:
                        pass
                refresh.set_jti()
                refresh.set_exp()
                refresh.set_iat()
                data["refresh"] = str(refresh)
        except (TokenError, AttributeError, KeyError):
            pass
        return data
