"""Nuclei output parser — converts raw nuclei JSON findings into typed models."""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


VALID_SEVERITIES = {"info", "low", "medium", "high", "critical"}


class NucleiFinding(BaseModel):
    """Structured representation of a single nuclei finding."""

    template_id: str = Field(default="unknown", description="Nuclei template identifier")
    name: str = Field(default="Unknown Vulnerability")
    severity: str = Field(default="info")
    description: str = Field(default="")
    host: str = Field(default="unknown")
    matched_at: str = Field(default="")
    type: str = Field(default="unknown", description="Protocol type (http, tcp, dns, etc.)")
    cve_id: Optional[str] = Field(default=None, description="CVE identifier if applicable")
    tags: List[str] = Field(default_factory=list)


def _normalize_severity(raw: str) -> str:
    """Normalize severity to lowercase, defaulting to 'info'."""
    normalized = raw.strip().lower()
    return normalized if normalized in VALID_SEVERITIES else "info"


def parse_nuclei_findings(
    raw_findings: List[Dict[str, Any]],
    min_severity: Optional[str] = None,
) -> List[NucleiFinding]:
    """Parse nuclei JSON output into structured Python objects.

    Parameters
    ----------
    raw_findings : list[dict]
        Raw JSON lines from nuclei output.
    min_severity : str | None
        If set, only return findings >= this severity level.
    """
    severity_order = ["info", "low", "medium", "high", "critical"]

    parsed: List[NucleiFinding] = []
    for finding in raw_findings:
        info = finding.get("info", {})
        tags_raw = info.get("tags", [])
        if isinstance(tags_raw, str):
            tags_raw = [t.strip() for t in tags_raw.split(",")]

        severity = _normalize_severity(info.get("severity", "info"))

        # Extract CVE from tags if present
        cve_id = info.get("classification", {}).get("cve-id") if isinstance(info.get("classification"), dict) else None
        if not cve_id:
            for tag in tags_raw:
                if tag.upper().startswith("CVE-"):
                    cve_id = tag.upper()
                    break

        item = NucleiFinding(
            template_id=finding.get("template-id", "unknown"),
            name=info.get("name", "Unknown Vulnerability"),
            severity=severity,
            description=info.get("description", ""),
            host=finding.get("host", "unknown"),
            matched_at=finding.get("matched-at", ""),
            type=finding.get("type", "unknown"),
            cve_id=cve_id,
            tags=tags_raw,
        )

        # Apply severity filter
        if min_severity:
            min_idx = severity_order.index(min_severity.lower()) if min_severity.lower() in severity_order else 0
            curr_idx = severity_order.index(item.severity) if item.severity in severity_order else 0
            if curr_idx < min_idx:
                continue

        parsed.append(item)

    return parsed
