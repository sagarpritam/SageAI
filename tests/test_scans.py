"""Scan endpoint tests."""

import pytest


@pytest.mark.asyncio
async def test_run_scan(client, auth_headers):
    r = await client.post("/scan", json={"target": "https://example.com"}, headers=auth_headers)
    assert r.status_code == 201
    data = r.json()
    assert data["status"] in ("completed", "failed")
    assert "risk_summary" in data
    assert "findings" in data


@pytest.mark.asyncio
async def test_get_scan_by_id(client, auth_headers):
    r = await client.post("/scan", json={"target": "https://example.com"}, headers=auth_headers)
    scan_id = r.json()["id"]
    r = await client.get(f"/scan/{scan_id}", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["id"] == scan_id


@pytest.mark.asyncio
async def test_list_scans(client, auth_headers):
    await client.post("/scan", json={"target": "https://example.com"}, headers=auth_headers)
    r = await client.get("/scans", headers=auth_headers)
    assert r.status_code == 200
    assert isinstance(r.json(), list)
    assert len(r.json()) >= 1


@pytest.mark.asyncio
async def test_scan_requires_auth(client):
    r = await client.post("/scan", json={"target": "https://example.com"})
    assert r.status_code == 401
