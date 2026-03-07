"""Authentication endpoint tests."""

import pytest


@pytest.mark.asyncio
async def test_register_success(client):
    r = await client.post("/auth/register", json={
        "email": "newuser@test.com",
        "password": "StrongPass1!",
        "organization_name": "NewOrg",
    })
    assert r.status_code == 201
    data = r.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_register_duplicate_email(client):
    payload = {"email": "dup@test.com", "password": "Pass123!", "organization_name": "Org1"}
    await client.post("/auth/register", json=payload)
    r = await client.post("/auth/register", json=payload)
    assert r.status_code in (400, 409, 422, 500)


@pytest.mark.asyncio
async def test_login_success(client):
    await client.post("/auth/register", json={
        "email": "login@test.com",
        "password": "Pass123!",
        "organization_name": "LoginOrg",
    })
    r = await client.post("/auth/login", json={
        "email": "login@test.com",
        "password": "Pass123!",
    })
    assert r.status_code == 200
    assert "access_token" in r.json()


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    await client.post("/auth/register", json={
        "email": "wrong@test.com",
        "password": "Pass123!",
        "organization_name": "WrongOrg",
    })
    r = await client.post("/auth/login", json={
        "email": "wrong@test.com",
        "password": "BadPassword!",
    })
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
    assert data["environment"] == "development"
    assert "endpoints" in data
    assert data["version"] == "2.0.0"
