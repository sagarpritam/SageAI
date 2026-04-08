"""AI Reporter Agent — generates professional security reports."""

import json
import logging
from typing import Any, Dict, List

from pydantic import BaseModel, Field

from app.services.ai_service import call_llm

logger = logging.getLogger(__name__)


class ReporterResponse(BaseModel):
    summary: str = Field(description="Executive summary of the overall security posture.")
    critical_issues: List[str] = Field(description="Bullet points highlighting the most severe issues.")
    recommendations: List[str] = Field(description="Prioritized actionable recommendations.")


def _fallback_report(analyzed_findings: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate a template report when the LLM is unavailable."""
    critical = [f for f in analyzed_findings if f.get("severity", "").lower() == "critical"]
    high = [f for f in analyzed_findings if f.get("severity", "").lower() == "high"]

    critical_issues = [
        f"[{f.get('severity', 'N/A').upper()}] {f.get('name', 'Unknown')} — {f.get('reason', 'Review required')}"
        for f in (critical + high)[:10]
    ]

    return {
        "summary": (
            f"Automated scan completed. Found {len(analyzed_findings)} total finding(s): "
            f"{len(critical)} critical, {len(high)} high. "
            "Manual review by a security professional is recommended."
        ),
        "critical_issues": critical_issues or ["No critical issues detected."],
        "recommendations": [
            "Prioritize remediation of critical and high-severity findings.",
            "Validate findings manually to confirm exploitability.",
            "Implement missing security headers and TLS best practices.",
            "Schedule a follow-up scan after remediation.",
        ],
    }


def create_report(analyzed_findings: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Create a professional executive security report.

    Falls back to a template-based report if the LLM is unavailable.
    """
    logger.info("Starting AI Reporter Agent...")

    if not analyzed_findings or all("error" in f for f in analyzed_findings):
        return {
            "summary": "No vulnerabilities detected or analysis failed.",
            "critical_issues": [],
            "recommendations": ["Ensure targets are correct and reachable."],
        }

    # Build a severity summary for the prompt
    sev_counts: Dict[str, int] = {}
    for f in analyzed_findings:
        sev = f.get("severity", "unknown").lower()
        sev_counts[sev] = sev_counts.get(sev, 0) + 1

    system_prompt = (
        "You are a Senior Cyber Threat Intelligence Consultant preparing an executive report.\n"
        "Your report must be clear, professional, concise, and client-friendly.\n"
        "Do not use overly complex jargon without explanation.\n"
        "Base your report exactly on the provided analyzed findings."
    )

    user_prompt = (
        f"Severity breakdown: {json.dumps(sev_counts)}\n\n"
        f"Analyzed findings:\n{json.dumps(analyzed_findings, indent=2)}\n\n"
        "Format into a structured executive report."
    )

    try:
        response: ReporterResponse = call_llm(
            prompt=user_prompt,
            system_prompt=system_prompt,
            response_model=ReporterResponse,
        )
        logger.info("AI Reporter Agent generated the report.")
        return response.model_dump()
    except Exception as exc:
        logger.warning("Reporter LLM failed: %s — using fallback template", exc)
        return _fallback_report(analyzed_findings)
