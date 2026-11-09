"""
Tests for JWT refresh token rotation, database pool observability, and incident SOAR ingestion workflows.
"""

import pytest
from httpx import AsyncClient

from app.core.database import check_db_connectivity, get_db_pool_status
from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
)


@pytest.mark.asyncio
async def test_refresh_token_generation_and_validation():
    claims = {
        "sub": "user-test-uuid-001",
        "email": "secops@sageai.internal",
        "org": "org-test-01",
        "role": "admin",
    }
    refresh_tok = create_refresh_token(claims)
    assert isinstance(refresh_tok, str)
    assert len(refresh_tok) > 20

    # Validate correct decoding
    payload = verify_refresh_token(refresh_tok)
    assert payload["sub"] == "user-test-uuid-001"
    assert payload["type"] == "refresh"
    assert "jti" in payload

    # An access token passed to verify_refresh_token should be rejected
    access_tok = create_access_token(claims)
    with pytest.raises(Exception):
        verify_refresh_token(access_tok)


@pytest.mark.asyncio
async def test_auth_refresh_endpoint(client: AsyncClient):
    # 1. Register a test user
    email = "refresh_test_user@sageai.internal"
    reg_resp = await client.post(
        "/auth/register",
        json={
            "email": email,
            "password": "StrongPassword123!",
            "organization_name": "Observability Corp",
        },
    )
    assert reg_resp.status_code == 201
    data = reg_resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    refresh_token = data["refresh_token"]

    # 2. Use refresh token to rotate session
    refresh_resp = await client.post(
        "/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert refresh_resp.status_code == 200
    new_data = refresh_resp.json()
    assert "access_token" in new_data
    assert "refresh_token" in new_data
    assert new_data["access_token"] != data["access_token"]
    assert new_data["refresh_token"] != data["refresh_token"]

    # 3. Invalid refresh token should fail
    bad_resp = await client.post(
        "/auth/refresh",
        json={"refresh_token": "invalid.corrupted.token"},
    )
    assert bad_resp.status_code == 401


@pytest.mark.asyncio
async def test_database_observability_and_probes(client: AsyncClient):
    # 1. Verify get_db_pool_status unit function
    pool_stats = get_db_pool_status()
    assert "status" in pool_stats
    assert "dialect" in pool_stats

    # 2. Verify check_db_connectivity probe function
    conn = await check_db_connectivity()
    assert conn["database"] == "connected"
    assert conn["status"] == "healthy"
    assert conn["latency_ms"] >= 0.0

    # 3. Test HTTP readiness probes
    health_resp = await client.get("/health")
    assert health_resp.status_code == 200
    h_data = health_resp.json()
    assert h_data["database"] == "connected"
    assert "database_pool" in h_data
    assert "database_latency_ms" in h_data

    ready_resp = await client.get("/health/ready")
    assert ready_resp.status_code == 200
    assert ready_resp.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_incident_alert_ingest_and_containment_workflow(client: AsyncClient):
    # Register/login to obtain authorized token
    email = "incident_secops@sageai.internal"
    reg_resp = await client.post(
        "/auth/register",
        json={
            "email": email,
            "password": "StrongPassword123!",
            "organization_name": "SOAR SecOps",
        },
    )
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Ingest alert into SOAR engine
    ingest_payload = {
        "title": "Autonomous NIDS Ingestion: Malicious Lateral SMB Movement",
        "severity": "CRITICAL",
        "source": "NIDSMonitor",
        "details": {
            "source_ip": "10.0.12.50",
            "target_ip": "10.0.12.99",
            "smb_tree": "\\\\target\\IPC$",
            "rule": "ET_EXPLOIT_SMBv2_ELEVATION",
        },
    }
    ingest_resp = await client.post(
        "/incidents/ingest", json=ingest_payload, headers=headers
    )
    assert ingest_resp.status_code == 201
    ingest_data = ingest_resp.json()
    incident = ingest_data["incident"]
    incident_id = incident["incident_id"]

    assert incident["status"] == "OPEN"
    assert incident["severity"] == "CRITICAL"
    # Safe automated actions should have run immediately
    assert len(incident["executed_actions"]) >= 1

    # 2. Retrieve incident
    get_resp = await client.get(f"/incidents/{incident_id}", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["incident"]["incident_id"] == incident_id

    # 3. Execute high-impact containment action (role is admin)
    action_resp = await client.post(
        f"/incidents/{incident_id}/action",
        json={"action": "BLOCK_IP_FIREWALL"},
        headers=headers,
    )
    assert action_resp.status_code == 200
    assert action_resp.json()["status"] == "SUCCESS"
