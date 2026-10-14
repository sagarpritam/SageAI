"""08 // CENSYS: THE GLOBAL RADAR — Real-time server and certificate monitoring.

Free tier: Uses crt.sh certificate transparency + custom TLS scanning.
If CENSYS_API_ID and CENSYS_API_SECRET are set, uses the Censys Search API.
"""

import datetime
import logging
import socket
import ssl

import httpx  # pyre-ignore[21]

logger = logging.getLogger("sageai.intelligence.censys")

CENSYS_API = "https://search.censys.io/api/v2"
CRTSH_API = "https://crt.sh"


from app.core.config import settings  # pyre-ignore[21]


async def censys_scan(target: str) -> list[dict]:
    """Run Censys-style intelligence scan."""
    api_id = settings.CENSYS_API_ID
    api_secret = settings.CENSYS_API_SECRET

    hostname = target.replace("https://", "").replace("http://", "").split("/")[0]

    if api_id:
        return await _censys_api_scan(hostname, api_id, api_secret)
    else:
        return await _censys_free_scan(hostname)


async def _censys_free_scan(hostname: str) -> list[dict]:
    """Free alternative: crt.sh certificate transparency + TLS inspection."""
    findings: list[dict] = []

    # 1. Certificate Transparency via crt.sh
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(f"{CRTSH_API}/?q=%25.{hostname}&output=json")
            if resp.status_code == 200:
                raw_certs = resp.json()
                certs: list[dict] = raw_certs if isinstance(raw_certs, list) else []
                unique_domains: set[str] = set()
                for cert in certs:
                    name = cert.get("name_value", "")
                    for domain in name.split("\n"):
                        domain = domain.strip().lower()
                        if domain and "*" not in domain:
                            unique_domains.add(domain)

                if unique_domains:
                    findings.append(
                        {
                            "module": "censys",
                            "type": "certificate_transparency",
                            "severity": "info",
                            "title": f"Censys Radar: {len(unique_domains)} Domains in Certificate Transparency",
                            "detail": f"Discovered subdomains/domains: {', '.join(sorted(unique_domains)[:20])}",  # pyre-ignore[16, 58]
                            "data": {
                                "domains": sorted(unique_domains),
                                "total_certs": len(certs),
                            },
                            "source": "crt.sh Certificate Transparency (free)",
                        }
                    )

                # Check for expired or soon-expiring certs
                for cert in certs[:5]:  # pyre-ignore[16, 58]
                    not_after = cert.get("not_after", "")
                    if not_after:
                        try:
                            expiry = datetime.datetime.fromisoformat(
                                not_after.replace("T", " ").split(".")[0]
                            )
                            days_left = (
                                expiry
                                - datetime.datetime.now(datetime.timezone.utc).replace(
                                    tzinfo=None
                                )
                            ).days
                            if days_left < 0:
                                findings.append(
                                    {
                                        "module": "censys",
                                        "type": "expired_certificate",
                                        "severity": "high",
                                        "title": "Censys Radar: Expired Certificate Detected",
                                        "detail": f"Certificate for {cert.get('common_name', hostname)} expired {abs(days_left)} days ago.",
                                        "data": {
                                            "common_name": cert.get("common_name"),
                                            "expired_date": not_after,
                                        },
                                        "source": "crt.sh (free)",
                                    }
                                )
                                break
                            elif days_left < 30:
                                findings.append(
                                    {
                                        "module": "censys",
                                        "type": "expiring_certificate",
                                        "severity": "medium",
                                        "title": "Censys Radar: Certificate Expiring Soon",
                                        "detail": f"Certificate for {cert.get('common_name', hostname)} expires in {days_left} days.",
                                        "data": {
                                            "common_name": cert.get("common_name"),
                                            "expires_in_days": days_left,
                                        },
                                        "source": "crt.sh (free)",
                                    }
                                )
                                break
                        except Exception:
                            pass
    except Exception as e:
        logger.error(f"crt.sh scan error: {e}")

    # 2. TLS/SSL direct inspection
    try:
        ip = socket.gethostbyname(hostname)
        context = ssl.create_default_context()
        with socket.create_connection((hostname, 443), timeout=10) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert_raw = ssock.getpeercert()
                cert: dict = cert_raw if isinstance(cert_raw, dict) else {}
                protocol = ssock.version() or "Unknown"

                findings.append(
                    {
                        "module": "censys",
                        "type": "tls_inspection",
                        "severity": "info",
                        "title": f"Censys Radar: TLS {protocol} Active",
                        "detail": f"Server supports {protocol}. Issuer: {cert.get('issuer', 'Unknown')}",
                        "data": {
                            "protocol": protocol,
                            "issuer": str(cert.get("issuer", "")),
                            "subject": str(cert.get("subject", "")),
                            "serial_number": str(cert.get("serialNumber", "")),
                            "ip": ip,
                        },
                        "source": "Direct TLS Inspection (free)",
                    }
                )

                # Warn on old TLS versions
                if protocol in ("TLSv1", "TLSv1.1"):
                    findings.append(
                        {
                            "module": "censys",
                            "type": "weak_tls",
                            "severity": "high",
                            "title": f"Censys Radar: Weak TLS Version ({protocol})",
                            "detail": f"Server supports deprecated {protocol}. Upgrade to TLS 1.2+.",
                            "data": {"protocol": protocol},
                            "source": "Direct TLS Inspection (free)",
                        }
                    )
    except Exception as e:
        logger.warning(f"TLS inspection failed for {hostname}: {e}")

    return findings


async def _censys_api_scan(hostname: str, api_id: str, api_secret: str) -> list[dict]:
    """Full Censys Search API v2 (requires API credentials)."""
    findings: list[dict] = []
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.get(
                f"{CENSYS_API}/hosts/search",
                params={"q": hostname, "per_page": 25},
                auth=(api_id, api_secret),
            )
            if resp.status_code == 403:
                logger.warning(
                    "Censys API credentials invalid, falling back to free tier"
                )
                return await _censys_free_scan(hostname)
            if resp.status_code != 200:
                return await _censys_free_scan(hostname)

            data = resp.json()
            hits = data.get("result", {}).get("hits", [])

            for hit in hits:
                ip = hit.get("ip", "")
                services = hit.get("services", [])
                for svc in services:
                    svc_name = svc.get("service_name", "UNKNOWN")
                    port = svc.get("port", "?")
                    transport = svc.get("transport_protocol", "TCP")
                    findings.append(
                        {
                            "module": "censys",
                            "type": "exposed_service",
                            "severity": "medium"
                            if svc_name in ("SSH", "TELNET", "RDP", "FTP")
                            else "info",
                            "title": f"Censys: {svc_name} on {ip}:{port}",
                            "detail": f"Service {svc_name} detected on {transport} port {port}",
                            "data": {
                                "ip": ip,
                                "port": port,
                                "service": svc_name,
                                "transport": transport,
                            },
                            "source": "Censys Search API (Pro)",
                        }
                    )

    except Exception as e:
        logger.error(f"Censys API error: {e}")
        return await _censys_free_scan(hostname)

    return findings
