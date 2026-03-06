"""SageAI Plugin: SSL/TLS Scanner"""
from app.plugins.base import SecurityPlugin, PluginResult, PluginMetadata
from app.services.ssl_scanner import scan_ssl


class SSLPlugin(SecurityPlugin):
    @property
    def meta(self) -> PluginMetadata:
        return PluginMetadata(
            name="ssl_tls",
            version="1.0.0",
            author="SageAI Core",
            description="Analyzes SSL/TLS configuration for weak ciphers, expired certificates, HSTS misconfigurations, and protocol downgrade vulnerabilities.",
            category="crypto",
            tags=["ssl", "tls", "certificates", "https", "crypto"],
            min_plan="free",
        )

    async def run(self, target: str, **kwargs) -> PluginResult:
        host = target.replace("https://", "").replace("http://", "").split("/")[0]
        try:
            findings = await scan_ssl(host)
        except Exception as e:
            findings = [{"type": "ssl_scan_error", "detail": str(e), "severity": "info"}]
        return PluginResult(self.name, target, findings or [], {"host": host})
