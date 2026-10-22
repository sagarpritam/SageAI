"""AI Security Copilot Agent.

Provides interactive SecOps investigation, vulnerability deep-dives,
threat intelligence enrichment via CISA KEV / NVD feeds, and safe PoC generation
with strict multi-tenant authorization boundaries and safety guardrails.
"""

import json
import logging
import re
from typing import Any, AsyncGenerator, Dict, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.finding import Finding
from app.models.scan import Scan
from app.services.agent.guardrails import INJECTION_PATTERNS
from app.services.ai_explainer import OWASP_MAP
from app.services.asset_inventory.verification_service import is_target_authorized
from app.services.llm.gateway import llm_gateway
from app.services.rag.vector_store import vector_store
from app.services.threat_feed.cve_indexer import cve_indexer

logger = logging.getLogger("SageAI.copilot")

COPILOT_SYSTEM_PROMPT = """You are SageAI Security Copilot, an elite autonomous cyber defense analyst and offensive/defensive security specialist.
Your mission is to help security engineers, developers, and SOC teams analyze scan results, understand vulnerability mechanics, assess real-world threat intelligence (including CISA Known Exploited Vulnerabilities and active ransomware campaigns), and generate safe verification steps and remediation patches.

Strict Operating Rules:
1. Multi-Tenant Scoping: You ONLY inspect and reference resources (scans, findings, assets) belonging to the user's authenticated organization.
2. Safe Verification: When asked for a PoC (Proof of Concept), produce ONLY safe, non-destructive diagnostic verification requests (e.g., HTTP header checks, benign test canaries, non-destructive path probes). NEVER generate destructive exploits, data wiping commands, or reverse shells.
3. Live Threat Context: When discussing CVEs, prominently highlight whether the vulnerability is in the CISA KEV catalog (actively exploited in the wild) and if it has known ransomware campaign associations.
4. Actionable Remediation: Always provide practical code snippets, configuration directives, or patch steps aligned with OWASP Top 10 standards.
5. Format responses in clean, technical Markdown with appropriate code blocks and bold headings.
"""


