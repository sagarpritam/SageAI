"""SageAI Defensive Security Shield — SARIF Report Generator.

Exports scan findings in SARIF 2.1.0 format (Static Analysis Results
Interchange Format), compatible with:
- GitHub Code Scanning / Security tab
- GitLab SAST
- Azure DevOps
- CI/CD pipeline ingestion
"""

import json
import logging
from datetime import datetime, timezone

logger = logging.getLogger("sageai.sarif")

# SARIF schema version
SARIF_VERSION = "2.1.0"
SARIF_SCHEMA = "https://docs.oasis-open.org/sarif/sarif/v2.1.0/errata01/os/schemas/sarif-schema-2.1.0.json"

# ──────────────────────────────────────────────
# Finding type → CWE mapping (extends ai_explainer)
# ──────────────────────────────────────────────
CWE_MAP = {
    "Missing Security Headers": {
        "id": "CWE-693",
        "name": "Protection Mechanism Failure",
    },
    "Reflected XSS": {
        "id": "CWE-79",
        "name": "Improper Neutralization of Input During Web Page Generation",
    },
    "SQL Injection": {"id": "CWE-89", "name": "SQL Injection"},
    "ssl_expired": {"id": "CWE-295", "name": "Improper Certificate Validation"},
    "ssl_expiring_soon": {"id": "CWE-295", "name": "Improper Certificate Validation"},
    "ssl_weak_protocol": {"id": "CWE-326", "name": "Inadequate Encryption Strength"},
    "ssl_weak_cipher": {
        "id": "CWE-327",
        "name": "Use of Broken or Risky Cryptographic Algorithm",
    },
    "ssl_invalid_cert": {"id": "CWE-295", "name": "Improper Certificate Validation"},
    "port_open": {"id": "CWE-200", "name": "Exposure of Sensitive Information"},
    "dns_risky_subdomains": {
        "id": "CWE-200",
        "name": "Exposure of Sensitive Information",
    },
    "virustotal_malicious": {
        "id": "CWE-829",
        "name": "Inclusion of Functionality from Untrusted Control Sphere",
    },
    "shodan_vulns": {
        "id": "CWE-1104",
        "name": "Use of Unmaintained Third-Party Components",
    },
    "nvd_cve": {"id": "CWE-1104", "name": "Use of Unmaintained Third-Party Components"},
    "observatory_grade": {"id": "CWE-16", "name": "Configuration"},
    "crtsh_sensitive_subdomains": {
        "id": "CWE-200",
        "name": "Exposure of Sensitive Information",
    },
    "Identity Breach Intelligence": {
        "id": "CWE-521",
        "name": "Weak Password Requirements",
    },
}

# Severity → SARIF level mapping
SEVERITY_TO_SARIF_LEVEL = {
    "critical": "error",
    "high": "error",
    "medium": "warning",
    "low": "note",
    "info": "note",
}

# Severity → SARIF security-severity (GitHub uses this for severity badges)
SEVERITY_TO_SCORE = {
    "critical": "9.5",
    "high": "7.5",
    "medium": "5.0",
    "low": "2.5",
    "info": "0.0",
}


def _build_rule(finding_type: str, severity: str) -> dict:
    """Build a SARIF rule descriptor for a finding type."""
    cwe = CWE_MAP.get(finding_type, {"id": "CWE-1035", "name": "OWASP Top Ten"})
    cwe_id = cwe["id"].replace("CWE-", "")

    return {
        "id": f"sageai/{finding_type.lower().replace(' ', '-')}",
        "name": finding_type,
        "shortDescription": {
            "text": finding_type,
        },
        "fullDescription": {
            "text": f"SageAI detected: {finding_type}",
        },
        "helpUri": "https://sageai.io/docs/findings",
        "properties": {
            "security-severity": SEVERITY_TO_SCORE.get(severity.lower(), "5.0"),
            "tags": ["security", f"cwe-{cwe_id}"],
        },
        "relationships": [
            {
                "target": {
                    "id": cwe["id"],
                    "guid": None,
                    "toolComponent": {"name": "CWE", "guid": None},
                },
                "kinds": ["superset"],
            }
        ],
    }


