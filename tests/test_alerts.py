from unittest.mock import AsyncMock, patch

import pytest

from app.services.integrations.alerts import create_jira_issue, send_slack_alert


@pytest.mark.asyncio
async def test_send_slack_alert_success(monkeypatch):
    monkeypatch.setenv("SLACK_WEBHOOK_URL", "https://hooks.slack.com/services/mock")

    mock_resp = AsyncMock()
    mock_resp.is_success = True
    mock_resp.status_code = 200

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_resp
        await send_slack_alert("example.com", "High", 75, 3)

        mock_post.assert_awaited_once()
        _, kwargs = mock_post.await_args
        payload = kwargs["json"]
        assert payload["attachments"][0]["color"] == "#f97316"


@pytest.mark.asyncio
async def test_send_slack_alert_error(monkeypatch):
    monkeypatch.setenv("SLACK_WEBHOOK_URL", "https://hooks.slack.com/services/mock")

    mock_resp = AsyncMock()
    mock_resp.is_success = False
    mock_resp.status_code = 500
    mock_resp.text = "Internal Server Error"

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_resp
        # Should not raise uncaught exception
        await send_slack_alert("example.com", "Critical", 95, 5)
        mock_post.assert_awaited_once()


@pytest.mark.asyncio
async def test_create_jira_issue_normalizes_severity(monkeypatch):
    monkeypatch.setenv("JIRA_URL", "https://jira.example.com")
    monkeypatch.setenv("JIRA_EMAIL", "test@example.com")
    monkeypatch.setenv("JIRA_API_TOKEN", "token123")
    monkeypatch.setenv("JIRA_PROJECT_KEY", "SEC")

    mock_resp = AsyncMock()
    mock_resp.is_success = True
    mock_resp.status_code = 201

    findings = [
        {"severity": "CRITICAL", "type": "SQLi", "detail": "User input in query"},
        {"severity": "High", "type": "XSS", "detail": "Reflected payload"},
        {"severity": "Low", "type": "Info", "detail": "Server banner leak"},
    ]

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_resp
        await create_jira_issue("example.com", "Critical", findings)

        mock_post.assert_awaited_once()
        _, kwargs = mock_post.await_args
        payload = kwargs["json"]
        desc = payload["fields"]["description"]
        assert "SQLi" in desc
        assert "XSS" in desc
        assert "Server banner leak" not in desc
        assert payload["fields"]["priority"]["name"] == "High"
