import json
from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient
from jose import jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.asm_event import ASMEvent, ASMEventSeverity, ASMEventType
from app.models.asset import Asset, AssetStatus, AssetType
from app.models.webhook import Webhook
from app.services.asm.alerting import dispatch_unnotified_events
from app.services.asset_inventory.asset_discovery_service import discover_assets


def _extract_org_id(auth_headers: dict) -> str:
    token = auth_headers["Authorization"].split(" ")[1]
    payload = jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.ALGORITHM],
        audience="sageai-platform",
    )
    return payload["org"]


@pytest.mark.asyncio
async def test_get_asm_events_asset(
    client: AsyncClient, auth_headers: dict, db_session: AsyncSession
):
    org_id = _extract_org_id(auth_headers)

    # 1. Create asset for the authenticated org
    asset = Asset(
        organization_id=org_id,
        asset_type=AssetType.subdomain,
        value="test-asset.example.com",
        status="active",
    )
    db_session.add(asset)
    await db_session.commit()
    await db_session.refresh(asset)

    # 2. Add an ASM event for this asset
    event = ASMEvent(
        organization_id=org_id,
        asset_id=asset.id,
        event_type=ASMEventType.new_port,
        severity=ASMEventSeverity.medium,
        title="New port 8443 found",
        description="Testing asset-specific events",
    )
    db_session.add(event)
    await db_session.commit()

    # 3. Call asset-specific endpoint
    response = await client.get(
        f"/api/asm/events/asset/{asset.id}", headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["asset_id"] == asset.id
    assert data[0]["title"] == "New port 8443 found"
    assert data[0]["event_type"] == "new_port"
    assert data[0]["severity"] == "medium"
    assert "is_alert_sent" in data[0]


@pytest.mark.asyncio
async def test_get_asm_events_filtering(
    client: AsyncClient, auth_headers: dict, db_session: AsyncSession
):
    org_id = _extract_org_id(auth_headers)

    # Create multiple events with distinct severities and event types
    evt1 = ASMEvent(
        organization_id=org_id,
        event_type=ASMEventType.port_closed,
        severity=ASMEventSeverity.info,
        title="Port 21 closed",
    )
    evt2 = ASMEvent(
        organization_id=org_id,
        event_type=ASMEventType.new_vulnerability,
        severity=ASMEventSeverity.critical,
        title="Critical CVE detected",
    )
    db_session.add_all([evt1, evt2])
    await db_session.commit()

    # Filter by severity=critical
    r_sev = await client.get("/api/asm/events?severity=critical", headers=auth_headers)
    assert r_sev.status_code == 200
    items = r_sev.json()
    assert any(e["title"] == "Critical CVE detected" for e in items)
    assert not any(e["severity"] == "info" for e in items)

    # Filter by event_type=port_closed
    r_type = await client.get(
        "/api/asm/events?event_type=port_closed", headers=auth_headers
    )
    assert r_type.status_code == 200
    type_items = r_type.json()
    assert any(e["title"] == "Port 21 closed" for e in type_items)
    assert not any(e["event_type"] == "new_vulnerability" for e in type_items)


@pytest.mark.asyncio
async def test_get_asm_summary(
    client: AsyncClient, auth_headers: dict, db_session: AsyncSession
):
    org_id = _extract_org_id(auth_headers)

    evt = ASMEvent(
        organization_id=org_id,
        event_type=ASMEventType.dns_changed,
        severity=ASMEventSeverity.medium,
        title="DNS changed for test.com",
    )
    db_session.add(evt)
    await db_session.commit()

    r = await client.get("/api/asm/summary", headers=auth_headers)
    assert r.status_code == 200
    summary = r.json()
    assert "total_events" in summary
    assert "events_last_24h" in summary
    assert "by_severity" in summary
    assert "by_event_type" in summary
    assert summary["total_events"] >= 1
    assert summary["by_event_type"]["dns_changed"] >= 1


@pytest.mark.asyncio
async def test_dispatch_unnotified_events_with_hmac(db_session: AsyncSession):
    # 1. Create test webhook and event
    hook = Webhook(
        organization_id="org-alert-test",
        url="https://hooks.example.com/sageai-alerts",
        secret="test-secret-key-1234",
        is_active=True,
        event="asm.alert",
    )
    evt = ASMEvent(
        organization_id="org-alert-test",
        event_type=ASMEventType.service_changed,
        severity=ASMEventSeverity.low,
        title="HTTP Server version updated",
        description="Changed from nginx/1.18 to nginx/1.24",
        is_alert_sent=False,
    )
    db_session.add_all([hook, evt])
    await db_session.commit()

    # 2. Mock httpx post
    mock_resp = AsyncMock()
    mock_resp.is_error = False
    mock_resp.status_code = 200

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_resp
        count = await dispatch_unnotified_events(db=db_session)

        assert count >= 1
        assert mock_post.called

        # Verify HMAC signature header was sent
        call_kwargs = mock_post.call_args.kwargs
        headers = call_kwargs["headers"]
        assert "X-SageAI-Signature" in headers
        assert headers["X-SageAI-Signature"].startswith("sha256=")
        assert headers["X-SageAI-Event"] == "asm.alert"


@pytest.mark.asyncio
async def test_asm_alerts_dispatch_endpoint(client: AsyncClient, auth_headers: dict):
    with patch("app.routers.asm_routes.dispatch_unnotified_events", return_value=3):
        r = await client.post("/api/asm/alerts/dispatch", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["dispatched_count"] == 3
        assert "completed" in data["message"]


@pytest.mark.asyncio
async def test_asm_diff_engine_comprehensive(db_session: AsyncSession):
    org_id = "test-diff-engine-org"

    # Pre-populate asset with previous state
    existing_asset = Asset(
        organization_id=org_id,
        asset_type=AssetType.domain,
        value="target.example.com",
        ip_address="192.0.2.1",
        open_ports=json.dumps([80, 22, 8080]),
        technologies=json.dumps(["Apache/2.4"]),
        http_status=200,
        http_title="Old Title",
        shodan_data=json.dumps({"shodan_vulns": {"cve_ids": []}}),
        status=AssetStatus.active,
    )
    db_session.add(existing_asset)
    await db_session.commit()

    # Mock reconnaissance to simulate changed attack surface:
    # - IP moved to 192.0.2.2 (dns_changed)
    # - Port 443 added (new_port)
    # - Ports 22 & 8080 closed (port_closed)
    # - Tech added Node.js, Title changed to "New Title" (service_changed)
    # - New CVE-2024-1234 reported by Shodan (new_vulnerability)
    mock_shodan = [
        {"type": "shodan_ports", "ports": [80, 443]},
        {"type": "shodan_vulns", "cve_ids": ["CVE-2024-1234"]},
    ]

    with (
        patch(
            "app.services.crtsh_client.search_certificates",
            new_callable=AsyncMock,
            return_value=[],
        ),
        patch("app.services.dns_scanner.scan_dns", return_value=[]),
        patch("socket.gethostbyname", return_value="192.0.2.2"),
        patch(
            "app.services.asset_inventory.asset_discovery_service._probe_http",
            new_callable=AsyncMock,
            return_value=(200, "New Title", ["Apache/2.4", "Node.js"]),
        ),
        patch(
            "app.services.shodan_client.lookup_ip",
            new_callable=AsyncMock,
            return_value=mock_shodan,
        ),
    ):
        summary = await discover_assets(org_id, "target.example.com", db_session)
        assert summary["total"] >= 1
        assert "target.example.com" in summary["updated_assets"]

    # Verify all 5 ASM diff events were logged to the database
    res = await db_session.execute(
        select(ASMEvent).where(ASMEvent.organization_id == org_id)
    )
    events = res.scalars().all()
    event_types = {e.event_type for e in events}

    assert ASMEventType.new_port in event_types
    assert ASMEventType.port_closed in event_types
    assert ASMEventType.dns_changed in event_types
    assert ASMEventType.service_changed in event_types
    assert ASMEventType.new_vulnerability in event_types
