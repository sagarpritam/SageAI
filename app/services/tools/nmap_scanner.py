"""Nmap/Port Scanner Tool Wrapper."""

import asyncio
from concurrent.futures import ThreadPoolExecutor
from .base import BaseTool
from app.services.port_scanner import scan_ports

class NmapScannerTool(BaseTool):
    @property
    def name(self) -> str:
        return "nmap_scanner"
        
    @property
    def description(self) -> str:
        return "Scans common ports on a target hostname to find open services. Use this when you need to know what ports are open or what services are running on a server."
        
    async def run(self, target: str, **kwargs) -> list[dict]:
        hostname = target.replace("http://", "").replace("https://", "").split("/")[0]
        loop = asyncio.get_event_loop()
        
        # scan_ports is synchronous socket code, so we run it in an executor
        with ThreadPoolExecutor(max_workers=1) as executor:
            try:
                results = await loop.run_in_executor(executor, scan_ports, hostname)
                return results if results else []
            except Exception as e:
                return [{"type": "Port Scan Error", "description": str(e), "severity": "Info"}]
