"""Nmap wrapper — network / port scanning tool.

Runs the nmap binary against a target, parses the XML output, and returns
structured host / port / service data.  Falls back to deterministic mock
data when the binary is not installed.
"""

import logging
import os
import re
import subprocess
import time
import xml.etree.ElementTree as ET
from typing import Any, Dict, List

logger = logging.getLogger(__name__)

# ── Configuration ────────────────────────────────────────────────
NMAP_BIN = os.getenv("NMAP_BIN", "nmap")
NMAP_TIMEOUT = int(os.getenv("NMAP_TIMEOUT", "120"))

# Characters allowed in a target string (domain, IP, CIDR)
_SAFE_TARGET_RE = re.compile(r"^[A-Za-z0-9.\-:/]+$")

# Pre-defined scan profiles
SCAN_PROFILES = {
    "quick": ["-F"],                     # top-100 ports
    "standard": ["--top-ports", "1000"], # top-1000
    "deep": ["-p-"],                     # all 65535
}


def _sanitize_target(target: str) -> str:
    """Validate target to prevent command injection."""
    target = target.strip()
    if not target:
        raise ValueError("Target must not be empty")
    # Strip protocol if provided
    for prefix in ("https://", "http://"):
        if target.startswith(prefix):
            target = target[len(prefix):]
    target = target.split("/")[0]
    if not _SAFE_TARGET_RE.match(target):
        raise ValueError(
            f"Invalid target format: '{target}'. "
            "Use a domain name, IP address, or CIDR range."
        )
    return target


def run_nmap(
    target: str,
    ports: str = "top-100",
    profile: str = "quick",
) -> Dict[str, Any]:
    """Run nmap on a target and return structured open ports and services.

    Parameters
    ----------
    target : str
        Domain, IP, or CIDR range.
    ports : str
        Explicit port spec (e.g. ``"80,443"``).  Ignored when *profile*
        is ``"quick"`` / ``"standard"`` / ``"deep"``.
    profile : str
        One of ``"quick"`` (top-100), ``"standard"`` (top-1000),
        ``"deep"`` (all ports).
    """
    target = _sanitize_target(target)
    start = time.monotonic()

    try:
        cmd = [NMAP_BIN, "-T4", "-oX", "-"]

        if profile in SCAN_PROFILES:
            cmd.extend(SCAN_PROFILES[profile])
        elif ports and ports != "top-100":
            cmd.extend(["-p", ports])
        else:
            cmd.append("-F")

        cmd.append(target)

        logger.info(
            "Running nmap: target=%s  profile=%s  timeout=%ds",
            target, profile, NMAP_TIMEOUT,
        )
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True,
            timeout=NMAP_TIMEOUT,
        )

        parsed = parse_nmap_xml(result.stdout)
        elapsed = round(time.monotonic() - start, 2)
        logger.info("Nmap completed in %.2fs — %d host(s) found", elapsed, len(parsed.get("hosts", [])))
        parsed["elapsed_seconds"] = elapsed
        return parsed

    except FileNotFoundError:
        elapsed = round(time.monotonic() - start, 2)
        logger.warning("Nmap binary not found at '%s'. Using MOCK MODE for %s.", NMAP_BIN, target)
        return {
            "hosts": [{
                "addresses": [{"addr": "127.0.0.1", "addrtype": "ipv4"}],
                "hostnames": [{"name": target, "type": "user"}],
                "ports": [
                    {"portid": "80", "protocol": "tcp", "state": "open", "service": {"name": "http"}},
                    {"portid": "443", "protocol": "tcp", "state": "open", "service": {"name": "https"}},
                    {"portid": "8443", "protocol": "tcp", "state": "open", "service": {"name": "https-alt"}},
                ],
            }],
            "elapsed_seconds": elapsed,
            "is_mock": True,
        }

    except subprocess.TimeoutExpired:
        elapsed = round(time.monotonic() - start, 2)
        logger.error("Nmap timed out after %ds for target=%s", NMAP_TIMEOUT, target)
        raise RuntimeError(f"Nmap scan timed out after {NMAP_TIMEOUT}s for {target}")

    except subprocess.CalledProcessError as exc:
        logger.error("Nmap failed for target=%s: %s", target, exc.stderr or str(exc))
        raise RuntimeError(f"Nmap scan failed: {exc.stderr or str(exc)}")

    except ET.ParseError as exc:
        logger.error("Failed to parse nmap XML for %s: %s", target, exc)
        return {"error": f"XML Parse Error: {exc}", "raw_output": result.stdout}


def parse_nmap_xml(xml_content: str) -> Dict[str, Any]:
    """Parse nmap XML output into a structured dictionary."""
    root = ET.fromstring(xml_content)

    hosts: List[Dict[str, Any]] = []
    for host in root.findall("host"):
        host_info: Dict[str, Any] = {
            "addresses": [],
            "hostnames": [],
            "ports": [],
        }

        for address in host.findall("address"):
            host_info["addresses"].append({
                "addr": address.get("addr"),
                "addrtype": address.get("addrtype"),
            })

        hostnames_el = host.find("hostnames")
        if hostnames_el is not None:
            for hn in hostnames_el.findall("hostname"):
                host_info["hostnames"].append({
                    "name": hn.get("name"),
                    "type": hn.get("type"),
                })

        ports_el = host.find("ports")
        if ports_el is not None:
            for port in ports_el.findall("port"):
                state = port.find("state")
                if state is not None and state.get("state") == "open":
                    port_data: Dict[str, Any] = {
                        "portid": port.get("portid"),
                        "protocol": port.get("protocol"),
                        "state": state.get("state"),
                        "reason": state.get("reason"),
                    }
                    service = port.find("service")
                    if service is not None:
                        port_data["service"] = {
                            "name": service.get("name"),
                            "product": service.get("product"),
                            "version": service.get("version"),
                            "extrainfo": service.get("extrainfo"),
                        }
                    host_info["ports"].append(port_data)

        hosts.append(host_info)

    return {"hosts": hosts}
