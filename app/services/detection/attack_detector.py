"""
SageAI Advanced Attack Detection Engine.

Analyzes HTTP requests, API payloads, query strings, and headers to identify
SQL Injection, XSS, Command Injection, SSRF, Path Traversal, and Brute Force attacks.
"""

import re
import time
from collections import defaultdict
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


class AttackDetector:
    """
    WAF and In-line Threat Detection Engine.
    Detects OWASP Top 10 web application attacks with high precision and low false-positives.
    """

    PATTERNS = {
        "SQL_INJECTION": [
            r"(?i)(\%27)|(\')|(\-\-)|(\%23)|(#)",
            r"(?i)\b(union\s+select|select\s+.*\s+from|insert\s+into|drop\s+table|update\s+.*\s+set)\b",
            r"(?i)\b(or|and)\s+[\'\"]?\d+[\'\"]?\s*=\s*[\'\"]?\d+",
            r"(?i)\b(sleep|pg_sleep|waitfor\s+delay)\s*\(",
        ],
        "CROSS_SITE_SCRIPTING": [
            r"(?i)<script[^>]*>.*?</script>",
            r"(?i)<(img|svg|iframe|body|input|a)\b[^>]*(onerror|onload|onclick|onmouseover)\s*=",
            r"(?i)javascript\s*:\s*.*",
            r"(?i)(eval|alert|prompt|confirm)\s*\(",
        ],
        "COMMAND_INJECTION": [
            r"(?i)(;|\||\|\||&&)\s*(whoami|cat\s+/etc/passwd|id|uname|dir|net\s+user)",
            r"(?i)\$\([^\)]+\)",
            r"(?i)`[^`]+`",
            r"(?i)(nc|ncat|bash|sh|zsh)\s+-i",
            r"(?i)powershell\s+(-enc|-encodedcommand)",
        ],
        "SSRF_CLOUD_METADATA": [
            r"(?i)169\.254\.169\.254",
            r"(?i)metadata\.google\.internal",
            r"(?i)(localhost|127\.0\.0\.1|0\.0\.0\.0)(:[0-9]+)?",
            r"(?i)file://|gopher://|dict://",
        ],
        "PATH_TRAVERSAL": [
            r"(?i)(\.\./|\.\.\\|\%2e\%2e\%2f|\%2e\%2e/|\.\.%2f)",
            r"(?i)(/etc/passwd|/etc/shadow|/proc/self/environ)",
            r"(?i)(c:\\windows\\system32|win\.ini|boot\.ini)",
        ],
    }

    def __init__(self, brute_force_threshold: int = 10, window_seconds: int = 60):
        self.brute_force_threshold = brute_force_threshold
        self.window_seconds = window_seconds
        # In-memory sliding window for brute force tracking: ip -> list of timestamps
        self._login_attempts: Dict[str, List[float]] = defaultdict(list)

    def analyze_payload(
        self,
        target_path: str,
        query_params: str = "",
        body: str = "",
        headers: Optional[Dict[str, str]] = None,
        source_ip: str = "unknown",
    ) -> List[Dict[str, Any]]:
        """
        Inspects all parts of a request for attack signatures.
        """
        findings = []
        combined_text = f"{target_path} {query_params} {body}"
        if headers:
            combined_text += " " + " ".join(f"{k}:{v}" for k, v in headers.items())

        for attack_type, regex_list in self.PATTERNS.items():
            for pat in regex_list:
                match = re.search(pat, combined_text)
                if match:
                    severity = (
                        "CRITICAL"
                        if attack_type
                        in ["COMMAND_INJECTION", "SSRF_CLOUD_METADATA", "SQL_INJECTION"]
                        else "HIGH"
                    )
                    findings.append(
                        {
                            "attack_type": attack_type,
                            "severity": severity,
                            "matched_pattern": pat,
                            "evidence": match.group(0)[:100],
                            "source_ip": source_ip,
                            "target_path": target_path,
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                            "recommendation": f"Block request containing {attack_type} pattern and sanitize input.",
                        }
                    )
                    break  # Avoid duplicate alerts for the same category on one request

        return findings

    def record_auth_attempt(
        self, source_ip: str, success: bool = False
    ) -> Optional[Dict[str, Any]]:
        """
        Sliding-window credential stuffing / brute force detector.
        """
        if success:
            return None

        now = time.time()
        # Clean up timestamps outside window
        timestamps = [
            t for t in self._login_attempts[source_ip] if now - t <= self.window_seconds
        ]
        timestamps.append(now)
        self._login_attempts[source_ip] = timestamps

        if len(timestamps) >= self.brute_force_threshold:
            return {
                "attack_type": "BRUTE_FORCE_CREDENTIAL_ATTACK",
                "severity": "HIGH",
                "source_ip": source_ip,
                "attempt_count": len(timestamps),
                "window_seconds": self.window_seconds,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "recommendation": f"Enforce IP rate-limiting, CAPTCHA, or temporary lock on IP {source_ip}.",
            }
        return None
