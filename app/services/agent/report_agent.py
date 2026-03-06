"""
SageAI 2.0 — ReportAgent
Generates comprehensive security reports from multi-agent findings.
Supports: Executive Summary, Technical Deep-dive, HackerOne format, PDF metadata.
"""
import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List

from app.services.llm.gateway import llm_gateway

logger = logging.getLogger("SageAI.report_agent")

REPORT_SYSTEM = """You are ReportAgent — a senior security consultant writing professional reports.
You synthesize findings from multiple AI agents into clear, actionable security reports."""

REPORT_PROMPT = """Generate a professional security assessment report for: {target}

=== RECON SUMMARY ===
{recon_summary}

=== VERIFIED FINDINGS ({finding_count} total, {critical_count} critical) ===
{findings}

=== ATTACK GRAPH PATHS ===
{attack_paths}

Write a markdown report with these sections:
1. ## Executive Summary (2 paragraphs for non-technical stakeholders)
2. ## Attack Surface Overview (what was discovered)
3. ## Critical Findings (only severity Critical/High, with CVSS-like scoring)
4. ## Attack Path Analysis (describe the most dangerous chain)
5. ## Remediation Roadmap (prioritized, with effort estimates)
6. ## Appendix: Full Finding List (table format)

Be specific, technical where needed, and always conclude with clear next steps."""


class ReportAgent:
    """
    Report generation agent.
    Synthesizes all agent outputs into a structured security report.
    """

    def __init__(self, org_id: str = "system"):
        self.org_id = org_id

    async def run(
        self,
        target: str,
        recon_result: Dict[str, Any],
        scanner_result: Dict[str, Any],
        exploit_result: Dict[str, Any],
        knowledge_graph_paths: List[Dict] = None,
    ) -> Dict[str, Any]:
        """Generate the final consolidated security report."""
        logger.info(f"[ReportAgent] Generating report for {target}")

        verified_findings = exploit_result.get("verified_findings", [])
        all_findings = scanner_result.get("findings", [])
        critical_count = exploit_result.get("critical_confirmed", 0)
        attack_paths = knowledge_graph_paths or []

        # Compute risk score
        severity_weights = {"Critical": 10, "High": 7, "Medium": 4, "Low": 1, "Info": 0}
        raw_score = sum(severity_weights.get(f.get("severity", "Info"), 0) for f in verified_findings)
        normalized = min(raw_score, 100) if verified_findings else 0

        if normalized >= 70:
            risk_level = "Critical"
        elif normalized >= 45:
            risk_level = "High"
        elif normalized >= 20:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        # AI-generated narrative
        markdown_report = ""
        try:
            recon_summary = recon_result.get("ai_summary", {})
            top_findings = (verified_findings or all_findings)[:8]
            path_summary = [
                f"{p.get('path', '')} → Risk: {p.get('risk_level', '')}"
                for p in attack_paths[:3]
            ]

            prompt = REPORT_PROMPT.format(
                target=target,
                recon_summary=json.dumps(recon_summary, indent=2),
                finding_count=len(all_findings),
                critical_count=critical_count,
                findings=json.dumps(top_findings, indent=2)[:5000],
                attack_paths="\n".join(path_summary) or "No attack paths computed.",
            )
            markdown_report = await llm_gateway.generate(
                prompt, system_message=REPORT_SYSTEM, org_id=self.org_id
            )
        except Exception as e:
            logger.warning(f"[ReportAgent] AI report generation failed: {e}")
            markdown_report = self._fallback_report(target, all_findings, risk_level, normalized)

        # Severity breakdown
        severity_counts = {}
        for f in all_findings:
            sev = f.get("severity", "Info")
            severity_counts[sev] = severity_counts.get(sev, 0) + 1

        return {
            "agent": "ReportAgent",
            "target": target,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "risk_score": normalized,
            "risk_level": risk_level,
            "finding_count": len(all_findings),
            "critical_confirmed": critical_count,
            "severity_breakdown": severity_counts,
            "subdomains_found": len(recon_result.get("subdomains", [])),
            "attack_surface_rating": recon_result.get("ai_summary", {}).get("attack_surface_rating", "Unknown"),
            "attack_paths": attack_paths,
            "verified_findings": verified_findings,
            "all_findings": all_findings,
            "markdown_report": markdown_report,
        }

    def _fallback_report(
        self, target: str, findings: List[Dict], risk_level: str, score: int
    ) -> str:
        lines = [
            f"# Security Assessment: {target}",
            f"\n**Risk Level:** {risk_level} ({score}/100)  ",
            f"**Generated:** {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
            "\n## Executive Summary",
            f"SageAI performed an automated security assessment of `{target}` and discovered "
            f"{len(findings)} security findings with an overall risk score of {score}/100.",
            "\n## Findings",
        ]
        if not findings:
            lines.append("\n✅ No significant vulnerabilities detected.")
        else:
            lines.append("\n| # | Finding | Severity | Source |")
            lines.append("|---|---------|----------|--------|")
            for i, f in enumerate(findings, 1):
                lines.append(
                    f"| {i} | {f.get('type', '—')} | {f.get('severity', '—')} | {f.get('source', '—')} |"
                )
        return "\n".join(lines)
