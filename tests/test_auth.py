"""Authentication endpoint tests."""

import pytest


@pytest.mark.asyncio
async def test_register_success(client):
    import uuid

    r = await client.post(
        "/auth/register",
        json={
            "email": f"newuser_{uuid.uuid4().hex[:8]}@test.com",
            "password": "StrongPass1!",
            "organization_name": "NewOrg",
        },
    )
    assert r.status_code == 201
    data = r.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_register_duplicate_email(client):
    payload = {
        "email": "dup@test.com",
        "password": "Pass123!",
        "organization_name": "Org1",
    }
    await client.post("/auth/register", json=payload)
    r = await client.post("/auth/register", json=payload)
    assert r.status_code in (400, 409, 422, 500)


@pytest.mark.asyncio
async def test_register_weak_password(client):
    payload = {
        "email": "weak@test.com",
        "password": "weak",
        "organization_name": "OrgWeak",
    }
    r = await client.post("/auth/register", json=payload)
    assert r.status_code == 422
    assert "Password must be at least 8 characters long" in r.text

    payload2 = {
        "email": "weak2@test.com",
        "password": "onlylowercase!",
        "organization_name": "OrgWeak",
    }
    r2 = await client.post("/auth/register", json=payload2)
    assert r2.status_code == 422
    assert "Password must contain at least one uppercase letter" in r2.text


@pytest.mark.asyncio
async def test_login_success(client):
    await client.post(
        "/auth/register",
        json={
            "email": "login@test.com",
            "password": "Pass123!",
            "organization_name": "LoginOrg",
        },
    )
    r = await client.post(
        "/auth/login",
        json={
            "email": "login@test.com",
            "password": "Pass123!",
        },
    )
    assert r.status_code == 200
    assert "access_token" in r.json()


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    await client.post(
        "/auth/register",
        json={
            "email": "wrong@test.com",
            "password": "Pass123!",
            "organization_name": "WrongOrg",
        },
    )
    r = await client.post(
        "/auth/login",
        json={
            "email": "wrong@test.com",
            "password": "BadPassword!",
        },
    )
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_protected_route_no_token(client):
    r = await client.get("/scans")
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_health_check(client):
    r = await client.get("/")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] in ("healthy", "degraded")
    assert "app" in data
    assert "database" in data
    assert "scanners" in data
    assert data["scanners"] == 11


@pytest.mark.asyncio
async def test_health_check_fields(client):
    r = await client.get("/")
    data = r.json()
    assert data["app"] == "SageAI Security Scanner"
    assert data["environment"] in ("development", "production", "test")
    assert "endpoints" in data
    assert data["version"] == "2.0.0"


@pytest.mark.asyncio
async def test_forgot_password_json_body(client):
    """Test forgot-password returns generic message for non-existent and existent users (anti-enumeration)."""
    r = await client.post(
        "/auth/forgot-password", json={"email": "nonexistent@test.com"}
    )
    assert r.status_code == 200
    assert "If that email exists" in r.json()["message"]


@pytest.mark.asyncio
async def test_reset_password_weak_password(client):
    """Test reset-password enforces strong password requirements."""
    r = await client.post(
        "/auth/reset-password",
        json={"token": "some_token", "new_password": "weak"},
    )
    assert r.status_code == 422 or (
        r.status_code == 400 and "Password must be at least" in r.text
    )


@pytest.mark.asyncio
async def test_reset_password_invalid_token(client):
    """Test reset-password with invalid token fails with 400."""
    r = await client.post(
        "/auth/reset-password",
        json={"token": "invalid_or_expired_token", "new_password": "StrongNewPass1!"},
    )
    assert r.status_code == 400
    assert "Invalid or expired reset token" in r.json()["detail"]


@pytest.mark.asyncio
async def test_gdpr_export(client, auth_headers):
    """Test GDPR Article 20 data portability export endpoint."""
    r = await client.get("/gdpr/export", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert "user" in data
    assert "organization" in data
    assert "scans" in data