class CopilotAgent:
    """Enterprise AI Security Copilot with strictly tenant-scoped tools."""

    def __init__(self):
        self.indexer = cve_indexer
        self.vector_store = vector_store

    def _sanitize_input(self, text: str) -> str:
        """Sanitize user input against prompt injection patterns."""
        sanitized = text
        for pattern in INJECTION_PATTERNS:
            sanitized = re.sub(pattern, "[FILTERED_INJECTION]", sanitized, flags=re.IGNORECASE)
        return sanitized

    async def get_scan_summary(
        self, scan_id: str, org_id: str, db: AsyncSession
    ) -> Dict[str, Any]:
        """Fetch and summarize a scan strictly scoped to org_id."""
        if not scan_id or not org_id:
            return {"error": "scan_id and org_id are required", "authorized": False}

        query = select(Scan).where(Scan.id == scan_id, Scan.organization_id == str(org_id))
        res = await db.execute(query)
        scan = res.scalar_one_or_none()

        if not scan:
            logger.warning(f"Tenant {org_id} attempted unauthorized or invalid scan access: {scan_id}")
            return {
                "error": f"Scan '{scan_id}' not found or does not belong to your organization.",
                "authorized": False,
            }

        # Fetch findings for this scan
        f_query = select(Finding).where(Finding.scan_id == scan.id)
        f_res = await db.execute(f_query)
        findings = f_res.scalars().all()

        severity_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}
        findings_summary = []
        for f in findings:
            sev = f.severity.lower() if f.severity else "medium"
            if sev in severity_counts:
                severity_counts[sev] += 1
            findings_summary.append({
                "id": f.id,
                "title": f.title,
                "severity": f.severity,
                "cve_id": f.cve_id,
                "status": f.status,
                "cvss_score": f.cvss_score,
                "target": f.target or scan.target,
            })

        return {
            "authorized": True,
            "scan_id": scan.id,
            "target": scan.target,
            "scan_type": getattr(scan, "scan_type", "full_scan"),
            "status": scan.status,
            "risk_score": scan.risk_score,
            "created_at": scan.created_at.isoformat() if scan.created_at else None,
            "severity_counts": severity_counts,
            "total_findings": len(findings),
            "findings": findings_summary[:25],
        }

    async def explain_vulnerability(
        self,
        cve_or_title: str,
        finding_id: Optional[str] = None,
        org_id: Optional[str] = None,
        db: Optional[AsyncSession] = None,
    ) -> Dict[str, Any]:
        """Provide detailed root-cause, OWASP mapping, and live CISA KEV threat intel."""
        cve_id = None
        finding_title = cve_or_title
        finding_desc = ""
        target_info = None

        # If a finding_id was provided, verify tenant ownership
        if finding_id and db and org_id:
            query = select(Finding).join(Scan).where(
                Finding.id == finding_id,
                Scan.organization_id == str(org_id),
            )
            res = await db.execute(query)
            finding = res.scalar_one_or_none()
            if not finding:
                return {
                    "error": f"Finding '{finding_id}' not found or unauthorized.",
                    "authorized": False,
                }
            finding_title = finding.title
            finding_desc = finding.description or ""
            cve_id = finding.cve_id
            target_info = finding.target

        # Extract CVE pattern if present
        cve_match = re.search(r"CVE-\d{4}-\d{4,7}", cve_or_title, re.IGNORECASE)
        if cve_match and not cve_id:
            cve_id = cve_match.group(0).upper()

        threat_intel = None
        if cve_id:
            threat_intel = await self.indexer.get_cve(cve_id)

        # OWASP mapping lookup
        owasp_data = None
        for key, val in OWASP_MAP.items():
            if key.lower() in finding_title.lower() or key.lower() in finding_desc.lower():
                owasp_data = val
                break

        if not owasp_data:
            owasp_data = {
                "owasp_id": "A05:2021",
                "owasp_category": "Security Misconfiguration",
                "cwe": "CWE-200",
            }

        return {
            "authorized": True,
            "query": cve_or_title,
            "cve_id": cve_id,
            "title": finding_title,
            "description": finding_desc,
            "target": target_info,
            "owasp": owasp_data,
            "threat_intel": threat_intel.model_dump() if threat_intel else None,
            "is_actively_exploited": bool(threat_intel and threat_intel.is_kev),
            "ransomware_campaign": threat_intel.ransomware_campaign if threat_intel else None,
            "remediation_action": (threat_intel.remediation_action if threat_intel else None) or "Apply latest vendor security patch and implement defense-in-depth controls.",
        }

    async def generate_poc_curl(
        self,
        vulnerability_type: str,
        target: Optional[str] = None,
        finding_id: Optional[str] = None,
        org_id: Optional[str] = None,
        db: Optional[AsyncSession] = None,
    ) -> Dict[str, Any]:
        """Generate safe, non-destructive curl verification commands with authorization check."""
        clean_target = target

        # If finding_id is provided, verify ownership and extract target
        if finding_id and db and org_id:
            query = select(Finding).join(Scan).where(
                Finding.id == finding_id,
                Scan.organization_id == str(org_id),
            )
            res = await db.execute(query)
            finding = res.scalar_one_or_none()
            if not finding:
                return {
                    "error": f"Finding '{finding_id}' not found or unauthorized.",
                    "authorized": False,
                }
            clean_target = clean_target or finding.target

        clean_target = clean_target or "https://target.example.com"
        clean_target = clean_target.strip()
        if not clean_target.startswith("http://") and not clean_target.startswith("https://"):
            clean_target = f"https://{clean_target}"

        # If org_id and db are provided, verify target authorization
        is_verified_asset = False
        if db and org_id:
            is_verified_asset = await is_target_authorized(db, org_id, clean_target)

        # Generate safe verification curl command
        v_type = vulnerability_type.lower()
        if "header" in v_type or "missing" in v_type or "hsts" in v_type or "csp" in v_type:
            curl_cmd = f"curl -s -I -L '{clean_target}'"
            purpose = "Inspect response headers for missing HSTS, CSP, and X-Frame-Options headers."
            expected_safe = "Headers like Strict-Transport-Security and Content-Security-Policy should be present."
        elif "sqli" in v_type or "sql" in v_type:
            curl_cmd = f"curl -s -w '\\nHTTP_CODE: %{{http_code}}\\nTIME: %{{time_total}}s\\n' -G '{clean_target}/api/search' --data-urlencode 'q=sageai_canary_test'"
            purpose = "Send benign search query to check for SQL syntax error disclosures or unexpected 500 status codes."
            expected_safe = "Server responds with standard 200/404 JSON, without SQL traceback errors."
        elif "xss" in v_type:
            curl_cmd = f"curl -s '{clean_target}/search?q=%3C!--sageai-canary--%3E' | grep -q '<!--sageai-canary-->' && echo 'VULNERABLE (Unescaped)' || echo 'SAFE (Escaped)'"
            purpose = "Check if benign comment characters are reflected unescaped in server response HTML."
            expected_safe = "Response characters are HTML-encoded or omitted."
        elif "ssrf" in v_type:
            curl_cmd = f"curl -s -o /dev/null -w '%{{http_code}}' -X POST '{clean_target}/api/fetch' -H 'Content-Type: application/json' -d '{{\"url\":\"https://example.com\"}}'"
            purpose = "Verify webhook/fetch endpoint rejects internal/loopback IPs and respects SSRF allow-lists."
            expected_safe = "Internal IP queries (e.g. 127.0.0.1, 169.254.169.254) are rejected with 400 Bad Request."
        elif "auth" in v_type or "bypass" in v_type:
            curl_cmd = f"curl -s -o /dev/null -w 'Status: %{{http_code}}\\n' '{clean_target}/admin'"
            purpose = "Ensure protected administrative routes require valid authentication tokens."
            expected_safe = "Server returns 401 Unauthorized or 403 Forbidden without valid session."
        else:
            curl_cmd = f"curl -s -I '{clean_target}'"
            purpose = "Perform benign HTTP header inspection."
            expected_safe = "Standard server response with security headers configured."

        return {
            "authorized": True,
            "target": clean_target,
            "target_verified_by_tenant": is_verified_asset,
            "vulnerability_type": vulnerability_type,
            "curl_command": curl_cmd,
            "purpose": purpose,
            "expected_safe_behavior": expected_safe,
            "safety_warning": "Diagnostic non-destructive verification only. Never execute active exploitation on unapproved targets.",
        }

    def query_threat_intel(self, query: str, limit: int = 5, kev_only: bool = False) -> List[Dict[str, Any]]:
        """Query CISA KEV and indexed threat intelligence."""
        threats = self.indexer.search(query=query, limit=limit, kev_only=kev_only)
        return [t.model_dump() for t in threats]

    async def chat(
        self,
        message: str,
        org_id: str,
        db: AsyncSession,
        context: Optional[Dict[str, Any]] = None,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> Dict[str, Any]:
        """Execute Copilot multi-turn conversation with dynamic tool enrichment."""
        user_msg = self._sanitize_input(message.strip())
        if not user_msg:
            return {"reply": "Please enter a question or command for SageAI Copilot.", "sources": []}

        system_prompt = COPILOT_SYSTEM_PROMPT
        sources = []
        tool_artifacts = []

        # ── Tool 1: Scan context enrichment ──
        scan_id = (context or {}).get("scan_id")
        if scan_id or "scan" in user_msg.lower():
            # If scan_id in context, summarize it
            if scan_id:
                summary = await self.get_scan_summary(scan_id=scan_id, org_id=org_id, db=db)
                if summary.get("authorized"):
                    tool_artifacts.append(f"AUTHENTICATED SCAN SUMMARY (Target: {summary['target']}):\n"
                                          f"- Risk Score: {summary['risk_score']}\n"
                                          f"- Findings: {json.dumps(summary['severity_counts'])}\n"
                                          f"- Total: {summary['total_findings']}")
                    sources.append({"title": f"Scan {scan_id[:8]} Context", "type": "scan"})

        # ── Tool 2: CVE / Vulnerability threat intel lookup ──
        cve_match = re.search(r"CVE-\d{4}-\d{4,7}", user_msg, re.IGNORECASE)
        if cve_match:
            cve_id = cve_match.group(0).upper()
            cve_data = await self.indexer.get_cve(cve_id)
            if cve_data:
                kev_str = "YES (ACTIVELY EXPLOITED IN THE WILD)" if cve_data.is_kev else "No known active exploitation"
                ransom_str = f"Ransomware Campaign: {cve_data.ransomware_campaign}" if cve_data.ransomware_campaign else ""
                tool_artifacts.append(
                    f"LIVE THREAT INTEL FOR {cve_id}:\n"
                    f"- Title: {cve_data.title}\n"
                    f"- CISA KEV: {kev_str}\n"
                    f"- CVSS Score: {cve_data.cvss_score}\n"
                    f"- Severity: {cve_data.severity.upper()}\n"
                    f"{ransom_str}\n"
                    f"- Required Action: {cve_data.remediation_action or 'Apply vendor updates.'}"
                )
                sources.append({"title": f"CISA KEV: {cve_id}", "type": "threat_intel"})

        # ── Tool 3: PoC Curl generation request ──
        if any(term in user_msg.lower() for term in ["curl", "poc", "reproduce", "verify", "probe"]):
            target_url = (context or {}).get("target") or "https://target.example.com"
            finding_id = (context or {}).get("finding_id")
            poc = await self.generate_poc_curl(
                vulnerability_type=user_msg,
                target=target_url,
                finding_id=finding_id,
                org_id=org_id,
                db=db,
            )
            tool_artifacts.append(
                f"SAFE VERIFICATION CURL COMMAND:\n```bash\n{poc['curl_command']}\n```\n"
                f"Purpose: {poc['purpose']}\n"
                f"Expected Safe Result: {poc['expected_safe_behavior']}"
            )
            sources.append({"title": "Safe PoC Verification Generator", "type": "poc"})

        # ── Tool 4: RAG Vector Knowledge Ingestion ──
        try:
            rag_docs = await self.vector_store.search(user_msg, top_k=2)
            if rag_docs:
                rag_snippets = "\n".join([f"- {d['text']}" for d in rag_docs])
                tool_artifacts.append(f"CYBERSECURITY KNOWLEDGE BASE:\n{rag_snippets}")
                for d in rag_docs:
                    sources.append({"title": d["metadata"].get("title", "OWASP Guidance"), "type": "rag"})
        except Exception as e:
            logger.debug(f"RAG search error: {e}")

        # Assemble full prompt
        if tool_artifacts:
            system_prompt += "\n\nVERIFIED SECURITY CONTEXT & TOOL OUTPUTS:\n" + "\n\n".join(tool_artifacts)

        # Include prior conversation turns if provided
        conversation_prompt = ""
        if history:
            for turn in history[-4:]:
                role = turn.get("role", "user")
                content = turn.get("content", "")
                conversation_prompt += f"{role.upper()}: {content}\n"
        conversation_prompt += f"USER: {user_msg}\nASSISTANT:"

        try:
            from app.core.config import settings
            provider = "nvidia" if settings.NVIDIA_API_KEY else "openai"
            reply = await llm_gateway.generate(
                prompt=conversation_prompt,
                system_message=system_prompt,
                org_id=str(org_id),
                provider=provider,
            )
            return {"reply": reply, "sources": sources}
        except Exception as e:
            logger.error(f"Copilot inference error: {e}")
            # Fallback high-utility response synthesizing tool outputs
            fallback_reply = (
                "### 🛡️ SageAI Copilot Analysis\n\n"
                f"**Query:** {user_msg}\n\n"
            )
            if tool_artifacts:
                fallback_reply += "#### 🔍 Investigation Findings & Context\n"
                for art in tool_artifacts:
                    fallback_reply += f"\n{art}\n"
            else:
                fallback_reply += (
                    "I am currently operating in resilient offline mode. "
                    "You can ask me to summarize scans (`scan_id`), look up CVEs (e.g., `CVE-2024-21887`), "
                    "or generate non-destructive verification curl commands for OWASP vulnerabilities."
                )
            return {"reply": fallback_reply, "sources": sources}

    async def stream_chat(
        self,
        message: str,
        org_id: str,
        db: AsyncSession,
        context: Optional[Dict[str, Any]] = None,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> AsyncGenerator[str, None]:
        """Stream Copilot responses via Server-Sent Events (SSE)."""
        result = await self.chat(
            message=message, org_id=org_id, db=db, context=context, history=history
        )
        reply = result.get("reply", "")
        sources = result.get("sources", [])

        # Stream words as SSE chunks
        words = reply.split(" ")
        for i, word in enumerate(words):
            token = word + (" " if i < len(words) - 1 else "")
            chunk = json.dumps({"token": token, "done": False})
            yield f"data: {chunk}\n\n"

        # Final completion event with sources
        final_chunk = json.dumps({"token": "", "done": True, "sources": sources})
        yield f"data: {final_chunk}\n\n"


# Global singleton instance
copilot_agent = CopilotAgent()
