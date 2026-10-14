"""Subfinder wrapper — subdomain enumeration tool.

Executes the subfinder binary against a target domain and returns
discovered subdomains.  Falls back to a deterministic mock when the
binary is not installed (demo / CI environments).
"""

import json
import logging
import os
import re
import subprocess
import time
from dataclasses import dataclass, field
from typing import List

logger = logging.getLogger(__name__)

# ── Configuration ────────────────────────────────────────────────
SUBFINDER_BIN = os.getenv("SUBFINDER_BIN", "subfinder")
SUBFINDER_TIMEOUT = int(os.getenv("SUBFINDER_TIMEOUT", "60"))

# Domain validation regex (RFC‑1035 compliant)
_DOMAIN_RE = re.compile(
    r"^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z0-9-]{1,63})*\.[A-Za-z]{2,}$"
)


@dataclass
class SubfinderResult:
    """Structured result from a subfinder run."""

    domain: str
    subdomains: List[str] = field(default_factory=list)
    elapsed_seconds: float = 0.0
    is_mock: bool = False


def _validate_domain(domain: str) -> str:
    """Validate and sanitize the domain input."""
    domain = domain.strip().lower()
    if not domain:
        raise ValueError("Domain must not be empty")
    # Strip protocol / path if accidentally provided
    for prefix in ("https://", "http://"):
        if domain.startswith(prefix):
            domain = domain[len(prefix) :]
    domain = domain.split("/")[0]
    if not _DOMAIN_RE.match(domain):
        raise ValueError(
            f"Invalid domain format: '{domain}'. "
            "Provide a bare domain like 'example.com'."
        )
    return domain


def run_subfinder(domain: str) -> SubfinderResult:
    """Run subfinder on a given domain to enumerate subdomains.

    Returns a ``SubfinderResult`` with discovered subdomains.
    Falls back to mock data when the binary is unavailable.
    """
    domain = _validate_domain(domain)
    start = time.monotonic()

    try:
        cmd = [SUBFINDER_BIN, "-d", domain, "-silent", "-json"]
        logger.info(
            "Running subfinder for domain=%s  timeout=%ds", domain, SUBFINDER_TIMEOUT
        )

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True,
            timeout=SUBFINDER_TIMEOUT,
        )

        subdomains: List[str] = []
        for line in result.stdout.strip().splitlines():
            if not line:
                continue
            try:
                data = json.loads(line)
                if "host" in data:
                    subdomains.append(data["host"])
            except json.JSONDecodeError:
                subdomains.append(line.strip())

        elapsed = round(time.monotonic() - start, 2)
        logger.info("Subfinder found %d subdomains in %.2fs", len(subdomains), elapsed)
        return SubfinderResult(
            domain=domain,
            subdomains=[s for s in subdomains if s],
            elapsed_seconds=elapsed,
        )

    except FileNotFoundError:
        elapsed = round(time.monotonic() - start, 2)
        logger.warning(
            "Subfinder binary not found at '%s'. Using MOCK MODE.", SUBFINDER_BIN
        )
        mock_subs = [f"api.{domain}", f"staging.{domain}", f"admin.{domain}"]
        return SubfinderResult(
            domain=domain,
            subdomains=mock_subs,
            elapsed_seconds=elapsed,
            is_mock=True,
        )

    except subprocess.TimeoutExpired:
        elapsed = round(time.monotonic() - start, 2)
        logger.error(
            "Subfinder timed out after %ds for domain=%s", SUBFINDER_TIMEOUT, domain
        )
        raise RuntimeError(
            f"Subfinder scan timed out after {SUBFINDER_TIMEOUT}s for {domain}"
        )

    except subprocess.CalledProcessError as exc:
        elapsed = round(time.monotonic() - start, 2)
        logger.error(
            "Subfinder failed for domain=%s: %s", domain, exc.stderr or str(exc)
        )
        raise RuntimeError(f"Subfinder scan failed: {exc.stderr or str(exc)}")
