"""SageAI Plugin: Nmap Port Scanner"""
from app.plugins.base import SecurityPlugin, PluginResult, PluginMetadata
from app.services.tools.nmap_scanner import NmapScannerTool


class NmapPlugin(SecurityPlugin):
    @property
    def meta(self) -> PluginMetadata:
        return PluginMetadata(
            name="nmap",
            version="1.0.0",
            author="SageAI Core",
            description="Port scanning and service detection using Nmap integration. Identifies open ports, running services, and potential exposure points.",
            category="network",
            tags=["ports", "services", "network", "infrastructure"],
            requires_tools=["nmap"],
            min_plan="free",
        )

    async def run(self, target: str, **kwargs) -> PluginResult:
        tool = NmapScannerTool()
        raw = await tool.run(target)
        findings = raw if isinstance(raw, list) else []
        metadata = {"tool": "nmap", "target": target}
        return PluginResult(self.name, target, findings, metadata)
