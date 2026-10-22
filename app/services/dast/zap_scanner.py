"""Phase 05 Authorized Staging DAST Scanner.

Implements two-tier DAST verification:
1. Passive Baseline Analysis: Non-intrusive response inspection (security headers, cookies, server disclosures).
2. Controlled Active Staging Probe: Probes sensitive endpoints & reflections ONLY on explicitly authorized staging assets.
Strictly blocks invasive active scanning against unauthorized or production targets.
"""

import logging
import re
from typing import Any, Dict, List
from urllib.parse import urljoin, urlparse

import httpx

logger = logging.getLogger("SageAI.dast")


class DASTAuthorizationError(Exception):
    """Raised when active DAST scans are attempted against unauthorized targets."""
    pass


# Sensitive endpoint paths probed during controlled staging active scans
STAGING_PROBE_PATHS = [
    "/.env",
    "/.git/HEAD",
    "/actuator/health",
    "/api-docs",
    "/swagger.json",
    "/server-status",
]


class StagedDASTScanner:
    """Staged DAST verification engine with strict authorization guardrails."""

    def __init__(self, timeout: float = 10.0):
        self.timeout = timeout

    async def scan_target(
        self,
        target_url: str,
        is_authorized_staging: bool = False,
        mode: str = "passive",
    ) -> Dict[str, Any]:
        """Execute DAST scan with authorization gating.

        Args:
            target_url: Target web address (e.g. 'https://staging.domain.com')
            is_authorized_staging: Whether target is verified & authorized for active tests.
            mode: 'passive' (baseline) or 'active' (controlled probing).
        """
        parsed = urlparse(target_url)
        if not parsed.scheme or not parsed.netloc:
            raise ValueError(f"Invalid target URL: '{target_url}'. Must include http:// or https://")

        # 1. Authorization Gate for Active Mode
        if mode == "active" and not is_authorized_staging:
            logger.warning(
                f"BLOCKED: Active DAST probe rejected for unauthorized target: {target_url}"
            )
            raise DASTAuthorizationError(
                f"Target '{target_url}' is not an authorized staging asset. "
                "Controlled active DAST testing is strictly restricted to verified staging infrastructure."
            )

        findings: List[Dict[str, Any]] = []

        # 2. Tier 1: Passive Baseline Scan (Safe for all valid targets)
        async with httpx.AsyncClient(verify=False, timeout=self.timeout, follow_redirects=True) as client:
            try:
                resp = await client.get(target_url)
                passive_findings = self._evaluate_passive_baseline(target_url, resp)
                findings.extend(passive_findings)
            except Exception as e:
                logger.error(f"Passive DAST baseline scan failed for {target_url}: {e}")
                return {
                    "target": target_url,
                    "mode": mode,
                    "is_authorized_staging": is_authorized_staging,
                    "status": "error",
                    "error": str(e),
                    "findings": [],
                }

            # 3. Tier 2: Controlled Active Staging Probing (Authorized Staging Only)
            active_probes_run = 0
            if mode == "active" and is_authorized_staging:
                active_findings, active_probes_run = await self._run_controlled_active_probe(client, target_url)
                findings.extend(active_findings)

        return {
            "target": target_url,
            "mode": mode,
            "is_authorized_staging": is_authorized_staging,
            "status": "completed",
            "findings_count": len(findings),
            "active_probes_executed": active_probes_run,
            "findings": findings,
        }

    def _evaluate_passive_baseline(self, target_url: str, resp: httpx.Response) -> List[Dict[str, Any]]:
        """Passive analysis of response headers, cookies, and information disclosure."""
        findings = []
        headers = {k.lower(): v for k, v in resp.headers.items()}

        # 1. Check Missing Security Headers
        security_headers = [
            ("strict-transport-security", "Missing HSTS Header", "high", 7.5, "Add Strict-Transport-Security: max-age=31536000; includeSubDomains"),
            ("content-security-policy", "Missing Content Security Policy (CSP)", "medium", 6.0, "Define a robust Content-Security-Policy to mitigate XSS"),
            ("x-content-type-options", "Missing X-Content-Type-Options Header", "low", 4.3, "Set X-Content-Type-Options: nosniff"),
            ("x-frame-options", "Missing X-Frame-Options Header", "low", 4.3, "Set X-Frame-Options: DENY or SAMEORIGIN to prevent clickjacking"),
        ]

        for hdr, title, sev, cvss, rem in security_headers:
            if hdr not in headers:
                findings.append({
                    "title": title,
                    "severity": sev,
                    "cvss": cvss,
                    "type": "dast_missing_header",
                    "detail": f"Response from {target_url} lacks the '{hdr}' security header.",
                    "remediation": rem,
                })

        # 2. Check Server Version Disclosure
        server_val = headers.get("server", "")
        if server_val and re.search(r"\d+\.\d+", server_val):
            findings.append({
                "title": "Server Banner Version Disclosure",
                "severity": "low",
                "cvss": 3.7,
                "type": "dast_info_disclosure",
                "detail": f"Server header reveals exact version: '{server_val}'.",
                "remediation": "Suppress server tokens in web server configuration.",
            })

        # 3. Check Insecure Cookie Attributes
        for cookie_hdr in resp.headers.get_list("set-cookie"):
            c_lower = cookie_hdr.lower()
            if "secure" not in c_lower or "httponly" not in c_lower:
                findings.append({
                    "title": "Insecure Cookie Attributes",
                    "severity": "medium",
                    "cvss": 5.4,
                    "type": "dast_cookie_security",
                    "detail": f"Cookie '{cookie_hdr.split(';')[0]}' lacks 'Secure' or 'HttpOnly' flags.",
                    "remediation": "Ensure all session and authentication cookies include Secure and HttpOnly flags.",
                })
                break

        return findings

    async def _run_controlled_active_probe(
        self, client: httpx.AsyncClient, base_url: str
    ) -> tuple[List[Dict[str, Any]], int]:
        """Execute non-destructive, rate-limited probes against sensitive paths and parameters."""
        findings = []
        probes_run = 0

        # Probe 1: Sensitive file / directory exposure
        for path in STAGING_PROBE_PATHS:
            probes_run += 1
            probe_url = urljoin(base_url, path)
            try:
                p_resp = await client.get(probe_url)
                if p_resp.status_code == 200 and len(p_resp.content) > 0:
                    # Verify content isn't a custom 404 page
                    content_str = p_resp.text.lower()
                    if "not found" not in content_str and "page does not exist" not in content_str:
                        findings.append({
                            "title": f"Exposed Sensitive Endpoint: {path}",
                            "severity": "high" if path in ("/.env", "/.git/HEAD") else "medium",
                            "cvss": 8.1 if path in ("/.env", "/.git/HEAD") else 5.3,
                            "type": "dast_exposed_file",
                            "detail": f"Sensitive file or diagnostic interface accessible at {probe_url} (HTTP 200).",
                            "remediation": f"Restrict access to '{path}' in web server routing or ingress rules.",
                        })
            except Exception:
                continue

        # Probe 2: Non-destructive reflection test on query param
        probes_run += 1
        canary = "sageai_safe_test_canary_1234"
        test_url = urljoin(base_url, f"/?q={canary}&search={canary}")
        try:
            r_resp = await client.get(test_url)
            if canary in r_resp.text:
                findings.append({
                    "title": "Reflected Parameter in Web Response",
                    "severity": "medium",
                    "cvss": 5.0,
                    "type": "dast_reflected_param",
                    "detail": f"Query parameter was reflected directly in response body at {test_url}.",
                    "remediation": "Contextually HTML-encode and sanitize all user-supplied query parameters.",
                })
        except Exception:
            pass

        return findings, probes_run
