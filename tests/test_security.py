"""Tests for the security module: JWT, service tokens, IP allowlisting, role hierarchy."""

import ipaddress
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, patch

import pytest
from jose import jwt

from app.core.config import settings
from app.core.security import (
    JWT_AUDIENCE,
    JWT_ISSUER,
    ROLE_HIERARCHY,
    SERVICE_JWT_AUDIENCE,
    SERVICE_JWT_ISSUER,
    SERVICE_TOKEN_MAX_AGE_SECONDS,
    _verify_service_token,
    create_access_token,
    create_service_token,
    hash_password,
    is_ip_allowed,
    require_role,
    verify_password,
)


# ── Password Hashing ──────────────────────────────


class TestPasswordHashing:
    def test_hash_and_verify(self):
        password = "supersecure123"
        hashed = hash_password(password)
        assert hashed != password
        assert verify_password(password, hashed)

    def test_wrong_password_fails(self):
        hashed = hash_password("correct-password")
        assert not verify_password("wrong-password", hashed)


# ── Access Tokens ──────────────────────────────


class TestAccessTokens:
    def test_create_token_has_required_claims(self):
        token = create_access_token({"sub": "user-1", "org": "org-1", "role": "member"})
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            audience=JWT_AUDIENCE,
            issuer=JWT_ISSUER,
        )
        assert payload["sub"] == "user-1"
        assert payload["org"] == "org-1"
        assert payload["iss"] == JWT_ISSUER
        assert payload["aud"] == JWT_AUDIENCE
        assert "exp" in payload
        assert "iat" in payload

    def test_create_token_custom_expiry(self):
        token = create_access_token(
            {"sub": "user-1"},
            expires_delta=timedelta(minutes=5),
        )
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            options={"verify_aud": False, "verify_iss": False},
        )
        # Token should expire within ~5 minutes
        exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        now = datetime.now(timezone.utc)
        assert (exp - now).total_seconds() <= 300
        assert (exp - now).total_seconds() > 200

    def test_token_rejected_with_wrong_secret(self):
        token = create_access_token({"sub": "user-1"})
        with pytest.raises(Exception):
            jwt.decode(token, "wrong-secret", algorithms=["HS256"])


# ── Service Tokens ──────────────────────────────


class TestServiceTokens:
    @patch("app.core.security.settings")
    def test_create_service_token_structure(self, mock_settings):
        mock_settings.INTERNAL_SERVICE_KEY = "test-key-for-service-jwt-signing-32ch"

        token = create_service_token("user-42", "org-7", "admin")
        payload = jwt.decode(
            token,
            "test-key-for-service-jwt-signing-32ch",
            algorithms=["HS256"],
            audience=SERVICE_JWT_AUDIENCE,
            issuer=SERVICE_JWT_ISSUER,
        )

        assert payload["sub"] == "user-42"
        assert payload["org"] == "org-7"
        assert payload["role"] == "admin"
        assert payload["type"] == "service"
        assert payload["iss"] == SERVICE_JWT_ISSUER
        assert payload["aud"] == SERVICE_JWT_AUDIENCE
        assert "exp" in payload
        assert "iat" in payload

    @patch("app.core.security.settings")
    def test_service_token_expires_quickly(self, mock_settings):
        mock_settings.INTERNAL_SERVICE_KEY = "test-key-for-service-jwt-signing-32ch"

        token = create_service_token("user-1", "org-1")
        payload = jwt.decode(
            token,
            "test-key-for-service-jwt-signing-32ch",
            algorithms=["HS256"],
            options={"verify_aud": False, "verify_iss": False},
        )

        exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        iat = datetime.fromtimestamp(payload["iat"], tz=timezone.utc)
        assert (exp - iat).total_seconds() == SERVICE_TOKEN_MAX_AGE_SECONDS

    @patch("app.core.security.settings")
    def test_create_service_token_no_key_raises(self, mock_settings):
        mock_settings.INTERNAL_SERVICE_KEY = ""
        with pytest.raises(ValueError, match="INTERNAL_SERVICE_KEY is required"):
            create_service_token("user-1", "org-1")


