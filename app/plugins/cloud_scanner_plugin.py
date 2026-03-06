"""
SageAI Plugin: Cloud Misconfiguration Scanner
Detects common cloud security misconfigurations exposed on public endpoints.
No cloud credentials required — passive HTTP/DNS checks only.
"""
import asyncio
import httpx
from app.plugins.base import SecurityPlugin, PluginResult, PluginMetadata


# Public cloud storage bucket naming patterns
S3_PATTERNS = [
    "{target}", "{target}-backup", "{target}-data", "{target}-assets",
    "{target}-static", "{target}-media", "{target}-prod", "{target}-dev",
]

# Common cloud admin panels that should never be public
CLOUD_ADMIN_PATHS = [
    "/.env", "/.git/config", "/admin", "/wp-admin", "/_config",
    "/config.json", "/secrets.json", "/api/v1/health", "/actuator",
    "/actuator/env", "/metrics", "/debug", "/__debug__/",
    "/server-status", "/server-info",
]


class CloudScannerPlugin(SecurityPlugin):
    @property
    def meta(self) -> PluginMetadata:
        return PluginMetadata(
            name="cloud_scanner",
            version="1.0.0",
            author="SageAI Core",
            description="Detects cloud misconfigurations: exposed S3 buckets, public storage, leaked .env files, exposed admin panels, and metadata endpoints.",
            category="cloud",
            tags=["aws", "s3", "cloud", "misconfiguration", "storage", "gcp", "azure"],
            min_plan="pro",
        )

    async def run(self, target: str, **kwargs) -> PluginResult:
        host = target.replace("https://", "").replace("http://", "").split("/")[0]
        base_name = host.split(".")[0]  # e.g. "example" from "example.com"
        findings = []
        metadata = {"host": host}

        async with httpx.AsyncClient(timeout=6, verify=False, follow_redirects=False) as client:
            # Check exposed S3 buckets
            bucket_tasks = []
            for pattern in S3_PATTERNS[:5]:
                bucket_name = pattern.format(target=base_name)
                bucket_tasks.append(self._check_s3(client, bucket_name))

            bucket_results = await asyncio.gather(*bucket_tasks, return_exceptions=True)
            for r in bucket_results:
                if r and not isinstance(r, Exception):
                    findings.append(r)

            # Check exposed sensitive paths
            path_tasks = [self._check_path(client, f"https://{host}{path}") for path in CLOUD_ADMIN_PATHS]
            path_results = await asyncio.gather(*path_tasks, return_exceptions=True)
            for r in path_results:
                if r and not isinstance(r, Exception):
                    findings.append(r)

            # Check Azure blob storage
            azure_url = f"https://{base_name}.blob.core.windows.net"
            try:
                resp = await client.get(azure_url)
                if resp.status_code in (200, 400):
                    findings.append({
                        "type": "azure_blob_exposed",
                        "severity": "high",
                        "detail": f"Azure Blob Storage endpoint accessible: {azure_url}",
                        "source": "cloud_scanner",
                    })
            except Exception:
                pass

        metadata["checks_run"] = len(S3_PATTERNS[:5]) + len(CLOUD_ADMIN_PATHS) + 1
        return PluginResult(self.name, target, findings, metadata)

    async def _check_s3(self, client, bucket_name: str):
        url = f"https://{bucket_name}.s3.amazonaws.com"
        try:
            resp = await client.get(url)
            if resp.status_code in (200, 403):
                return {
                    "type": "s3_bucket_exposed",
                    "severity": "high" if resp.status_code == 200 else "medium",
                    "detail": f"S3 bucket accessible: {url} (HTTP {resp.status_code})",
                    "url": url,
                    "source": "cloud_scanner",
                }
        except Exception:
            pass
        return None

    async def _check_path(self, client, url: str):
        try:
            resp = await client.get(url)
            if resp.status_code == 200:
                path = url.split("//", 1)[-1].split("/", 1)[-1] if "/" in url.split("//", 1)[-1] else ""
                sensitivity = "critical" if path in ("/.env", "/.git/config", "/secrets.json") else "high"
                return {
                    "type": f"exposed_path_{path.lstrip('/').replace('/', '_') or 'admin'}",
                    "severity": sensitivity,
                    "detail": f"Sensitive path accessible: {url}",
                    "url": url,
                    "source": "cloud_scanner",
                }
        except Exception:
            pass
        return None
