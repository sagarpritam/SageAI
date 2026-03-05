"""CRT.sh — Certificate Transparency Log Search.

Discovers all SSL certificates ever issued for a domain using
the Certificate Transparency public logs.
Free, no API key required.
"""

import logging
import httpx

logger = logging.getLogger("sageai.crtsh")

CRTSH_API = "https://crt.sh"


async def search_certificates(domain: str) -> list[dict]:
    """Search Certificate Transparency logs for all certs issued for a domain."""
    findings = []
    domain = domain.replace("https://", "").replace("http://", "").split("/")[0]

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(f"{CRTSH_API}/", params={
                "q": f"%.{domain}",
                "output": "json",
            })

            if response.status_code != 200:
                return findings

            certs = response.json()
            if not isinstance(certs, list):
                return findings

            # Deduplicate by common name
            unique_names = set()
            for cert in certs:
                name = cert.get("common_name", "")
                if name:
                    unique_names.add(name.lower())

            # Find interesting subdomains
            subdomains = sorted(unique_names)

            if subdomains:
                findings.append({
                    "type": "crtsh_certificates",
                    "severity": "info",
                    "detail": f"CRT.sh found {len(certs)} certificates for {len(subdomains)} unique names",
                    "total_certs": len(certs),
                    "source": "crt.sh",
                })

            # Flag potentially sensitive subdomains
            sensitive_keywords = ["admin", "staging", "dev", "test", "internal", "vpn", "api-dev", "debug", "qa", "uat"]
            sensitive = [s for s in subdomains if any(kw in s for kw in sensitive_keywords)]

            if sensitive:
                findings.append({
                    "type": "crtsh_sensitive_subdomains",
                    "severity": "medium",
                    "detail": f"Sensitive subdomains found via cert transparency: {', '.join(sensitive[:8])}",
                    "subdomains": sensitive[:15],
                    "source": "crt.sh",
                })

            # Flag wildcard certificates
            wildcards = [s for s in subdomains if s.startswith("*.")]
            if wildcards:
                findings.append({
                    "type": "crtsh_wildcards",
                    "severity": "low",
                    "detail": f"Wildcard certificates found: {', '.join(wildcards[:5])}",
                    "source": "crt.sh",
                })

    except httpx.TimeoutException:
        logger.warning("CRT.sh timeout")
    except Exception as e:
        logger.error(f"CRT.sh error: {e}")

    return findings
