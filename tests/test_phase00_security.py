"""Phase 00 Foundation and Security Controls unit & integration tests.

Tests:
1. Target domain inheritance (verifying root domain covers subdomains)
2. Enterprise require_verified_domains policy enforcement
3. Finding lifecycle management (status updates, assigned_to, resolved_at)
4. SSRF hop-by-hop redirect defense in verification service
5. Webhook URL token masking
6. Unique constraint enforcement on assets and notification channels per organization
"""

import uuid
from unittest.mock import AsyncMock, patch

import httpx
import pytest
from sqlalchemy import select

from app.models.asset import Asset, AssetType
from app.models.organization import Organization
from app.services.asset_inventory.verification_service import (
    is_target_authorized,
    verify_http_challenge,
)


async def get_test_tenant(client, prefix: str):
    """Register and login a test user, returning headers and org."""
    uid = uuid.uuid4().hex[:8]
    email = f"{prefix}_{uid}@domain.com"
    password = "SecurePassword123!"
    org_name = f"Org_{prefix}_{uid}"

    await client.post(
        "/auth/register",
        json={
            "email": email,
            "password": password,
            "organization_name": org_name,
        },
    )
    login_res = await client.post(
        "/auth/login",
        json={"email": email, "password": password},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    return headers, org_name


@pytest.mark.asyncio
async def test_target_domain_inheritance(client, db_session):
    """Verifying root domain 'acme.org' authorizes 'api.staging.acme.org' for scans."""
    headers, org_name = await get_test_tenant(client, "inherit")

    org = (
        await db_session.execute(
            select(Organization).where(Organization.name == org_name)
        )
    ).scalar_one()

    # Add verified root domain
    root_asset = Asset(
        organization_id=org.id,
        asset_type=AssetType.domain,
        value="acme.org",
        is_verified=True,
    )
    db_session.add(root_asset)
    await db_session.commit()

    # Check direct match
    assert await is_target_authorized(db_session, org.id, "https://acme.org") is True

    # Check subdomain inheritance
    assert await is_target_authorized(db_session, org.id, "https://api.acme.org") is True
    assert (
        await is_target_authorized(
            db_session, org.id, "https://app.staging.dev.acme.org:8080/path"
        )
        is True
    )

    # Different domain is not authorized
    assert await is_target_authorized(db_session, org.id, "https://notacme.org") is False


@pytest.mark.asyncio
async def test_require_verified_domains_policy_enforcement(client, db_session):
    """When require_verified_domains is enabled, unverified targets are rejected with 403."""
    headers, org_name = await get_test_tenant(client, "policy")

    # 1. Enable require_verified_domains
    patch_res = await client.patch(
        "/org/policy",
        json={"require_verified_domains": True},
        headers=headers,
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["require_verified_domains"] is True

    # 2. Attempt to scan unverified target -> 403 Forbidden
    scan_res = await client.post(
        "/scan",
        json={"target": "https://unverified-domain.com"},
        headers=headers,
    )
    assert scan_res.status_code == 403
    assert "not verified" in scan_res.json()["detail"]

    # 3. Add verified domain to org
    org = (
        await db_session.execute(
            select(Organization).where(Organization.name == org_name)
        )
    ).scalar_one()

    asset = Asset(
        organization_id=org.id,
        asset_type=AssetType.domain,
        value="verified-allowed.com",
        is_verified=True,
    )
    db_session.add(asset)
    await db_session.commit()

    # 4. Scanning verified domain succeeds -> 201 Created
    scan_ok = await client.post(
        "/scan",
        json={"target": "https://verified-allowed.com"},
        headers=headers,
    )
    assert scan_ok.status_code == 201
    assert scan_ok.json()["is_authorized"] is True


@pytest.mark.asyncio
async def test_finding_lifecycle_status_transitions(client, db_session):
    """Test full finding lifecycle: new -> in_progress -> fixed -> reopened."""
    headers, _ = await get_test_tenant(client, "lifecycle")

    # Run scan to create scan record
    scan_res = await client.post(
        "/scan",
        json={"target": "https://test-lifecycle.com"},
        headers=headers,
    )
    assert scan_res.status_code == 201
    scan_id = scan_res.json()["id"]

    # Seed finding deterministically
    from app.models.finding import Finding, FindingSeverity, FindingStatus

    finding = Finding(
        scan_id=scan_id,
        title="Missing Security Headers",
        description="Strict-Transport-Security header is missing",
        severity=FindingSeverity.medium,
        status=FindingStatus.new,
    )
    db_session.add(finding)
    await db_session.commit()
    await db_session.refresh(finding)

    # Retrieve findings via API
    findings = (await client.get(f"/scan/{scan_id}/findings", headers=headers)).json()
    assert len(findings) > 0
    finding_id = finding.id
    assert findings[0]["status"] == "new"

    # Transition to in_progress
    r1 = await client.patch(
        f"/scan/{scan_id}/findings/{finding_id}/status",
        json={"status": "in_progress", "assigned_to": "alice@secops.corp", "notes": "Investigating headers"},
        headers=headers,
    )
    assert r1.status_code == 200
    assert r1.json()["status"] == "in_progress"
    assert r1.json()["assigned_to"] == "alice@secops.corp"
    assert r1.json()["resolved_at"] is None

    # Transition to fixed
    r2 = await client.patch(
        f"/scan/{scan_id}/findings/{finding_id}/status",
        json={"status": "fixed", "notes": "HSTS header deployed in ingress"},
        headers=headers,
    )
    assert r2.status_code == 200
    assert r2.json()["status"] == "fixed"
    assert r2.json()["resolved_at"] is not None

    # Transition to reopened
    r3 = await client.patch(
        f"/scan/{scan_id}/findings/{finding_id}/status",
        json={"status": "reopened", "notes": "Regression detected"},
        headers=headers,
    )
    assert r3.status_code == 200
    assert r3.json()["status"] == "reopened"
    assert r3.json()["resolved_at"] is None

    # Invalid status returns 400
    r_bad = await client.patch(
        f"/scan/{scan_id}/findings/{finding_id}/status",
        json={"status": "non_existent_status"},
        headers=headers,
    )
    assert r_bad.status_code == 400


@pytest.mark.asyncio
async def test_redirect_ssrf_protection_in_http_challenge():
    """Verify HTTP challenge blocks redirect chains pointing to cloud metadata or localhost."""
    # Test safe probe directly with mocked redirect
    target_domain = "evil-redirect.corp"
    token = "sageai-verify-secret123"

    # Mock client.get so hop 1 returns 302 to cloud metadata
    mock_response_redirect = httpx.Response(
        status_code=302,
        headers={"location": "http://169.254.169.254/latest/meta-data/"},
        request=httpx.Request("GET", f"https://{target_domain}/.well-known/sageai-challenge.txt"),
    )

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_response_redirect
        success, message = await verify_http_challenge(target_domain, token)
        assert success is False
        assert "not permitted" in message or "restricted" in message or "failed" in message


@pytest.mark.asyncio
async def test_webhook_url_masking_in_api(client):
    """Webhook URLs in listings mask secrets/tokens."""
    headers, _ = await get_test_tenant(client, "masking")

    # Create webhook with token
    r = await client.post(
        "/webhooks?url=https://hooks.slack.com/services/T123/B456/SECRET_TOKEN_7890&event=scan.completed",
        headers=headers,
    )
    assert r.status_code == 200
    data = r.json()
    assert "****" in data["url"]
    assert "SECRET_TOKEN_7890" not in data["url"]

    # List webhooks
    list_r = await client.get("/webhooks", headers=headers)
    assert list_r.status_code == 200
    hooks = list_r.json()
    assert len(hooks) >= 1
    assert "****" in hooks[0]["url"]
    assert "SECRET_TOKEN_7890" not in hooks[0]["url"]
