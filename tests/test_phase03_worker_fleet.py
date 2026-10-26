"""Phase 03 Distributed Ephemeral Scanner Worker Fleet Tests.

Tests:
1. FleetManager dispatch (Celery task queue & resilient fallback)
2. Idempotency Key validation (duplicate scan prevention within cooldown window)
3. Durable scan lifecycle & staged progress tracking (queued -> running -> completed)
4. Scan cancellation endpoint (POST /scan/{id}/cancel) & cross-tenant security
5. Fleet status endpoint (GET /scan/fleet/status)
6. Real-time scan progress endpoint (GET /scan/{id}/progress)
7. Notification alert triggering upon worker completion
"""

import uuid
from unittest.mock import AsyncMock, patch

import pytest
from sqlalchemy import select

from app.models.organization import Organization
from app.models.scan import Scan
from app.models.user import User
from app.services.worker.fleet_manager import (
    fleet_manager,
    generate_scan_idempotency_key,
)


async def get_test_tenant(client, prefix: str):
    """Register and login a test user, returning auth headers, org_name, and org."""
    uid = uuid.uuid4().hex[:8]
    email = f"{prefix}_{uid}@domain.com"
    password = "SecurePassword123!"
    org_name = f"Org_{prefix}_{uid}"

    reg_res = await client.post(
        "/auth/register",
        json={
            "email": email,
            "password": password,
            "organization_name": org_name,
        },
    )
    assert reg_res.status_code in (200, 201)

    login_res = await client.post(
        "/auth/login",
        json={"email": email, "password": password},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    return headers, org_name


# ─────────────────────────────────────────────────────────────
# 1. Idempotency Engine & Key Generation Tests
# ─────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_idempotency_key_generation_and_reuse(client, db_session):
    """Verify that identical scans with the same idempotency key are deduplicated."""
    headers, org_name = await get_test_tenant(client, "idem")
    org = (
        await db_session.execute(
            select(Organization).where(Organization.name == org_name)
        )
    ).scalar_one()

    key1 = generate_scan_idempotency_key(org.id, "https://api.example.com", "full")
    key2 = generate_scan_idempotency_key(org.id, "https://api.example.com", "full")
    assert key1 == key2

    # Different target or scan_type produces distinct key
    key_deep = generate_scan_idempotency_key(org.id, "https://api.example.com", "deep")
    assert key1 != key_deep

    with patch(
        "app.routers.scan_routes.run_all_scans", new_callable=AsyncMock
    ) as mock_scan:
        mock_scan.return_value = [
            {"type": "port_open", "severity": "low", "detail": "port 80"}
        ]

        # 1. Submit first scan with idempotency key
        res1 = await client.post(
            "/scan",
            headers=headers,
            json={
                "target": "https://example.com",
                "idempotency_key": "unique-client-key-12345",
            },
        )
        assert res1.status_code in (200, 201)
        scan1_id = res1.json()["id"]

        # 2. Submit second scan immediately with the same idempotency key -> Returns existing scan
        res2 = await client.post(
            "/scan",
            headers=headers,
            json={
                "target": "https://example.com",
                "idempotency_key": "unique-client-key-12345",
            },
        )
        assert res2.status_code in (200, 201)
        scan2_id = res2.json()["id"]
        assert scan1_id == scan2_id


# ─────────────────────────────────────────────────────────────
# 2. Async Worker Fleet Dispatch & Staged Progress Tracking
# ─────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_async_worker_fleet_dispatch(client, db_session):
    """Verify async_mode dispatches to worker fleet and returns 200/201 immediately."""
    headers, org_name = await get_test_tenant(client, "async_fleet")

    with patch(
        "app.services.scanner_service.run_all_scans", new_callable=AsyncMock
    ) as mock_scan:
        mock_scan.return_value = [
            {"type": "port_open", "severity": "low", "detail": "port 443"}
        ]

        res = await client.post(
            "/scan",
            headers=headers,
            json={
                "target": "https://example.com",
                "async_mode": True,
                "deep_scan": True,
            },
        )
        assert res.status_code in (200, 201)
        data = res.json()
        assert data["status"] in ("queued", "running")
        scan_id = data["id"]

        # Poll progress endpoint
        prog_res = await client.get(f"/scan/{scan_id}/progress", headers=headers)
        assert prog_res.status_code == 200
        prog_data = prog_res.json()
        assert prog_data["scan_id"] == scan_id
        assert "stage" in prog_data
        assert "progress" in prog_data


# ─────────────────────────────────────────────────────────────
# 3. Scan Cancellation & Cross-Tenant Security
# ─────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_scan_cancellation_and_tenant_security(client, db_session):
    """Ensure active scans can be cancelled, and foreign tenants cannot cancel scans."""
    headers_a, org_name_a = await get_test_tenant(client, "cancel_a")
    headers_b, org_name_b = await get_test_tenant(client, "cancel_b")

    org_a = (
        await db_session.execute(
            select(Organization).where(Organization.name == org_name_a)
        )
    ).scalar_one()
    user_a = (
        (await db_session.execute(select(User).where(User.organization_id == org_a.id)))
        .scalars()
        .first()
    )

    # Create active scan for Org A
    scan_a = Scan(
        id=str(uuid.uuid4()),
        organization_id=org_a.id,
        user_id=user_a.id,
        target="https://target.a.com",
        status="running",
        stage="network_scanning",
        progress=45,
    )
    db_session.add(scan_a)
    await db_session.commit()

    # Org B attempts to cancel Org A's scan -> Denied (404)
    cancel_b = await client.post(f"/scan/{scan_a.id}/cancel", headers=headers_b)
    assert cancel_b.status_code == 404

    # Org A cancels its own scan -> Success
    cancel_a = await client.post(f"/scan/{scan_a.id}/cancel", headers=headers_a)
    assert cancel_a.status_code == 200
    assert cancel_a.json()["status"] == "cancelled"

    # Verify status in database
    await db_session.refresh(scan_a)
    assert scan_a.status == "cancelled"


# ─────────────────────────────────────────────────────────────
# 4. Fleet Status & Health Monitoring Endpoint
# ─────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_worker_fleet_status_endpoint(client):
    """Test GET /scan/fleet/status for worker queue metrics."""
    headers, _ = await get_test_tenant(client, "fleet_stat")

    res = await client.get("/scan/fleet/status", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "status" in data
    assert "scans" in data
    assert "broker_connected" in data
    assert isinstance(data["scans"], dict)


# ─────────────────────────────────────────────────────────────
# 5. Alert Triggering on Worker Scan Completion
# ─────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_worker_completion_triggers_notifications(client, db_session):
    """Verify that background worker completion automatically triggers multi-channel alerts."""
    headers, org_name = await get_test_tenant(client, "alert_worker")
    org = (
        await db_session.execute(
            select(Organization).where(Organization.name == org_name)
        )
    ).scalar_one()
    user = (
        (await db_session.execute(select(User).where(User.organization_id == org.id)))
        .scalars()
        .first()
    )

    scan = Scan(
        id=str(uuid.uuid4()),
        organization_id=org.id,
        user_id=user.id,
        target="https://api.test-notif.com",
        status="queued",
    )
    db_session.add(scan)
    await db_session.commit()

    with (
        patch(
            "app.services.worker.fleet_manager.dispatch_security_alert",
            new_callable=AsyncMock,
        ) as mock_dispatch,
        patch(
            "app.services.scanner_service.run_all_scans", new_callable=AsyncMock
        ) as mock_scans,
    ):
        mock_dispatch.return_value = 1
        mock_scans.return_value = [
            {
                "type": "ssl_invalid",
                "severity": "high",
                "detail": "expired cert",
                "cvss": 7.5,
            }
        ]

        # Run worker scan
        await fleet_manager._execute_scan_worker(
            scan_id=scan.id,
            target="https://api.test-notif.com",
            org_id=org.id,
            deep_scan=False,
            session=db_session,
        )

        assert mock_dispatch.called
        assert mock_dispatch.call_args.kwargs["organization_id"] == org.id
        assert mock_dispatch.call_args.kwargs["target"] == "https://api.test-notif.com"

    # Verify scan marked completed
    await db_session.refresh(scan)
    assert scan.status == "completed"
    assert scan.progress == 100
    assert scan.stage == "completed"
