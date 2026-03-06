"""SageAI Plugin: Shodan Intelligence"""
import socket
from app.plugins.base import SecurityPlugin, PluginResult, PluginMetadata
from app.services import shodan_client


class ShodanPlugin(SecurityPlugin):
    @property
    def meta(self) -> PluginMetadata:
        return PluginMetadata(
            name="shodan",
            version="1.0.0",
            author="SageAI Core",
            description="Passive OSINT via Shodan InternetDB. Discovers open ports, known CVEs, CPEs, and hostnames without actively probing the target.",
            category="osint",
            tags=["shodan", "osint", "passive", "cve", "ports"],
            min_plan="free",
        )

    async def run(self, target: str, **kwargs) -> PluginResult:
        host = target.replace("https://", "").replace("http://", "").split("/")[0]
        try:
            ip = socket.gethostbyname(host)
        except Exception:
            ip = host

        findings = await shodan_client.lookup_ip(host)
        return PluginResult(
            self.name, target, findings or [],
            {"ip": ip, "source": "Shodan InternetDB"}
        )
