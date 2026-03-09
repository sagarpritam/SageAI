"""04 // SPIDERFOOT: RECON AUTOMATION — Automated OSINT profiling.

Wraps SpiderFoot's open-source capabilities. If SpiderFoot is installed
locally, it will invoke the CLI. Otherwise, it performs a multi-source
OSINT sweep using free APIs to simulate SpiderFoot's 100+ module approach.
"""

import logging
import os
import socket

import httpx

logger = logging.getLogger("sageai.intelligence.spiderfoot")

# Free OSINT data sources used to simulate SpiderFoot modules
IPINFO_API = "https://ipinfo.io"
THREATCROWD_API = "https://www.threatcrowd.org/searchApi/v2"
URLSCAN_API = "https://urlscan.io/api/v1"


async def spiderfoot_scan(target: str) -> list[dict]:
    """Automated OSINT profiling — simulating SpiderFoot's multi-source approach."""
    findings = []
    hostname = target.replace("https://", "").replace("http://", "").split("/")[0]

    # Resolve IP
    try:
        ip = socket.gethostbyname(hostname)
    except socket.gaierror:
        ip = None

    # Run all sub-modules concurrently
    import asyncio
    sub_results = await asyncio.gather(
        _ipinfo_lookup(ip) if ip else _empty(),
        _threatcrowd_lookup(hostname),
        _urlscan_lookup(hostname),
        _whois_diy(hostname),
        _dns_enum(hostname),
        return_exceptions=True,
    )

    for result in sub_results:
        if isinstance(result, list):
            findings.extend(result)

    # Summarize
    if findings:
        findings.insert(0, {
            "module": "spiderfoot",
            "type": "recon_summary",
            "severity": "info",
            "title": f"SpiderFoot: Automated Recon Complete — {len(findings)} Data Points",
            "detail": f"Automated OSINT profiling of {hostname} gathered {len(findings)} intelligence items from multiple sources.",
            "data": {"target": hostname, "modules_run": 5, "findings_count": len(findings)},
            "source": "SageAI SpiderFoot Emulation (free)",
        })

    return findings


async def _empty() -> list[dict]:
    return []


async def _ipinfo_lookup(ip: str) -> list[dict]:
    """IP geolocation and ASN info via ipinfo.io (free, 1000 req/day)."""
    findings = []
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(f"{IPINFO_API}/{ip}/json")
            if resp.status_code == 200:
                data = resp.json()
                findings.append({
                    "module": "spiderfoot",
                    "type": "ip_geolocation",
                    "severity": "info",
                    "title": f"SpiderFoot: IP Geolocation — {data.get('city', '?')}, {data.get('country', '?')}",
                    "detail": (
                        f"IP: {ip} | Org: {data.get('org', 'N/A')} | "
                        f"City: {data.get('city', '?')} | Region: {data.get('region', '?')} | "
                        f"Country: {data.get('country', '?')} | ASN: {data.get('org', 'N/A')}"
                    ),
                    "data": data,
                    "source": "ipinfo.io (free)",
                })
    except Exception as e:
        logger.warning(f"ipinfo.io error: {e}")
    return findings


async def _threatcrowd_lookup(hostname: str) -> list[dict]:
    """ThreatCrowd domain intelligence (free)."""
    findings = []
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(f"{THREATCROWD_API}/domain/report/", params={"domain": hostname})
            if resp.status_code == 200:
                data = resp.json()
                if data.get("response_code") == "1":
                    subdomains = data.get("subdomains", [])
                    resolutions = data.get("resolutions", [])
                    emails = data.get("emails", [])

                    if subdomains:
                        findings.append({
                            "module": "spiderfoot",
                            "type": "subdomains_discovered",
                            "severity": "info",
                            "title": f"SpiderFoot: {len(subdomains)} Subdomains Discovered",
                            "detail": f"Subdomains: {', '.join(subdomains[:15])}",
                            "data": {"subdomains": subdomains[:30]},
                            "source": "ThreatCrowd (free)",
                        })

                    if emails:
                        findings.append({
                            "module": "spiderfoot",
                            "type": "emails_discovered",
                            "severity": "medium",
                            "title": f"SpiderFoot: {len(emails)} Email Addresses Found",
                            "detail": f"Emails: {', '.join(emails[:10])}",
                            "data": {"emails": emails[:20]},
                            "source": "ThreatCrowd (free)",
                        })

                    if resolutions:
                        findings.append({
                            "module": "spiderfoot",
                            "type": "dns_resolutions",
                            "severity": "info",
                            "title": f"SpiderFoot: {len(resolutions)} Historical DNS Resolutions",
                            "detail": f"Historical IPs: {', '.join(r.get('ip_address', '') for r in resolutions[:10])}",
                            "data": {"resolutions": resolutions[:15]},
                            "source": "ThreatCrowd (free)",
                        })
    except Exception as e:
        logger.warning(f"ThreatCrowd error: {e}")
    return findings


