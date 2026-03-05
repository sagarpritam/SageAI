"""DNS scanner — enumerates DNS records and checks for misconfigurations."""

import socket
import logging

logger = logging.getLogger("sageai.dns_scanner")


def scan_dns(hostname: str) -> list[dict]:
    """Scan DNS records for a host."""
    findings = []
    hostname = hostname.replace("https://", "").replace("http://", "").split("/")[0]

    # Basic DNS resolution
    try:
        ips = socket.getaddrinfo(hostname, None)
        unique_ips = set(addr[4][0] for addr in ips)
        findings.append({
            "type": "dns_resolution",
            "severity": "info",
            "detail": f"Resolves to {len(unique_ips)} IP(s): {', '.join(list(unique_ips)[:5])}",
        })
    except socket.gaierror:
        findings.append({
            "type": "dns_no_resolution",
            "severity": "high",
            "detail": f"Domain {hostname} does not resolve — possible DNS misconfiguration",
        })
        return findings

    # Reverse DNS check
    for ip in list(unique_ips)[:3]:
        try:
            reverse = socket.gethostbyaddr(ip)
            findings.append({
                "type": "dns_reverse",
                "severity": "info",
                "detail": f"Reverse DNS for {ip}: {reverse[0]}",
            })
        except socket.herror:
            findings.append({
                "type": "dns_no_reverse",
                "severity": "low",
                "detail": f"No reverse DNS for {ip}",
            })

    # Check common subdomains
    common_subs = ["www", "mail", "ftp", "api", "dev", "staging", "admin", "test"]
    found_subs = []
    for sub in common_subs:
        try:
            fqdn = f"{sub}.{hostname}"
            socket.getaddrinfo(fqdn, None)
            found_subs.append(sub)
        except socket.gaierror:
            pass

    if found_subs:
        findings.append({
            "type": "dns_subdomains",
            "severity": "info",
            "detail": f"Found subdomains: {', '.join(found_subs)}",
        })

    # Flag dangerous subdomains
    risky_subs = [s for s in found_subs if s in ("admin", "test", "staging", "dev")]
    if risky_subs:
        findings.append({
            "type": "dns_risky_subdomains",
            "severity": "medium",
            "detail": f"Potentially sensitive subdomains exposed: {', '.join(risky_subs)}",
        })

    return findings
