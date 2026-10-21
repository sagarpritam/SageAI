"""Multi-channel notification dispatcher for SageAI.

Dispatches formatted security alerts to Slack, Discord, Microsoft Teams, and Generic Webhooks
with SSRF protection, severity thresholds, and timeout controls.
"""

import logging
from typing import Any, Dict, List, Optional

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import NotificationChannel
from app.routers.webhook_routes import is_safe_webhook_url
from app.utils.helpers import utc_now

logger = logging.getLogger("SageAI.alerting")

SEVERITY_LEVELS: Dict[str, int] = {
    "info": 0,
    "low": 1,
    "medium": 2,
    "high": 3,
    "critical": 4,
}


def _severity_meets_threshold(event_severity: str, min_severity: str) -> bool:
    """Check if the event's severity meets or exceeds the channel's configured minimum."""
    event_level = SEVERITY_LEVELS.get(event_severity.lower(), 1)
    min_level = SEVERITY_LEVELS.get(min_severity.lower(), 3)
    return event_level >= min_level


def build_slack_payload(
    title: str,
    target: str,
    severity: str,
    risk_score: float,
    details: str,
    findings_count: int = 0,
) -> Dict[str, Any]:
    """Format alert as a modern Slack Block Kit message."""
    color_emoji = "🔴" if severity.lower() in ("critical", "high") else "🟡"
    return {
        "text": f"{color_emoji} SageAI Alert: {title} ({severity.upper()}) on {target}",
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": f"{color_emoji} SageAI Security Alert",
                    "emoji": True,
                },
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*{title}*\n{details[:500]}",
                },
            },
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*Target:*\n`{target}`"},
                    {"type": "mrkdwn", "text": f"*Severity:*\n*{severity.upper()}*"},
                    {"type": "mrkdwn", "text": f"*Risk Score:*\n`{risk_score}/100`"},
                    {"type": "mrkdwn", "text": f"*Findings:*\n`{findings_count}`"},
                ],
            },
            {"type": "divider"},
        ],
    }


def build_discord_payload(
    title: str,
    target: str,
    severity: str,
    risk_score: float,
    details: str,
    findings_count: int = 0,
) -> Dict[str, Any]:
    """Format alert as a Discord embed."""
    # Red for critical (0xE74C3C), Orange for high (0xE67E22), Yellow for medium (0xF1C40F)
    color = (
        0xE74C3C
        if severity.lower() == "critical"
        else (0xE67E22 if severity.lower() == "high" else 0xF1C40F)
    )
    return {
        "username": "SageAI Security Shield",
        "embeds": [
            {
                "title": f"🚨 {title}",
                "description": details[:1000],
                "color": color,
                "timestamp": utc_now().isoformat(),
                "fields": [
                    {"name": "Target", "value": f"`{target}`", "inline": True},
                    {"name": "Severity", "value": severity.upper(), "inline": True},
                    {
                        "name": "Risk Score",
                        "value": f"`{risk_score}/100`",
                        "inline": True,
                    },
                    {
                        "name": "Findings Count",
                        "value": str(findings_count),
                        "inline": True,
                    },
                ],
                "footer": {"text": "SageAI Autonomous Cyber Defense"},
            }
        ],
    }


def build_msteams_payload(
    title: str,
    target: str,
    severity: str,
    risk_score: float,
    details: str,
    findings_count: int = 0,
) -> Dict[str, Any]:
    """Format alert for Microsoft Teams Office 365 Connector."""
    theme_color = "D32F2F" if severity.lower() in ("critical", "high") else "FBC02D"
    return {
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": theme_color,
        "summary": f"SageAI Alert: {title}",
        "sections": [
            {
                "activityTitle": f"🚨 SageAI Security Alert: {title}",
                "activitySubtitle": f"Severity: {severity.upper()} | Risk Score: {risk_score}/100",
                "text": details[:1000],
                "facts": [
                    {"name": "Target", "value": target},
                    {"name": "Severity", "value": severity.upper()},
                    {"name": "Risk Score", "value": str(risk_score)},
                    {"name": "Findings Count", "value": str(findings_count)},
                ],
            }
        ],
    }


def build_generic_payload(
    title: str,
    target: str,
    severity: str,
    risk_score: float,
    details: str,
    findings_count: int = 0,
    metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Format generic webhook payload."""
    return {
        "event": "security.alert",
        "timestamp": utc_now().isoformat(),
        "title": title,
        "target": target,
        "severity": severity.lower(),
        "risk_score": risk_score,
        "findings_count": findings_count,
        "details": details,
        "metadata": metadata or {},
    }


async def send_to_channel(
    channel: NotificationChannel,
    title: str,
    target: str,
    severity: str,
    risk_score: float,
    details: str,
    findings_count: int = 0,
    metadata: Optional[Dict[str, Any]] = None,
) -> bool:
    """Send alert to a specific NotificationChannel with SSRF check and payload formatting."""
    is_safe, error_msg = is_safe_webhook_url(channel.webhook_url)
    if not is_safe:
        logger.warning(
            f"Blocked alert dispatch to channel '{channel.id}' ({channel.name}): SSRF check failed - {error_msg}"
        )
        return False

    channel_type = (channel.channel_type or "webhook").lower()
    if channel_type == "slack":
        payload = build_slack_payload(
            title, target, severity, risk_score, details, findings_count
        )
    elif channel_type == "discord":
        payload = build_discord_payload(
            title, target, severity, risk_score, details, findings_count
        )
    elif channel_type in ("msteams", "teams"):
        payload = build_msteams_payload(
            title, target, severity, risk_score, details, findings_count
        )
    else:
        payload = build_generic_payload(
            title, target, severity, risk_score, details, findings_count, metadata
        )

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.post(
                channel.webhook_url,
                json=payload,
                headers={
                    "Content-Type": "application/json",
                    "User-Agent": "SageAI-Alerting/2.0",
                },
            )
            if res.is_success:
                logger.info(
                    f"Successfully dispatched alert to channel '{channel.name}' [{channel_type}]"
                )
                return True
            else:
                logger.warning(
                    f"Alert delivery to channel '{channel.name}' failed with HTTP {res.status_code}: {res.text[:200]}"
                )
                return False
    except Exception as e:
        logger.error(f"Error dispatching alert to channel '{channel.name}': {e}")
        return False


async def dispatch_security_alert(
    db: AsyncSession,
    organization_id: str,
    title: str,
    target: str,
    severity: str,
    risk_score: float,
    details: str,
    findings_count: int = 0,
    metadata: Optional[Dict[str, Any]] = None,
) -> int:
    """Find all active notification channels for an organization and dispatch matching alerts.

    Returns the count of successfully notified channels.
    """
    stmt = select(NotificationChannel).where(
        NotificationChannel.organization_id == organization_id,
        NotificationChannel.is_active == True,  # noqa: E712
    )
    result = await db.execute(stmt)
    channels: List[NotificationChannel] = list(result.scalars().all())

    if not channels:
        return 0

    success_count = 0
    for channel in channels:
        if _severity_meets_threshold(severity, channel.min_severity):
            delivered = await send_to_channel(
                channel=channel,
                title=title,
                target=target,
                severity=severity,
                risk_score=risk_score,
                details=details,
                findings_count=findings_count,
                metadata=metadata,
            )
            if delivered:
                success_count += 1

    return success_count
