"""Third-party integrations — Slack and Jira."""

import os
import logging
import httpx

logger = logging.getLogger("sageai.integrations")


async def send_slack_alert(target: str, risk_level: str, risk_score: int, findings_count: int):
    """Send scan result to Slack webhook."""
    webhook_url = os.getenv("SLACK_WEBHOOK_URL")
    if not webhook_url:
        logger.debug("Slack not configured — skipping")
        return

    color = {"Critical": "#ef4444", "High": "#f97316", "Medium": "#eab308", "Low": "#22c55e"}.get(risk_level, "#6b7280")

    payload = {
        "attachments": [{
            "color": color,
            "blocks": [
                {"type": "header", "text": {"type": "plain_text", "text": f"🛡️ SageAI Scan Complete"}},
                {"type": "section", "fields": [
                    {"type": "mrkdwn", "text": f"*Target:*\n{target}"},
                    {"type": "mrkdwn", "text": f"*Risk Level:*\n{risk_level}"},
                    {"type": "mrkdwn", "text": f"*Risk Score:*\n{risk_score}/100"},
                    {"type": "mrkdwn", "text": f"*Findings:*\n{findings_count}"},
                ]},
            ],
        }],
    }

    try:
        async with httpx.AsyncClient() as client:
            await client.post(webhook_url, json=payload)
        logger.info(f"Slack alert sent for {target}")
    except Exception as e:
        logger.error(f"Slack alert failed: {e}")


async def create_jira_issue(target: str, risk_level: str, findings: list[dict]):
    """Create a Jira issue for critical/high findings."""
    jira_url = os.getenv("JIRA_URL")
    jira_email = os.getenv("JIRA_EMAIL")
    jira_token = os.getenv("JIRA_API_TOKEN")
    jira_project = os.getenv("JIRA_PROJECT_KEY")

    if not all([jira_url, jira_email, jira_token, jira_project]):
        logger.debug("Jira not configured — skipping")
        return

    critical_findings = [f for f in findings if f.get("severity") in ("critical", "high")]
    if not critical_findings:
        return

    finding_lines = "\n".join(
        f"* [{f['severity'].upper()}] {f.get('type', 'unknown')}: {f.get('detail', '')}"
        for f in critical_findings[:10]
    )

    payload = {
        "fields": {
            "project": {"key": jira_project},
            "summary": f"[SageAI] {risk_level} risk — {target}",
            "description": f"SageAI security scan found {len(critical_findings)} critical/high findings:\n\n{finding_lines}",
            "issuetype": {"name": "Bug"},
            "priority": {"name": "High" if risk_level == "Critical" else "Medium"},
        }
    }

    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{jira_url}/rest/api/2/issue",
                json=payload,
                auth=(jira_email, jira_token),
                headers={"Content-Type": "application/json"},
            )
        logger.info(f"Jira issue created for {target}")
    except Exception as e:
        logger.error(f"Jira integration failed: {e}")
