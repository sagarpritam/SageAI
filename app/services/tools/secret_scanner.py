"""Secret Leak Detection Scanner Tool.

Inspects source code for exposed high-entropy secrets, API keys, tokens,
and private cryptographic keys.
"""

import os
import re
from typing import Any, Dict, List, Pattern, TypedDict

from app.services.tools.base import BaseTool


class SecretPattern(TypedDict):
    type: str
    pattern: Pattern[str]
    severity: str
    description: str


SECRET_PATTERNS: List[SecretPattern] = [
    {
        "type": "AWS Access Key",
        "pattern": re.compile(r"\b(AKIA[0-9A-Z]{16})\b"),
        "severity": "CRITICAL",
        "description": "Exposed AWS Access Key ID can grant unauthorized cloud access.",
    },
    {
        "type": "GitHub Personal Access Token",
        "pattern": re.compile(
            r"\b(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{60,90})\b"
        ),
        "severity": "CRITICAL",
        "description": "Exposed GitHub Personal Access Token allows repository compromise.",
    },
    {
        "type": "Slack Incoming Webhook",
        "pattern": re.compile(
            r"https://hooks\.slack\.com/services/T[a-zA-Z0-9_]+/B[a-zA-Z0-9_]+/[a-zA-Z0-9_]+"
        ),
        "severity": "HIGH",
        "description": "Unmasked Slack incoming webhook token allows channel impersonation.",
    },
    {
        "type": "Private Cryptographic Key",
        "pattern": re.compile(
            r"-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----"
        ),
        "severity": "CRITICAL",
        "description": "Plaintext private cryptographic key committed to source control.",
    },
    {
        "type": "Generic API Token / Secret",
        "pattern": re.compile(
            r"""(?i)(?:api_key|secret_key|auth_token|client_secret)\s*[:=]\s*["']([a-zA-Z0-9_\-]{24,})["']"""
        ),
        "severity": "HIGH",
        "description": "Hardcoded secret or authentication token detected in source code.",
    },
]

IGNORE_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".ico",
    ".pdf",
    ".zip",
    ".tar",
    ".gz",
    ".pyc",
    ".db",
    ".sqlite",
}


class SecretScanner(BaseTool):
    """Scans repository files for committed credentials, API keys, and private keys."""

    @property
    def name(self) -> str:
        return "secret_scanner"

    @property
    def description(self) -> str:
        return (
            "Detects hardcoded secrets, credentials, API keys, and cryptographic "
            "keys in repository files."
        )

    async def run(self, target: str, **kwargs) -> Dict[str, Any]:
        """Scan a local directory for secrets."""
        target_dir = kwargs.get("target_dir") or target
        findings: List[Dict[str, Any]] = []

        if not os.path.exists(target_dir):
            return {"error": f"Target directory not found: {target_dir}"}

        for root, dirs, files in os.walk(target_dir):
            # Skip hidden and cache directories
            dirs[:] = [
                d
                for d in dirs
                if not d.startswith(".")
                and d not in ("node_modules", "venv", "__pycache__")
            ]

            for file_name in files:
                _, ext = os.path.splitext(file_name)
                if ext.lower() in IGNORE_EXTENSIONS or file_name.startswith("."):
                    continue

                file_path = os.path.join(root, file_name)
                rel_path = os.path.relpath(file_path, target_dir).replace("\\", "/")

                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        for line_num, line in enumerate(f, 1):
                            # Skip test mock tokens or obvious placeholders
                            if "test" in file_name.lower() or "example" in line.lower():
                                continue

                            for rule in SECRET_PATTERNS:
                                match = rule["pattern"].search(line)
                                if match:
                                    findings.append(
                                        {
                                            "file": rel_path,
                                            "line": line_num,
                                            "type": rule["type"],
                                            "severity": rule["severity"],
                                            "issue_text": rule["description"],
                                            "code": line.strip()[:100],
                                            "scanner": "secret_scanner",
                                        }
                                    )
                                    break  # Only one finding per line
                except Exception:
                    continue

        return {
            "scanner": "secret_scanner",
            "total_findings": len(findings),
            "findings": findings,
        }