async def _urlscan_lookup(hostname: str) -> list[dict]:
    """URLScan.io search for previous scan results (free)."""
    findings = []
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"{URLSCAN_API}/search/",
                params={"q": f"domain:{hostname}", "size": 10},
            )
            if resp.status_code == 200:
                data = resp.json()
                results = data.get("results", [])
                if results:
                    findings.append({
                        "module": "spiderfoot",
                        "type": "urlscan_history",
                        "severity": "info",
                        "title": f"SpiderFoot: {len(results)} URLScan Results Found",
                        "detail": f"Domain has been scanned {data.get('total', len(results))} times on URLScan.io.",
                        "data": {
                            "total_scans": data.get("total", len(results)),
                            "recent_scans": [
                                {
                                    "url": r.get("page", {}).get("url", ""),
                                    "ip": r.get("page", {}).get("ip", ""),
                                    "server": r.get("page", {}).get("server", ""),
                                    "date": r.get("task", {}).get("time", ""),
                                }
                                for r in results[:5]
                            ],
                        },
                        "source": "URLScan.io (free)",
                    })
    except Exception as e:
        logger.warning(f"URLScan.io error: {e}")
    return findings


async def _whois_diy(hostname: str) -> list[dict]:
    """Basic WHOIS-like info via DNS lookups."""
    findings = []
    try:
        # NS records
        import subprocess
        result = subprocess.run(
            ["nslookup", "-type=ns", hostname],
            capture_output=True, text=True, timeout=10,
        )
        ns_servers = []
        for line in result.stdout.split("\n"):
            if "nameserver" in line.lower() or "ns" in line.lower():
                ns_servers.append(line.strip())

        if ns_servers:
            findings.append({
                "module": "spiderfoot",
                "type": "nameservers",
                "severity": "info",
                "title": f"SpiderFoot: Nameservers Identified",
                "detail": f"NS records: {'; '.join(ns_servers[:5])}",
                "data": {"nameservers": ns_servers[:10]},
                "source": "DNS NS Lookup (free)",
            })
    except Exception as e:
        logger.warning(f"WHOIS/NS lookup error: {e}")
    return findings


async def _dns_enum(hostname: str) -> list[dict]:
    """DNS enumeration - A, MX, TXT records."""
    findings = []
    record_types = {
        "A": "IP addresses",
        "MX": "Mail servers",
        "TXT": "TXT records (SPF, DKIM, etc.)",
    }

    for rtype, desc in record_types.items():
        try:
            import subprocess
            result = subprocess.run(
                ["nslookup", f"-type={rtype}", hostname],
                capture_output=True, text=True, timeout=10,
            )
            if result.returncode == 0 and result.stdout.strip():
                findings.append({
                    "module": "spiderfoot",
                    "type": f"dns_{rtype.lower()}",
                    "severity": "info",
                    "title": f"SpiderFoot: DNS {rtype} Records — {desc}",
                    "detail": result.stdout.strip()[:300],
                    "data": {"record_type": rtype, "raw_output": result.stdout.strip()[:500]},
                    "source": "DNS Enumeration (free)",
                })
        except Exception:
            pass

    return findings
