"""Organization, API keys, and webhook endpoint tests."""

import pytest


@pytest.mark.asyncio
async def test_get_plan(client, auth_headers):
    r = await client.get("/org/plan", headers=auth_headers)
    assert r.status_code == 200
    assert "plan" in r.json()


@pytest.mark.asyncio
async def test_list_plans(client, auth_headers):
    r = await client.get("/org/plans", headers=auth_headers)
    assert r.status_code == 200
    plans = r.json()
    assert "free" in plans
    assert "pro" in plans


@pytest.mark.asyncio
async def test_get_org_stats(client, auth_headers):
    r = await client.get("/org/stats", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert "total_scans" in data
    assert "total_users" in data


@pytest.mark.asyncio
async def test_list_org_users(client, auth_headers):
    r = await client.get("/org/users", headers=auth_headers)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


@pytest.mark.asyncio
async def test_create_api_key(client, auth_headers):
    r = await client.post("/api-keys?name=test-key", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert "key" in data
    assert data["key"].startswith("sageai_")


@pytest.mark.asyncio
async def test_list_api_keys(client, auth_headers):
    await client.post("/api-keys?name=list-key", headers=auth_headers)
    r = await client.get("/api-keys", headers=auth_headers)
    assert r.status_code == 200
    assert len(r.json()) >= 1


@pytest.mark.asyncio
async def test_create_webhook(client, auth_headers):
    r = await client.post("/webhooks?url=https://example.com/hook&event=scan.completed", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["event"] == "scan.completed"


@pytest.mark.asyncio
async def test_list_webhooks(client, auth_headers):
    await client.post("/webhooks?url=https://example.com/hook2&event=scan.completed", headers=auth_headers)
    r = await client.get("/webhooks", headers=auth_headers)
    assert r.status_code == 200
    assert len(r.json()) >= 1


@pytest.mark.asyncio
async def test_security_headers(client):
    r = await client.get("/")
    assert r.headers.get("x-frame-options") == "DENY"
    assert r.headers.get("x-content-type-options") == "nosniff"
    assert "max-age" in r.headers.get("strict-transport-security", "")
