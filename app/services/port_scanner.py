"""Port scanner — checks common service ports."""

import socket
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed

logger = logging.getLogger("sageai.port_scanner")

# Common ports and their services
COMMON_PORTS = {
    21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP",
    53: "DNS", 80: "HTTP", 110: "POP3", 143: "IMAP",
    443: "HTTPS", 445: "SMB", 993: "IMAPS", 995: "POP3S",
    3306: "MySQL", 3389: "RDP", 5432: "PostgreSQL",
    6379: "Redis", 8080: "HTTP-Alt", 8443: "HTTPS-Alt",
    27017: "MongoDB",
}

# Ports that should NOT be exposed publicly
RISKY_PORTS = {21, 23, 445, 3306, 3389, 5432, 6379, 27017}


def scan_ports(hostname: str, ports: dict = None, timeout: float = 2.0) -> list[dict]:
    """Scan common ports on a host."""
    findings = []
    ports = ports or COMMON_PORTS
    hostname = hostname.replace("https://", "").replace("http://", "").split("/")[0]
    open_ports = []

    def check_port(port, service):
        try:
            with socket.create_connection((hostname, port), timeout=timeout):
                return (port, service, True)
        except (socket.timeout, ConnectionRefusedError, OSError):
            return (port, service, False)

    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(check_port, p, s): (p, s) for p, s in ports.items()}
        for future in as_completed(futures):
            port, service, is_open = future.result()
            if is_open:
                open_ports.append((port, service))
                severity = "high" if port in RISKY_PORTS else "info"
                findings.append({
                    "type": "port_open",
                    "severity": severity,
                    "detail": f"Port {port} ({service}) is open" + (" — should not be public" if port in RISKY_PORTS else ""),
                })

    if not open_ports:
        findings.append({
            "type": "port_scan_info",
            "severity": "info",
            "detail": "No common ports found open",
        })

    return findings
