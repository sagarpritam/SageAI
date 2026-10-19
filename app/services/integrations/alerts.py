"""Third-party notifications — Slack and Jira integrations."""

import logging
import os

import httpx

logger = logging.getLogger("sageai.integrations.alerts")


async def send_slack_alert(
    target: str, risk_level: str, risk_score: int, findings_count: int
):
    """Send scan result to Slack webhook."""
    webhook_url = os.getenv("SLACK_WEBHOOK_URL")
    if not webhook_url:
        logger.debug("Slack not configured — skipping")
        return

    color = {
        "critical": "#ef4444",
        "high": "#f97316",
        "medium": "#eab308",
        "low": "#22c55e",
    }.get(risk_level.lower(), "#6b7280")

    payload = {
        "attachments": [
            {
                "color": color,
                "blocks": [
                    {
                        "type": "header",
                        "text": {
                            "type": "plain_text",
                            "text": "🛡️ SageAI Scan Complete",
                        },
                    },
                    {
                        "type": "section",
                        "fields": [
                            {"type": "mrkdwn", "text": f"*Target:*\n{target}"},
                            {"type": "mrkdwn", "text": f"*Risk Level:*\n{risk_level}"},
                            {
                                "type": "mrkdwn",
                                "text": f"*Risk Score:*\n{risk_score}/100",
                            },
                            {
                                "type": "mrkdwn",
                                "text": f"*Findings:*\n{findings_count}",
                            },
                        ],
                    },
                ],
            }
        ],
    }

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(webhook_url, json=payload)
            if resp.is_success:
                logger.info(f"Slack alert sent for {target}")
            else:
                logger.error(
                    f"Slack alert failed for {target} with status {resp.status_code}: {resp.text}"
                )
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

    critical_findings = [
        f
        for f in findings
        if str(f.get("severity", "")).strip().lower() in ("critical", "high")
    ]
    if not critical_findings:
        return

    finding_lines = "\n".join(
        f"* [{str(f.get('severity', '')).upper()}] {f.get('type', 'unknown')}: {f.get('detail', '')}"
        for f in critical_findings[:10]
    )

    payload = {
        "fields": {
            "project": {"key": jira_project},
            "summary": f"[SageAI] {risk_level} risk — {target}",
            "description": f"SageAI security scan found {len(critical_findings)} critical/high findings:\n\n{finding_lines}",
            "issuetype": {"name": "Bug"},
            "priority": {
                "name": "High"
                if str(risk_level).strip().lower() == "critical"
                else "Medium"
            },
        }
    }

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{jira_url}/rest/api/2/issue",
                json=payload,
                auth=(jira_email, jira_token),
                headers={"Content-Type": "application/json"},
            )
            if resp.is_success:
                logger.info(f"Jira issue created for {target}")
            else:
                logger.error(
                    f"Jira issue creation failed for {target} with status {resp.status_code}: {resp.text}"
                )
    except Exception as e:
        logger.error(f"Jira integration failed: {e}")