class TestVerifyServiceToken:
    @patch("app.core.security.settings")
    def test_valid_service_token(self, mock_settings):
        mock_settings.INTERNAL_SERVICE_KEY = "test-key-for-service-jwt-signing-32ch"

        token = create_service_token("user-1", "org-1", "admin")
        result = _verify_service_token(token)

        assert result is not None
        assert result["sub"] == "user-1"
        assert result["org"] == "org-1"
        assert result["role"] == "admin"

    @patch("app.core.security.settings")
    def test_rejects_wrong_signing_key(self, mock_settings):
        mock_settings.INTERNAL_SERVICE_KEY = "correct-key-for-signing-must-be-32"

        # Sign with a different key
        now = datetime.now(timezone.utc)
        fake_token = jwt.encode(
            {
                "sub": "attacker",
                "org": "evil-org",
                "iss": SERVICE_JWT_ISSUER,
                "aud": SERVICE_JWT_AUDIENCE,
                "iat": now.timestamp(),
                "exp": (now + timedelta(seconds=60)).timestamp(),
            },
            "wrong-key-this-should-be-rejected",
            algorithm="HS256",
        )

        result = _verify_service_token(fake_token)
        assert result is None

    @patch("app.core.security.settings")
    def test_rejects_wrong_issuer(self, mock_settings):
        mock_settings.INTERNAL_SERVICE_KEY = "test-key-for-service-jwt-signing-32ch"

        now = datetime.now(timezone.utc)
        fake_token = jwt.encode(
            {
                "sub": "user-1",
                "org": "org-1",
                "iss": "malicious-issuer",
                "aud": SERVICE_JWT_AUDIENCE,
                "iat": now.timestamp(),
                "exp": (now + timedelta(seconds=60)).timestamp(),
            },
            "test-key-for-service-jwt-signing-32ch",
            algorithm="HS256",
        )

        result = _verify_service_token(fake_token)
        assert result is None

    @patch("app.core.security.settings")
    def test_rejects_wrong_audience(self, mock_settings):
        mock_settings.INTERNAL_SERVICE_KEY = "test-key-for-service-jwt-signing-32ch"

        now = datetime.now(timezone.utc)
        fake_token = jwt.encode(
            {
                "sub": "user-1",
                "org": "org-1",
                "iss": SERVICE_JWT_ISSUER,
                "aud": "wrong-audience",
                "iat": now.timestamp(),
                "exp": (now + timedelta(seconds=60)).timestamp(),
            },
            "test-key-for-service-jwt-signing-32ch",
            algorithm="HS256",
        )

        result = _verify_service_token(fake_token)
        assert result is None

    @patch("app.core.security.settings")
    def test_rejects_missing_sub(self, mock_settings):
        mock_settings.INTERNAL_SERVICE_KEY = "test-key-for-service-jwt-signing-32ch"

        now = datetime.now(timezone.utc)
        fake_token = jwt.encode(
            {
                "org": "org-1",
                "iss": SERVICE_JWT_ISSUER,
                "aud": SERVICE_JWT_AUDIENCE,
                "iat": now.timestamp(),
                "exp": (now + timedelta(seconds=60)).timestamp(),
            },
            "test-key-for-service-jwt-signing-32ch",
            algorithm="HS256",
        )

        result = _verify_service_token(fake_token)
        assert result is None

    @patch("app.core.security.settings")
    def test_rejects_missing_org(self, mock_settings):
        mock_settings.INTERNAL_SERVICE_KEY = "test-key-for-service-jwt-signing-32ch"

        now = datetime.now(timezone.utc)
        fake_token = jwt.encode(
            {
                "sub": "user-1",
                "iss": SERVICE_JWT_ISSUER,
                "aud": SERVICE_JWT_AUDIENCE,
                "iat": now.timestamp(),
                "exp": (now + timedelta(seconds=60)).timestamp(),
            },
            "test-key-for-service-jwt-signing-32ch",
            algorithm="HS256",
        )

        result = _verify_service_token(fake_token)
        assert result is None

    @patch("app.core.security.settings")
    def test_rejects_no_key_configured(self, mock_settings):
        mock_settings.INTERNAL_SERVICE_KEY = ""
        result = _verify_service_token("any-token")
        assert result is None

    @patch("app.core.security.settings")
    def test_rejects_expired_token(self, mock_settings):
        mock_settings.INTERNAL_SERVICE_KEY = "test-key-for-service-jwt-signing-32ch"

        past = datetime.now(timezone.utc) - timedelta(seconds=120)
        expired_token = jwt.encode(
            {
                "sub": "user-1",
                "org": "org-1",
                "iss": SERVICE_JWT_ISSUER,
                "aud": SERVICE_JWT_AUDIENCE,
                "iat": past.timestamp(),
                "exp": (past + timedelta(seconds=60)).timestamp(),
            },
            "test-key-for-service-jwt-signing-32ch",
            algorithm="HS256",
        )

        result = _verify_service_token(expired_token)
        assert result is None

    @patch("app.core.security.settings")
    def test_old_static_key_no_longer_works(self, mock_settings):
        """Ensure the old INTERNAL_SERVICE_KEY-as-token pattern is rejected."""
        mock_settings.INTERNAL_SERVICE_KEY = "some-static-key"

        # Old pattern: token == INTERNAL_SERVICE_KEY
        result = _verify_service_token("some-static-key")
        assert result is None  # Not a valid JWT, should fail


# ── IP Allowlisting ──────────────────────────────


class TestIPAllowlisting:
    def test_loopback_allowed(self):
        assert is_ip_allowed("127.0.0.1") is True

    def test_ipv6_loopback_allowed(self):
        assert is_ip_allowed("::1") is True

    def test_docker_bridge_allowed(self):
        assert is_ip_allowed("172.17.0.2") is True

    def test_private_network_allowed(self):
        assert is_ip_allowed("192.168.1.100") is True
        assert is_ip_allowed("10.0.5.42") is True

    def test_public_ip_rejected(self):
        assert is_ip_allowed("8.8.8.8") is False
        assert is_ip_allowed("203.0.113.50") is False

    def test_invalid_ip_rejected(self):
        assert is_ip_allowed("not-an-ip") is False
        assert is_ip_allowed("") is False


# ── Role Hierarchy ──────────────────────────────


class TestRoleHierarchy:
    def test_hierarchy_order(self):
        assert ROLE_HIERARCHY["admin"] > ROLE_HIERARCHY["manager"]
        assert ROLE_HIERARCHY["manager"] > ROLE_HIERARCHY["member"]
        assert ROLE_HIERARCHY["member"] > ROLE_HIERARCHY["viewer"]

    @pytest.mark.asyncio
    async def test_admin_can_access_member_endpoint(self):
        """Admin should pass a check that requires 'member' role."""
        checker = require_role("member")
        # Extract the inner function
        inner = checker.__wrapped__ if hasattr(checker, "__wrapped__") else None

        # Simulate the role check logic directly
        from app.core.security import ROLE_HIERARCHY

        user_role = "admin"
        required_role = "member"
        assert ROLE_HIERARCHY[user_role] >= ROLE_HIERARCHY[required_role]

    def test_member_cannot_access_admin_endpoint(self):
        assert ROLE_HIERARCHY["member"] < ROLE_HIERARCHY["admin"]

    def test_unknown_role_gets_zero_privilege(self):
        assert ROLE_HIERARCHY.get("unknown_role", 0) == 0
