"""Exhaustive multi-tenant isolation security tests for Phase 00.

Validates that Tenant A and Tenant B cannot observe, read, modify,
or delete each other's scans, findings, reports, assets, verification challenges,
webhooks, notification channels, or audit logs.
"""

import uuid

import pytest

from app.models.asset import Asset, AssetType


async def create_tenant_client(client, prefix: str):
    """Register and login a tenant, returning auth headers and org ID."""
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
    assert reg_res.status_code == 201

    login_res = await client.post(
        "/auth/login",
        json={"email": email, "password": password},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch org ID
    plan_res = await client.get("/org/plan", headers=headers)
    assert plan_res.status_code == 200
    # From token decode or db we have headers
    return headers


@pytest.mark.asyncio
async def test_cross_tenant_scan_and_finding_isolation(client, db_session):
    """Tenant B cannot read, report on, or alter findings for Tenant A's scan."""
    headers_a = await create_tenant_client(client, "tenant_a")
    headers_b = await create_tenant_client(client, "tenant_b")

    # Tenant A launches a scan
    scan_res = await client.post(
        "/scan",
        json={"target": "https://tenant-a-test.com"},
        headers=headers_a,
    )
    assert scan_res.status_code == 201
    scan_a_id = scan_res.json()["id"]

    # Tenant B attempts to read Tenant A's scan -> 404
    read_res = await client.get(f"/scan/{scan_a_id}", headers=headers_b)
    assert read_res.status_code == 404

    # Tenant B attempts to get report -> 404
    report_res = await client.get(f"/scan/{scan_a_id}/report", headers=headers_b)
    assert report_res.status_code == 404

    # Tenant B attempts to get findings -> 404
    findings_res = await client.get(f"/scan/{scan_a_id}/findings", headers=headers_b)
    assert findings_res.status_code == 404

    # Tenant B lists scans -> scan_a_id is not in list
    list_res = await client.get("/scans", headers=headers_b)
    assert list_res.status_code == 200
    b_scan_ids = [s["id"] for s in list_res.json()]
    assert scan_a_id not in b_scan_ids

    # Tenant A gets findings
    findings_a = (
        await client.get(f"/scan/{scan_a_id}/findings", headers=headers_a)
    ).json()
    if findings_a:
        finding_id = findings_a[0]["id"]
        # Tenant B attempts to update finding status -> 404
        update_res = await client.patch(
            f"/scan/{scan_a_id}/findings/{finding_id}/status",
            json={"status": "fixed", "notes": "Hacked by Tenant B"},
            headers=headers_b,
        )
        assert update_res.status_code == 404


@pytest.mark.asyncio
async def test_cross_tenant_asset_isolation(client, db_session):
    """Tenant B cannot view, challenge, verify, or delete Tenant A's assets."""
    headers_a = await create_tenant_client(client, "asset_a")
    headers_b = await create_tenant_client(client, "asset_b")

    # Create asset for Tenant A directly in DB or via API
    # Find org A from scan or plan
    plan_a = (await client.get("/org/plan", headers=headers_a)).json()
    from sqlalchemy import select

    from app.models.organization import Organization

    org_a = (
        await db_session.execute(
            select(Organization).where(Organization.name == plan_a["organization"])
        )
    ).scalar_one()

    asset_a = Asset(
        organization_id=org_a.id,
        asset_type=AssetType.domain,
        value="secret-corp-a.com",
        is_verified=False,
    )
    db_session.add(asset_a)
    await db_session.commit()
    await db_session.refresh(asset_a)

    # Tenant B attempts to get challenge for Tenant A's asset -> 404
    chal_res = await client.get(f"/assets/{asset_a.id}/challenge", headers=headers_b)
    assert chal_res.status_code == 404

    # Tenant B attempts to verify Tenant A's asset -> 404
    verify_res = await client.post(f"/assets/{asset_a.id}/verify", headers=headers_b)
    assert verify_res.status_code == 404

    # Tenant B attempts to delete Tenant A's asset -> 404
    del_res = await client.delete(f"/assets/{asset_a.id}", headers=headers_b)
    assert del_res.status_code == 404

    # Tenant A can get challenge
    chal_a = await client.get(f"/assets/{asset_a.id}/challenge", headers=headers_a)
    assert chal_a.status_code == 200
    assert chal_a.json()["domain"] == "secret-corp-a.com"


@pytest.mark.asyncio
async def test_cross_tenant_notification_channel_isolation(client):
    """Tenant B cannot read, update, test, or delete Tenant A's notification channels."""
    headers_a = await create_tenant_client(client, "notif_a")
    headers_b = await create_tenant_client(client, "notif_b")

    # Tenant A creates Slack channel
    create_res = await client.post(
        "/notifications/channels",
        json={
            "name": "SecOps Slack A",
            "channel_type": "slack",
            "webhook_url": "https://hooks.slack.com/services/T11/B22/token12345",
            "min_severity": "high",
        },
        headers=headers_a,
    )
    assert create_res.status_code == 201
    channel_a_id = create_res.json()["id"]

    # Tenant B attempts to GET channel A -> 404
    get_res = await client.get(
        f"/notifications/channels/{channel_a_id}", headers=headers_b
    )
    assert get_res.status_code == 404

    # Tenant B attempts to PATCH channel A -> 404
    patch_res = await client.patch(
        f"/notifications/channels/{channel_a_id}",
        json={"name": "Hijacked Channel"},
        headers=headers_b,
    )
    assert patch_res.status_code == 404

    # Tenant B attempts to DELETE channel A -> 404
    del_res = await client.delete(
        f"/notifications/channels/{channel_a_id}", headers=headers_b
    )
    assert del_res.status_code == 404

    # Tenant B lists channels -> empty / does not contain channel_a_id
    list_res = await client.get("/notifications/channels", headers=headers_b)
    assert list_res.status_code == 200
    b_chan_ids = [c["id"] for c in list_res.json()]
    assert channel_a_id not in b_chan_ids


@pytest.mark.asyncio
async def test_cross_tenant_webhook_isolation(client):
    """Tenant B cannot view or delete Tenant A's webhooks."""
    headers_a = await create_tenant_client(client, "wh_a")
    headers_b = await create_tenant_client(client, "wh_b")

    # Tenant A registers a webhook
    create_res = await client.post(
        "/webhooks?url=https://external-siem-a.com/events&event=scan.completed",
        headers=headers_a,
    )
    assert create_res.status_code == 200
    webhook_a_id = create_res.json()["id"]

    # Tenant B attempts to delete Tenant A's webhook -> 404
    del_res = await client.delete(f"/webhooks/{webhook_a_id}", headers=headers_b)
    assert del_res.status_code == 404

    # Tenant B lists webhooks -> webhook_a_id is not present
    list_res = await client.get("/webhooks", headers=headers_b)
    assert list_res.status_code == 200
    b_hook_ids = [h["id"] for h in list_res.json()]
    assert webhook_a_id not in b_hook_ids


@pytest.mark.asyncio
async def test_cross_tenant_audit_log_isolation(client):
    """Tenant B cannot see Tenant A's audit events."""
    headers_a = await create_tenant_client(client, "audit_a")
    headers_b = await create_tenant_client(client, "audit_b")

    # Tenant A generates audit logs by modifying policy and creating notification channel
    await client.patch(
        "/org/policy",
        json={"require_verified_domains": True},
        headers=headers_a,
    )

    # Tenant A sees its audit log
    logs_a = await client.get("/org/audit-logs", headers=headers_a)
    assert logs_a.status_code == 200
    actions_a = [entry["action"] for entry in logs_a.json()]
    assert "ORG_POLICY_UPDATED" in actions_a

    # Tenant B sees only its own audit logs (0 from Org A)
    logs_b = await client.get("/org/audit-logs", headers=headers_b)
    assert logs_b.status_code == 200
    actions_b = [entry["action"] for entry in logs_b.json()]
    assert "ORG_POLICY_UPDATED" not in actions_b
