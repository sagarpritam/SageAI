"""SSL/TLS certificate scanner.

Checks certificate validity, expiration, protocol versions, and cipher suites.
"""

import ssl
import socket
import logging
from datetime import datetime, timezone

logger = logging.getLogger("sageai.ssl_scanner")


def scan_ssl(hostname: str, port: int = 443) -> list[dict]:
    """Scan SSL/TLS configuration of a host."""
    findings = []

    try:
        # Strip protocol
        hostname = hostname.replace("https://", "").replace("http://", "").split("/")[0]

        context = ssl.create_default_context()
        with socket.create_connection((hostname, port), timeout=10) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                protocol = ssock.version()
                cipher = ssock.cipher()

                # Check certificate expiration
                not_after = datetime.strptime(cert["notAfter"], "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
                days_left = (not_after - datetime.now(timezone.utc)).days

                if days_left < 0:
                    findings.append({
                        "type": "ssl_expired",
                        "severity": "critical",
                        "detail": f"SSL certificate expired {abs(days_left)} days ago",
                    })
                elif days_left < 30:
                    findings.append({
                        "type": "ssl_expiring_soon",
                        "severity": "high",
                        "detail": f"SSL certificate expires in {days_left} days",
                    })
                else:
                    findings.append({
                        "type": "ssl_valid",
                        "severity": "info",
                        "detail": f"SSL certificate valid for {days_left} days",
                    })

                # Check protocol version
                if protocol in ("TLSv1", "TLSv1.1"):
                    findings.append({
                        "type": "ssl_weak_protocol",
                        "severity": "high",
                        "detail": f"Weak TLS protocol: {protocol}. Upgrade to TLS 1.2+",
                    })

                # Check cipher strength
                if cipher and cipher[2] < 128:
                    findings.append({
                        "type": "ssl_weak_cipher",
                        "severity": "medium",
                        "detail": f"Weak cipher: {cipher[0]} ({cipher[2]}-bit)",
                    })

                # Subject info
                subject = dict(x[0] for x in cert.get("subject", []))
                issuer = dict(x[0] for x in cert.get("issuer", []))
                findings.append({
                    "type": "ssl_info",
                    "severity": "info",
                    "detail": f"Issued to: {subject.get('commonName', 'N/A')}, by: {issuer.get('organizationName', 'N/A')}",
                })

    except ssl.SSLCertVerificationError as e:
        findings.append({
            "type": "ssl_invalid_cert",
            "severity": "critical",
            "detail": f"SSL certificate verification failed: {e}",
        })
    except (socket.timeout, socket.gaierror, ConnectionRefusedError) as e:
        findings.append({
            "type": "ssl_connection_error",
            "severity": "medium",
            "detail": f"Could not connect for SSL check: {e}",
        })
    except Exception as e:
        logger.error(f"SSL scan error: {e}")
        findings.append({
            "type": "ssl_scan_error",
            "severity": "low",
            "detail": f"SSL scan failed: {str(e)}",
        })

    return findings
