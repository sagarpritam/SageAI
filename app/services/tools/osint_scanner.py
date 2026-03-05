"""OSINT Scanner Tool Wrapper."""

import asyncio
import httpx
from .base import BaseTool

from app.services.shodan_client import lookup_ip
from app.services.crtsh_client import search_certificates
from app.services.observatory_client import analyze_site
from app.services.virustotal_client import check_url_reputation
from app.services.nvd_client import check_server_cves

class OsintScannerTool(BaseTool):
    @property
    def name(self) -> str:
        return "osint_scanner"
        
    @property
    def description(self) -> str:
        return "Performs Open-Source Intelligence (OSINT) gathering on a target. Checks Shodan, Certificate Transparency logs, Mozilla Observatory, VirusTotal, and known CVEs. Use this to gather public intelligence about a target."
        
    async def run(self, target: str, **kwargs) -> list[dict]:
        hostname = target.replace("http://", "").replace("https://", "").split("/")[0]
        
        server_header = ""
        try:
            async with httpx.AsyncClient(timeout=5, follow_redirects=True) as client:
                resp = await client.head(target)
                server_header = resp.headers.get("server", "")
        except Exception:
            pass

        results = await asyncio.gather(
            lookup_ip(hostname),
            search_certificates(hostname),
            analyze_site(hostname),
            check_url_reputation(target),
            check_server_cves(server_header),
            return_exceptions=True,
        )
        
        findings = []
        for r in results:
            if isinstance(r, list):
                findings.extend(r)
            elif isinstance(r, dict):
                findings.append(r)
                
        return findings
