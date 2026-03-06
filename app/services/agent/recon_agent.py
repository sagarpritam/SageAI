"""
SageAI 2.0 — ReconAgent
Responsible for all reconnaissance: subdomain enumeration, DNS resolution,
asset fingerprinting, and building the initial attack surface map.
"""
import logging
import asyncio
import socket
from typing import Dict, Any, List

from app.services.llm.gateway import llm_gateway
from app.services import crtsh_client, dns_scanner, shodan_client

logger = logging.getLogger("SageAI.recon_agent")

RECON_SYSTEM = """You are the ReconAgent — a specialist in attack surface reconnaissance.
Given raw discovery data, produce a structured JSON summary of the target's external footprint."""

RECON_PROMPT = """You are analyzing reconnaissance data for: {target}

Discovered subdomains: {subdomains}
DNS findings: {dns_findings}
Shodan enrichment: {shodan_summary}

Produce a JSON object:
{{
  "total_hosts": <int>,
  "interesting_hosts": ["list of hosts worth deeper investigation"],
  "infrastructure_summary": "2-3 sentence summary",
  "attack_surface_rating": "Small|Medium|Large|Massive",
  "recon_flags": ["list of notable findings"]
}}
Output ONLY valid JSON, no markdown."""


class ReconAgent:
    """
    Autonomous reconnaissance agent.
    Discovers the full external attack surface for a target domain.
    """

    def __init__(self, org_id: str = "system"):
        self.org_id = org_id

    async def run(self, target: str) -> Dict[str, Any]:
        """Run full recon pipeline and return structured intelligence."""
        target = target.replace("https://", "").replace("http://", "").split("/")[0]
        logger.info(f"[ReconAgent] Starting recon for {target}")

        subdomains = {target}
        dns_findings = []
        shodan_entries = {}

        # Step 1: Certificate transparency
        try:
            crt_results = await crtsh_client.search_certificates(target)
            for f in crt_results:
                for sub in f.get("subdomains", []):
                    clean = sub.lstrip("*.").strip()
                    if target in clean:
                        subdomains.add(clean)
        except Exception as e:
            logger.warning(f"[ReconAgent] crt.sh error: {e}")

        # Step 2: DNS enumeration
        try:
            dns_results = await dns_scanner.scan_dns(target)
            dns_findings = dns_results
            for f in dns_results:
                for sub in f.get("subdomains", []):
                    subdomains.add(sub)
        except Exception as e:
            logger.warning(f"[ReconAgent] DNS error: {e}")

        # Step 3: Resolve IPs + Shodan enrich (top 10 hosts)
        async def enrich(host: str):
            try:
                ip = socket.gethostbyname(host)
                shodan_data = await shodan_client.lookup_ip(host)
                return host, {"ip": ip, "shodan": shodan_data}
            except Exception:
                return host, {}

        sem = asyncio.Semaphore(8)
        async def bounded_enrich(h):
            async with sem:
                return await enrich(h)

        top_hosts = list(subdomains)[:15]
        results = await asyncio.gather(*[bounded_enrich(h) for h in top_hosts], return_exceptions=True)
        for r in results:
            if not isinstance(r, Exception):
                host, data = r
                if data:
                    shodan_entries[host] = data

        # Step 4: AI synthesis
        shodan_summary = {
            host: {
                "ip": d.get("ip"),
                "ports": [f.get("ports", []) for f in d.get("shodan", []) if "ports" in str(f)][:1],
            }
            for host, d in list(shodan_entries.items())[:8]
        }

        try:
            prompt = RECON_PROMPT.format(
                target=target,
                subdomains=sorted(subdomains)[:30],
                dns_findings=[f.get("type") for f in dns_findings[:10]],
                shodan_summary=shodan_summary,
            )
            ai_response = await llm_gateway.generate(
                prompt, system_message=RECON_SYSTEM, org_id=self.org_id
            )
            import json
            cleaned = ai_response.replace("```json", "").replace("```", "").strip()
            ai_summary = json.loads(cleaned)
        except Exception as e:
            logger.warning(f"[ReconAgent] AI synthesis failed: {e}")
            ai_summary = {
                "total_hosts": len(subdomains),
                "interesting_hosts": list(subdomains)[:5],
                "infrastructure_summary": f"Discovered {len(subdomains)} hosts for {target}.",
                "attack_surface_rating": "Medium" if len(subdomains) > 10 else "Small",
                "recon_flags": [],
            }

        return {
            "agent": "ReconAgent",
            "target": target,
            "subdomains": sorted(subdomains),
            "dns_findings": dns_findings,
            "shodan_data": shodan_entries,
            "ai_summary": ai_summary,
        }
