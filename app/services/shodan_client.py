"""Shodan InternetDB client.

Queries Shodan's free InternetDB API for known open ports, vulnerabilities,
and CPEs (Common Platform Enumeration) for any IP address.
Free, no API key required.
Docs: https://internetdb.shodan.io/
"""

import logging
import socket
import httpx

logger = logging.getLogger("sageai.shodan")

SHODAN_API = "https://internetdb.shodan.io"


async def lookup_ip(hostname: str) -> list[dict]:
    """Look up an IP in Shodan InternetDB for known ports, vulns, and services."""
    findings = []

    try:
        # Resolve hostname to IP
        hostname = hostname.replace("https://", "").replace("http://", "").split("/")[0]
        ip = socket.gethostbyname(hostname)

        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(f"{SHODAN_API}/{ip}")

            if response.status_code != 200:
                return findings

            data = response.json()

            # Known vulnerabilities from Shodan
            vulns = data.get("vulns", [])
            if vulns:
                findings.append({
                    "type": "shodan_vulns",
                    "severity": "high",
                    "detail": f"Shodan reports {len(vulns)} known vulnerabilities: {', '.join(vulns[:5])}",
                    "cve_ids": vulns[:10],
                    "source": "Shodan InternetDB",
                })

            # Open ports from Shodan
            ports = data.get("ports", [])
            if ports:
                findings.append({
                    "type": "shodan_ports",
                    "severity": "info",
                    "detail": f"Shodan sees {len(ports)} open ports: {', '.join(str(p) for p in ports[:15])}",
                    "ports": ports,
                    "source": "Shodan InternetDB",
                })

            # Hostnames/services
            hostnames = data.get("hostnames", [])
            if hostnames:
                findings.append({
                    "type": "shodan_hostnames",
                    "severity": "info",
                    "detail": f"Associated hostnames: {', '.join(hostnames[:5])}",
                    "source": "Shodan InternetDB",
                })

            # CPEs (software identified)
            cpes = data.get("cpes", [])
            if cpes:
                findings.append({
                    "type": "shodan_cpes",
                    "severity": "info",
                    "detail": f"Detected software: {', '.join(cpe.split(':')[-2] + '/' + cpe.split(':')[-1] if len(cpe.split(':')) >= 5 else cpe for cpe in cpes[:5])}",
                    "cpes": cpes,
                    "source": "Shodan InternetDB",
                })

    except socket.gaierror:
        logger.warning(f"Could not resolve {hostname}")
    except Exception as e:
        logger.error(f"Shodan lookup error: {e}")

    return findings
