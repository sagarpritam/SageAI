"""HTTP Vulnerability Scanner Tool Wrapper."""

import asyncio
from .base import BaseTool

# We need to import the individual check functions from scanner_service
# To avoid circular imports, we import them directly here.
from app.services.scanner_service import check_security_headers, test_xss, test_sqli

class HttpVulnScannerTool(BaseTool):
    @property
    def name(self) -> str:
        return "http_vuln_scanner"
        
    @property
    def description(self) -> str:
        return "Checks a given URL for common HTTP vulnerabilities like missing security headers, reflected XSS, and basic SQL injection. Use this for web application scanning."
        
    async def run(self, target: str, **kwargs) -> list[dict]:
        results = await asyncio.gather(
            check_security_headers(target),
            test_xss(target),
            test_sqli(target),
            return_exceptions=True,
        )
        
        findings = []
        for r in results:
            if isinstance(r, dict):
                findings.append(r)
            elif isinstance(r, Exception):
                pass # Ignore failed checks
                
        return findings
