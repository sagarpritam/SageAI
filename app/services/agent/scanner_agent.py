"""
SageAI 2.0 — ScannerAgent
Runs the vulnerability scanning pipeline against discovered hosts.
Orchestrates all security tools and returns structured findings.
"""
import logging
import asyncio
from typing import Dict, Any, List

from app.services.llm.gateway import llm_gateway
from app.services.tools import get_all_tools, get_tool

logger = logging.getLogger("SageAI.scanner_agent")

SCANNER_SYSTEM = """You are ScannerAgent — a specialist in vulnerability detection.
Triage and deduplicate findings from multiple security tools."""

SCANNER_PROMPT = """You are triaging vulnerability scan results for: {target}

Raw tool results:
{tool_results}

Produce a JSON array of deduplicated vulnerabilities:
[
  {{
    "type": "Vulnerability Name",
    "description": "Clear technical description",
    "severity": "Critical|High|Medium|Low|Info",
    "source": "tool name",
    "owasp": "OWASP Top 10 category or null",
    "cve": "CVE-XXXX-XXXXX or null",
    "evidence": "specific technical evidence"
  }}
]
ONLY raw JSON array, no markdown."""


class ScannerAgent:
    """
    Vulnerability scanning agent.
    Selects and runs the right tools, then uses AI to triage findings.
    """

    # Map vulnerability keywords → relevant tools
    TOOL_KEYWORDS = {
        "ssl": "ssl_scanner",
        "tls": "ssl_scanner",
        "certificate": "ssl_scanner",
        "port": "nmap_scanner",
        "service": "nmap_scanner",
        "nmap": "nmap_scanner",
        "dns": "dns_scanner",
        "subdomain": "dns_scanner",
        "http": "http_vuln_scanner",
        "header": "http_vuln_scanner",
        "web": "http_vuln_scanner",
        "osint": "osint_scanner",
        "shodan": "osint_scanner",
        "code": "sast_scanner",
        "sast": "sast_scanner",
    }

    def __init__(self, org_id: str = "system"):
        self.org_id = org_id

    def _select_tools(self, context: str) -> List:
        """Select relevant tools based on context keywords. Falls back to all scan tools."""
        all_tools = get_all_tools()
        # Filter out dev/PR tools for external scanning
        scan_tools = [t for t in all_tools if t.name not in ("sast_scanner", "github_pr")]

        context_lower = context.lower()
        selected_names = set()
        for keyword, tool_name in self.TOOL_KEYWORDS.items():
            if keyword in context_lower:
                selected_names.add(tool_name)

        if selected_names:
            selected = [t for t in scan_tools if t.name in selected_names]
            if selected:
                return selected

        return scan_tools  # Default: all external scan tools

    async def run(self, target: str, context: str = "full scan") -> Dict[str, Any]:
        """Run targeted vulnerability scans and return AI-triaged findings."""
        logger.info(f"[ScannerAgent] Scanning {target} (context: {context})")

        tools = self._select_tools(context)
        logger.info(f"[ScannerAgent] Running {len(tools)} tools: {[t.name for t in tools]}")

        # Run all tools concurrently
        sem = asyncio.Semaphore(6)
        async def run_tool(tool):
            async with sem:
                try:
                    result = await tool.run(target)
                    return tool.name, result
                except Exception as e:
                    return tool.name, {"error": str(e)}

        results = await asyncio.gather(*[run_tool(t) for t in tools], return_exceptions=True)
        tool_results = {}
        for r in results:
            if not isinstance(r, Exception):
                name, data = r
                tool_results[name] = data

        # AI triage
        import json
        findings = []
        try:
            # Summarize tool results (truncate to avoid token limit)
            summarized = {k: (v[:3] if isinstance(v, list) else v) for k, v in tool_results.items()}
            prompt = SCANNER_PROMPT.format(
                target=target,
                tool_results=json.dumps(summarized, indent=2)[:6000],
            )
            ai_response = await llm_gateway.generate(
                prompt, system_message=SCANNER_SYSTEM, org_id=self.org_id
            )
            cleaned = ai_response.replace("```json", "").replace("```", "").strip()
            findings = json.loads(cleaned)
            if not isinstance(findings, list):
                findings = []
        except Exception as e:
            logger.warning(f"[ScannerAgent] AI triage failed: {e}")
            # Fall back to raw tool output
            for tool_name, data in tool_results.items():
                if isinstance(data, list):
                    for item in data:
                        findings.append({
                            "type": item.get("type", "finding"),
                            "description": item.get("detail", ""),
                            "severity": item.get("severity", "info").capitalize(),
                            "source": tool_name,
                            "owasp": None,
                            "cve": None,
                            "evidence": str(item)[:200],
                        })

        return {
            "agent": "ScannerAgent",
            "target": target,
            "tools_run": list(tool_results.keys()),
            "raw_results": tool_results,
            "findings": findings,
        }
