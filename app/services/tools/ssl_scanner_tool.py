"""SSL/TLS Scanner Tool Wrapper."""

import asyncio
from concurrent.futures import ThreadPoolExecutor
from .base import BaseTool
from app.services.ssl_scanner import scan_ssl

class SslScannerTool(BaseTool):
    @property
    def name(self) -> str:
        return "ssl_scanner"
        
    @property
    def description(self) -> str:
        return "Analyzes the SSL/TLS configuration of a target hostname. Returns information about the certificate validity, issuer, protocols, and potential misconfigurations. Use to check HTTPS security."
        
    async def run(self, target: str, **kwargs) -> list[dict]:
        hostname = target.replace("http://", "").replace("https://", "").split("/")[0]
        loop = asyncio.get_event_loop()
        
        with ThreadPoolExecutor(max_workers=1) as executor:
            try:
                results = await loop.run_in_executor(executor, scan_ssl, hostname)
                return results if results else []
            except Exception as e:
                return [{"type": "SSL Scan Error", "description": str(e), "severity": "Info"}]
