"""Nuclei wrapper — vulnerability scanning tool.

Runs the nuclei binary against a target URL / host and returns raw
JSON-lines findings.  Falls back to deterministic mock data when the
binary is not installed.
"""

import json
import logging
import os
import re
import subprocess
import time
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

# ── Configuration ────────────────────────────────────────────────
NUCLEI_BIN = os.getenv("NUCLEI_BIN", "nuclei")
NUCLEI_TIMEOUT = int(os.getenv("NUCLEI_TIMEOUT", "180"))

_SAFE_TARGET_RE = re.compile(r"^[A-Za-z0-9.\-:/]+$")

# Valid severity levels
VALID_SEVERITIES = {"info", "low", "medium", "high", "critical"}

# Template categories
VALID_CATEGORIES = {
    "cves",
    "misconfigurations",
    "exposures",
    "vulnerabilities",
    "default-logins",
    "fuzzing",
    "technologies",
    "token-spray",
}


def _sanitize_target(target: str) -> str:
    """Basic target validation."""
    target = target.strip()
    if not target:
        raise ValueError("Target must not be empty")
    # Allow URLs with protocol
    bare = target
    for prefix in ("https://", "http://"):
        if bare.startswith(prefix):
            bare = bare[len(prefix) :]
    bare = bare.split("/")[0]
    if not _SAFE_TARGET_RE.match(bare):
        raise ValueError(f"Invalid target format: '{target}'")
    return target


def run_nuclei(
    target: str,
    severity: str = "medium,high,critical",
    categories: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    """Run nuclei against a target and return raw JSON findings.

    Parameters
    ----------
    target : str
        URL or hostname to scan.
    severity : str
        Comma-separated severity levels to include.
    categories : list[str] | None
        Optional template categories (e.g. ``["cves", "misconfigurations"]``).
    """
    target = _sanitize_target(target)
    start = time.monotonic()

    # Validate severity filter
    requested = {s.strip().lower() for s in severity.split(",")}
    invalid = requested - VALID_SEVERITIES
    if invalid:
        raise ValueError(
            f"Invalid severity levels: {invalid}. Valid: {VALID_SEVERITIES}"
        )

    try:
        cmd = [
            NUCLEI_BIN,
            "-u",
            target,
            "-jsonl",  # JSON-lines output to stdout
            "-silent",
            "-severity",
            severity,
        ]

        if categories:
            valid_cats = [c for c in categories if c in VALID_CATEGORIES]
            if valid_cats:
                cmd.extend(["-tags", ",".join(valid_cats)])

        logger.info(
            "Running nuclei: target=%s  severity=%s  timeout=%ds",
            target,
            severity,
            NUCLEI_TIMEOUT,
        )

        # nuclei may return non-zero if vulns are found → check=False
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=False,
            timeout=NUCLEI_TIMEOUT,
        )

        findings: List[Dict[str, Any]] = []
        for line in result.stdout.strip().splitlines():
            if not line:
                continue
            try:
                findings.append(json.loads(line))
            except json.JSONDecodeError:
                continue

        elapsed = round(time.monotonic() - start, 2)
        logger.info(
            "Nuclei completed in %.2fs — %d finding(s)",
            elapsed,
            len(findings),
        )
        return findings

    except FileNotFoundError:
        elapsed = round(time.monotonic() - start, 2)
        logger.warning(
            "Nuclei binary not found at '%s'. Using MOCK MODE for %s.",
            NUCLEI_BIN,
            target,
        )
        return [
            {
                "template-id": "grafana-directory-traversal",
                "info": {
                    "name": "Grafana Directory Traversal (CVE-2021-43798)",
                    "severity": "critical",
                    "description": "The admin panel allows reading local files via path traversal.",
                    "tags": ["cve", "grafana", "lfi"],
                },
                "type": "http",
                "host": target,
                "matched-at": f"http://{target}:8443/public/plugins/alertlist/..%2f..%2f..%2fetc/passwd",
                "extracted-results": ["root:x:0:0:root:/root:/bin/bash"],
                "is_mock": True,
            }
        ]

    except subprocess.TimeoutExpired:
        elapsed = round(time.monotonic() - start, 2)
        logger.error("Nuclei timed out after %ds for target=%s", NUCLEI_TIMEOUT, target)
        raise RuntimeError(
            f"Nuclei scan timed out after {NUCLEI_TIMEOUT}s for {target}"
        )

    except subprocess.CalledProcessError as exc:
        logger.error("Nuclei failed for target=%s: %s", target, exc.stderr or str(exc))
        raise RuntimeError(f"Nuclei scan failed: {exc.stderr or str(exc)}")