def _build_result(finding: dict, index: int, target: str) -> dict:
    """Build a SARIF result object from a scan finding."""
    ftype = finding.get("type", "Unknown")
    severity = finding.get("severity", "info").lower()
    description = finding.get("description", f"Vulnerability detected: {ftype}")

    result = {
        "ruleId": f"sageai/{ftype.lower().replace(' ', '-')}",
        "ruleIndex": index,
        "level": SEVERITY_TO_SARIF_LEVEL.get(severity, "note"),
        "message": {
            "text": description,
        },
        "locations": [
            {
                "physicalLocation": {
                    "artifactLocation": {
                        "uri": target,
                        "uriBaseId": "TARGETROOT",
                    },
                },
                "logicalLocations": [
                    {
                        "name": ftype,
                        "kind": "function",
                    }
                ],
            }
        ],
        "properties": {
            "severity": finding.get("severity", "Info"),
            "scanner_module": finding.get("module", "sageai-core"),
        },
    }

    # Add missing headers detail if available
    missing = finding.get("missing_headers")
    if missing:
        result["properties"]["missing_headers"] = missing

    # Add CVSS if available
    cvss = finding.get("cvss_score") or finding.get("cvss")
    if cvss:
        result["properties"]["cvss_score"] = str(cvss)

    return result


def generate_sarif(scan_data: dict) -> dict:
    """Generate a complete SARIF 2.1.0 document from scan data.

    Args:
        scan_data: dict with keys: id, target, findings, risk_score, risk_level, created_at

    Returns:
        SARIF document as a Python dict.
    """
    target = scan_data.get("target", "unknown")
    findings = scan_data.get("findings", [])
    scan_id = scan_data.get("id", "unknown")
    created = scan_data.get("created_at", datetime.now(timezone.utc).isoformat())

    # Build unique rules from finding types
    rules = []
    rule_index_map: dict[str, int] = {}

    for finding in findings:
        ftype = finding.get("type", "Unknown")
        if ftype not in rule_index_map:
            rule_index_map[ftype] = len(rules)
            rules.append(_build_rule(ftype, finding.get("severity", "info")))

    # Build results
    results = []
    for finding in findings:
        ftype = finding.get("type", "Unknown")
        idx = rule_index_map.get(ftype, 0)
        results.append(_build_result(finding, idx, target))

    sarif = {
        "version": SARIF_VERSION,
        "$schema": SARIF_SCHEMA,
        "runs": [
            {
                "tool": {
                    "driver": {
                        "name": "SageAI Security Scanner",
                        "informationUri": "https://sageai.io",
                        "version": "2.0.0",
                        "semanticVersion": "2.0.0",
                        "rules": rules,
                    },
                },
                "results": results,
                "invocations": [
                    {
                        "executionSuccessful": True,
                        "startTimeUtc": created
                        if isinstance(created, str)
                        else created.isoformat(),
                    }
                ],
                "automationDetails": {
                    "id": f"sageai-scan/{scan_id}",
                    "guid": scan_id,
                },
                "properties": {
                    "target": target,
                    "risk_score": scan_data.get("risk_score", 0),
                    "risk_level": scan_data.get("risk_level", "Low"),
                    "total_findings": len(findings),
                },
            }
        ],
    }

    return sarif


def generate_sarif_json(scan_data: dict) -> str:
    """Generate SARIF as a formatted JSON string."""
    return json.dumps(generate_sarif(scan_data), indent=2, default=str)


def generate_sarif_bytes(scan_data: dict) -> bytes:
    """Generate SARIF as UTF-8 bytes (for file download)."""
    return generate_sarif_json(scan_data).encode("utf-8")
