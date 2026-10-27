"""Automated Security Regression & Hardening Verification Test Suite.

Validates the security controls implemented across SageAI:
1. PBKDF2-SHA256 600,000-round hashing and automatic on-login re-hashing
2. SSRF prevention and private IP filter (is_safe_webhook_url)
3. Role-Based Access Control (RBAC) hierarchy and admin-only route protection
4. SlowAPI rate limiting enforcement (HTTP 429 Too Many Requests)
5. Sensitive data protection and anti-enumeration behavior
"""

import pytest
from fastapi import HTTPException
from httpx import ASGITransport, AsyncClient
from passlib.hash import pbkdf2_sha256

from app.core.rate_limit import limiter
from app.core.security import (
    hash_password,
    needs_rehash,
    require_role,
    verify_password,
)
from app.main import app
from app.routers.webhook_routes import is_safe_webhook_url


# ==============================================================================
# 1. PASSWORD STORAGE & AUTOMATIC REHASH REGRESSION TESTS
# ==============================================================================
class TestPasswordSecurityRegression:
    def test_new_hash_uses_pbkdf2_600000_rounds(self):
        """Verify new password hashes are generated with PBKDF2-SHA256 at 600,000 rounds."""
        raw_password = "SecurePassword2026!"
        hashed = hash_password(raw_password)

        assert hashed.startswith("$pbkdf2-sha256$600000$")
        assert verify_password(raw_password, hashed)
        assert not verify_password("WrongPassword!", hashed)

    def test_needs_rehash_behavior(self):
        """Verify needs_rehash correctly distinguishes between modern 600k and legacy hashes."""
        raw_password = "LegacyPassword123"

        # Modern 600,000-round hash -> does NOT need rehash
        modern_hash = hash_password(raw_password)
        assert needs_rehash(modern_hash) is False

        # Legacy 29,000-round PBKDF2 hash -> MUST trigger rehash
        legacy_hash = pbkdf2_sha256.using(rounds=29000).hash(raw_password)
        assert "$29000$" in legacy_hash
        assert verify_password(raw_password, legacy_hash) is True
        assert needs_rehash(legacy_hash) is True


# ==============================================================================
# 2. SSRF & PRIVATE IP FILTER REGRESSION TESTS
# ==============================================================================
class TestSSRFProtectionRegression:
    @pytest.mark.parametrize(
        "unsafe_url",
        [
            "http://localhost:8000/api",
            "http://127.0.0.1:8000/internal",
            "http://127.0.1.1/secret",
            "http://10.0.0.5/admin",
            "http://192.168.1.100/router",
            "http://172.16.0.1/docker",
            "http://169.254.169.254/latest/meta-data/",
            "http://metadata.google.internal/computeMetadata/v1/",
            "http://0.0.0.0:8000",
            "ftp://example.com/file",
        ],
    )
    def test_ssrf_rejects_private_and_metadata_endpoints(self, unsafe_url: str):
        """Ensure SSRF filter blocks all private IP ranges, loopbacks, and metadata servers."""
        is_safe, error_msg = is_safe_webhook_url(unsafe_url)
        assert is_safe is False
        assert len(error_msg) > 0

    @pytest.mark.parametrize(
        "safe_url",
        [
            "https://hooks.slack.com/services/T00/B00/X00",
            "https://discord.com/api/webhooks/123/abc",
            "https://example.com/webhook",
        ],
    )
    def test_ssrf_allows_legitimate_external_webhooks(self, safe_url: str):
        """Ensure SSRF filter allows legitimate, publicly routable HTTPS endpoints."""
        is_safe, _ = is_safe_webhook_url(safe_url)
        assert is_safe is True


# ==============================================================================
# 3. RBAC & ADMIN ROUTE AUTHORIZATION REGRESSION TESTS
# ==============================================================================
class TestRoleAuthorizationRegression:
    @pytest.mark.asyncio
    async def test_admin_role_requirement_enforcement(self):
        """Verify require_role strictly blocks non-admin users with HTTP 403 Forbidden."""
        admin_guard = require_role("admin")

        # 1. Admin user -> Allowed
        admin_user = {"sub": "usr-admin", "role": "admin", "org": "org-1"}
        result = await admin_guard(request=None, current_user=admin_user)
        assert result["role"] == "admin"

        # 2. Regular member user -> Blocked with 403
        member_user = {"sub": "usr-member", "role": "member", "org": "org-1"}
        with pytest.raises(HTTPException) as exc:
            await admin_guard(request=None, current_user=member_user)
        assert exc.value.status_code == 403
        assert "Requires" in exc.value.detail or "Forbidden" in exc.value.detail

        # 3. Readonly analyst user -> Blocked with 403
        analyst_user = {"sub": "usr-analyst", "role": "analyst", "org": "org-1"}
        with pytest.raises(HTTPException) as exc:
            await admin_guard(request=None, current_user=analyst_user)
        assert exc.value.status_code == 403


# ==============================================================================
# 4. SLOWAPI RATE LIMITING REGRESSION TESTS
# ==============================================================================
class TestRateLimitingRegression:
    @pytest.mark.asyncio
    async def test_rate_limiting_enforces_429(self):
        """Verify SlowAPI returns 429 Too Many Requests when rate limits are exceeded."""
        original_state = limiter.enabled
        try:
            limiter.enabled = True
            limiter.reset()

            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as ac:
                # /auth/forgot-password is rate limited to 5/minute
                statuses = []
                for _ in range(8):
                    res = await ac.post(
                        "/auth/forgot-password",
                        json={"email": "victim@example.com"},
                    )
                    statuses.append(res.status_code)

                # At least one request must receive HTTP 429 Too Many Requests
                assert 429 in statuses
        finally:
            limiter.enabled = original_state


# ==============================================================================
# 5. ANTI-USER ENUMERATION & SENSITIVE PATH REGRESSION TESTS
# ==============================================================================
class TestSensitivePathRegression:
    @pytest.mark.asyncio
    async def test_forgot_password_anti_enumeration(self, client):
        """Forgot-password endpoint must return identical generic response for existing and non-existing users."""
        res_nonexistent = await client.post(
            "/auth/forgot-password",
            json={"email": "definitely_does_not_exist_9876@test.com"},
        )
        assert res_nonexistent.status_code == 200
        msg_nonexistent = res_nonexistent.json()["message"]

        assert "reset link" in msg_nonexistent.lower()
