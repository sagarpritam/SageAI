"""DNS/Subdomain Scanner Tool Wrapper."""

import asyncio
from concurrent.futures import ThreadPoolExecutor
from .base import BaseTool
from app.services.dns_scanner import scan_dns

class DnsScannerTool(BaseTool):
    @property
    def name(self) -> str:
        return "dns_scanner"
        
    @property
    def description(self) -> str:
        return "Performs DNS enumeration and subdomain discovery on a target. Finds A, AAAA, MX, TXT records and attempts to discover subdomains. Use for attack surface mapping."
        
    async def run(self, target: str, **kwargs) -> list[dict]:
        loop = asyncio.get_event_loop()
        
        with ThreadPoolExecutor(max_workers=1) as executor:
            try:
                results = await loop.run_in_executor(executor, scan_dns, target)
                return results if results else []
            except Exception as e:
                return [{"type": "DNS Scan Error", "description": str(e), "severity": "Info"}]
