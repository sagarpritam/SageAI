"""01 // SHODAN: THE PANOPTICON — Enhanced device & infrastructure search.

Uses the free Shodan InternetDB API (no key required).
If SHODAN_API_KEY is set in .env, upgrades to the full Shodan REST API
for richer data including banners, screenshots, and historical records.
"""

import logging
import os
import socket

import httpx

logger = logging.getLogger("sageai.intelligence.shodan")

INTERNETDB_API = "https://internetdb.shodan.io"
SHODAN_REST_API = "https://api.shodan.io"


async def shodan_scan(target: str) -> list[dict]:
    """Run Shodan intelligence scan on a target domain or IP."""
    findings = []
    api_key = os.getenv("SHODAN_API_KEY")

    # Resolve to IP
    hostname = target.replace("https://", "").replace("http://", "").split("/")[0]
    try:
        ip = socket.gethostbyname(hostname)
    except socket.gaierror:
        logger.warning(f"Could not resolve {hostname}")
        return findings

    if api_key:
        findings = await _shodan_pro_scan(ip, api_key)
    else:
        findings = await _shodan_free_scan(ip)

    return findings


async def _shodan_free_scan(ip: str) -> list[dict]:
    """Query Shodan InternetDB (free, no key)."""
    findings = []
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(f"{INTERNETDB_API}/{ip}")
            if resp.status_code != 200:
                return findings
            data = resp.json()

        vulns = data.get("vulns", [])
        if vulns:
            findings.append(
                {
                    "module": "shodan",
                    "type": "known_vulnerabilities",
                    "severity": "high",
                    "title": f"Shodan: {len(vulns)} Known Vulnerabilities",
                    "detail": f"Shodan InternetDB reports {len(vulns)} known CVEs for this IP: {', '.join(vulns[:10])}",
                    "data": {"cve_ids": vulns, "ip": ip},
                    "source": "Shodan InternetDB (free)",
                }
            )

        ports = data.get("ports", [])
        if ports:
            findings.append(
                {
                    "module": "shodan",
                    "type": "open_ports",
                    "severity": "medium"
                    if any(p in [21, 23, 445, 3389] for p in ports)
                    else "info",
                    "title": f"Shodan: {len(ports)} Open Ports Detected",
                    "detail": f"Ports: {', '.join(str(p) for p in ports[:20])}",
                    "data": {"ports": ports, "ip": ip},
                    "source": "Shodan InternetDB (free)",
                }
            )

        cpes = data.get("cpes", [])
        if cpes:
            findings.append(
                {
                    "module": "shodan",
                    "type": "software_detected",
                    "severity": "info",
                    "title": f"Shodan: {len(cpes)} Software Components Identified",
                    "detail": f"CPEs: {', '.join(cpes[:10])}",
                    "data": {"cpes": cpes, "ip": ip},
                    "source": "Shodan InternetDB (free)",
                }
            )

        hostnames = data.get("hostnames", [])
        if hostnames:
            findings.append(
                {
                    "module": "shodan",
                    "type": "associated_hostnames",
                    "severity": "info",
                    "title": f"Shodan: {len(hostnames)} Associated Hostnames",
                    "detail": f"Hostnames: {', '.join(hostnames[:10])}",
                    "data": {"hostnames": hostnames, "ip": ip},
                    "source": "Shodan InternetDB (free)",
                }
            )

        if not vulns and not ports and not cpes:
            findings.append(
                {
                    "module": "shodan",
                    "type": "clean",
                    "severity": "info",
                    "title": "Shodan: No Issues Found",
                    "detail": f"IP {ip} is not indexed or has no known exposures.",
                    "data": {"ip": ip},
                    "source": "Shodan InternetDB (free)",
                }
            )

    except Exception as e:
        logger.error(f"Shodan free scan error: {e}")

    return findings


async def _shodan_pro_scan(ip: str, api_key: str) -> list[dict]:
    """Query full Shodan REST API (requires paid key)."""
    findings = []
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.get(
                f"{SHODAN_REST_API}/shodan/host/{ip}",
                params={"key": api_key},
            )
            if resp.status_code == 401:
                logger.warning("Shodan API key invalid, falling back to free tier")
                return await _shodan_free_scan(ip)
            if resp.status_code != 200:
                return await _shodan_free_scan(ip)

            data = resp.json()

        # Vulnerabilities
        vulns = data.get("vulns", [])
        if vulns:
            findings.append(
                {
                    "module": "shodan",
                    "type": "known_vulnerabilities",
                    "severity": "high",
                    "title": f"Shodan Pro: {len(vulns)} Known Vulnerabilities",
                    "detail": f"CVEs: {', '.join(vulns[:15])}",
                    "data": {"cve_ids": vulns, "ip": ip},
                    "source": "Shodan REST API (Pro)",
                }
            )

        # Services & banners
        services = data.get("data", [])
        for svc in services[:10]:
            port = svc.get("port", "?")
            product = svc.get("product", "Unknown")
            version = svc.get("version", "")
            banner_snippet = (svc.get("data", ""))[:200]
            findings.append(
                {
                    "module": "shodan",
                    "type": "service_banner",
                    "severity": "info",
                    "title": f"Shodan Pro: Service on port {port} — {product} {version}",
                    "detail": f"Banner: {banner_snippet}",
                    "data": {
                        "port": port,
                        "product": product,
                        "version": version,
                        "transport": svc.get("transport"),
                    },
                    "source": "Shodan REST API (Pro)",
                }
            )

        # OS detection
        os_name = data.get("os")
        if os_name:
            findings.append(
                {
                    "module": "shodan",
                    "type": "os_detection",
                    "severity": "info",
                    "title": f"Shodan Pro: OS Detected — {os_name}",
                    "detail": f"Operating system: {os_name}",
                    "data": {"os": os_name, "ip": ip},
                    "source": "Shodan REST API (Pro)",
                }
            )

    except Exception as e:
        logger.error(f"Shodan Pro scan error: {e}")
        return await _shodan_free_scan(ip)

    return findings
