"""Tests for Multi-Channel Alerting (Slack, Discord, Teams, Webhook)."""

import pytest

from app.services.alerting.dispatcher import (
    _severity_meets_threshold,
    build_discord_payload,
    build_slack_payload,
)


@pytest.mark.asyncio
async def test_create_notification_channel(client, auth_headers):
    response = await client.post(
        "/notifications/channels",
        json={
            "name": "SecOps Slack Channel",
            "channel_type": "slack",
            "webhook_url": "https://hooks.slack.com/services/T00/B00/XXXX",
            "min_severity": "high",
        },
        headers=auth_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "SecOps Slack Channel"
    assert data["channel_type"] == "slack"
    assert data["is_active"] is True
    assert "id" in data


@pytest.mark.asyncio
async def test_create_notification_channel_ssrf_blocked(client, auth_headers):
    response = await client.post(
        "/notifications/channels",
        json={
            "name": "Malicious Hook",
            "channel_type": "webhook",
            "webhook_url": "http://127.0.0.1:8000/internal",
            "min_severity": "low",
        },
        headers=auth_headers,
    )
    assert response.status_code == 400
    assert "Invalid webhook URL" in response.json()["detail"]


@pytest.mark.asyncio
async def test_list_notification_channels(client, auth_headers):
    # Create channel via API
    await client.post(
        "/notifications/channels",
        json={
            "name": "Discord Alerts",
            "channel_type": "discord",
            "webhook_url": "https://discord.com/api/webhooks/123/xyz",
            "min_severity": "critical",
        },
        headers=auth_headers,
    )

    response = await client.get("/notifications/channels", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(c["channel_type"] == "discord" for c in data)


@pytest.mark.asyncio
async def test_update_and_delete_notification_channel(client, auth_headers):
    create_res = await client.post(
        "/notifications/channels",
        json={
            "name": "Teams Channel",
            "channel_type": "msteams",
            "webhook_url": "https://outlook.office.com/webhook/test",
            "min_severity": "medium",
        },
        headers=auth_headers,
    )
    channel_id = create_res.json()["id"]

    # Patch
    patch_res = await client.patch(
        f"/notifications/channels/{channel_id}",
        json={"min_severity": "critical", "name": "Critical Teams Alert"},
        headers=auth_headers,
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["min_severity"] == "critical"
    assert patch_res.json()["name"] == "Critical Teams Alert"

    # Delete
    del_res = await client.delete(
        f"/notifications/channels/{channel_id}",
        headers=auth_headers,
    )
    assert del_res.status_code == 204

    # Confirm deleted
    get_res = await client.get(
        f"/notifications/channels/{channel_id}",
        headers=auth_headers,
    )
    assert get_res.status_code == 404


def test_severity_threshold_logic():
    assert _severity_meets_threshold("critical", "high") is True
    assert _severity_meets_threshold("high", "high") is True
    assert _severity_meets_threshold("medium", "high") is False
    assert _severity_meets_threshold("low", "critical") is False
    assert _severity_meets_threshold("critical", "critical") is True


def test_payload_formatters():
    slack = build_slack_payload(
        title="SQL Injection",
        target="https://example.com",
        severity="critical",
        risk_score=95.0,
        details="Discovered blind boolean-based SQL injection on /api/user",
        findings_count=3,
    )
    assert "blocks" in slack
    assert "text" in slack
    assert "SQL Injection" in slack["blocks"][1]["text"]["text"]

    discord = build_discord_payload(
        title="Open SSH Port",
        target="192.0.2.1",
        severity="high",
        risk_score=75.0,
        details="Port 22 open with outdated OpenSSH daemon",
        findings_count=1,
    )
    assert "embeds" in discord
    assert discord["embeds"][0]["title"] == "🚨 Open SSH Port"
