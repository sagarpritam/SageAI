"""Tests for Asset Ownership Verification & Scanner Authorization."""

from unittest.mock import AsyncMock, patch

import pytest

from app.models.asset import Asset, AssetStatus, AssetType
from app.services.asset_inventory.verification_service import (
    extract_target_domain,
    get_challenge_instructions,
)


def test_extract_target_domain():
    assert extract_target_domain("https://api.example.com/v1/test") == "api.example.com"
    assert (
        extract_target_domain("http://staging.corp.internal:8080/")
        == "staging.corp.internal"
    )
    assert extract_target_domain("example.org") == "example.org"


def test_challenge_instructions():
    asset = Asset(
        organization_id="org_123",
        asset_type=AssetType.domain,
        value="corp.example.com",
    )
    instructions = get_challenge_instructions(asset)
    assert instructions["domain"] == "corp.example.com"
    assert "token" in instructions
    assert instructions["token"].startswith("sageai-verify-")
    assert instructions["dns_challenge"]["host"] == "_sageai-challenge.corp.example.com"
    assert (
        instructions["http_challenge"]["url"]
        == "https://corp.example.com/.well-known/sageai-challenge.txt"
    )


@pytest.mark.asyncio
async def test_asset_challenge_and_verification_endpoints(
    client, auth_headers, db_session
):
    import jwt

    token = auth_headers["Authorization"].split(" ")[1]
    payload = jwt.decode(
        token,
        "key",
        algorithms=["HS256"],
        options={"verify_signature": False, "verify_aud": False},
    )
    org_id = payload["org"]

    asset = Asset(
        organization_id=org_id,
        asset_type=AssetType.domain,
        value="security-test.corp.com",
        status=AssetStatus.active,
    )
    db_session.add(asset)
    await db_session.commit()
    await db_session.refresh(asset)

    # 2. Get challenge instructions via API
    challenge_res = await client.get(
        f"/assets/{asset.id}/challenge", headers=auth_headers
    )
    assert challenge_res.status_code == 200
    instructions = challenge_res.json()
    token = instructions["token"]
    assert token.startswith("sageai-verify-")
    assert instructions["is_verified"] is False

    # 3. Verify asset via mocked DNS challenge
    with patch(
        "app.services.asset_inventory.verification_service._lookup_dns_txt",
        return_value=(True, "Verified via DNS TXT record"),
    ):
        verify_res = await client.post(
            f"/assets/{asset.id}/verify?method=dns", headers=auth_headers
        )
        assert verify_res.status_code == 200
        verify_data = verify_res.json()
        assert verify_data["status"] == "verified"
        assert verify_data["method"] == "dns_txt"


@pytest.mark.asyncio
async def test_scan_blocks_internal_and_loopback_targets(client, auth_headers):
    # Loopback target must be blocked by SSRF/target policy
    res1 = await client.post(
        "/scan",
        json={"target": "http://127.0.0.1:8000/internal"},
        headers=auth_headers,
    )
    assert res1.status_code == 400
    assert "Target URL is not permitted for scanning" in res1.json()["detail"]

    # Cloud metadata target must be blocked
    res2 = await client.post(
        "/scan",
        json={"target": "http://169.254.169.254/latest/meta-data"},
        headers=auth_headers,
    )
    assert res2.status_code == 400
    assert "Target URL is not permitted for scanning" in res2.json()["detail"]


@pytest.mark.asyncio
async def test_scan_sets_is_authorized_on_verified_asset(
    client, auth_headers, db_session
):
    import jwt

    token = auth_headers["Authorization"].split(" ")[1]
    payload = jwt.decode(
        token,
        "key",
        algorithms=["HS256"],
        options={"verify_signature": False, "verify_aud": False},
    )
    org_id = payload["org"]

    # Register verified asset
    asset = Asset(
        organization_id=org_id,
        asset_type=AssetType.domain,
        value="verified-domain.com",
        is_verified=True,
        status=AssetStatus.active,
    )
    db_session.add(asset)
    await db_session.commit()

    with patch(
        "app.routers.scan_routes.run_all_scans", new_callable=AsyncMock
    ) as mock_scan:
        mock_scan.return_value = []
        scan_res = await client.post(
            "/scan",
            json={"target": "https://verified-domain.com/portal"},
            headers=auth_headers,
        )
        assert scan_res.status_code == 201
        data = scan_res.json()
        assert data["is_authorized"] is True
