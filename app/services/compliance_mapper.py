"""SageAI Defensive Security Shield — Compliance Mapper.

Maps every finding to compliance framework controls:
- OWASP Top 10 2021
- CWE identifiers
- NIST Cybersecurity Framework (CSF)
- PCI-DSS v4.0
- SOC 2 Trust Service Criteria
- ISO 27001

Calculates per-framework compliance scores.
"""

import logging

logger = logging.getLogger("sageai.compliance")


# ──────────────────────────────────────────────
# Comprehensive finding → multi-framework mapping
# ──────────────────────────────────────────────
COMPLIANCE_MAP: dict[str, dict] = {
    "Missing Security Headers": {
        "owasp": {"id": "A05:2021", "name": "Security Misconfiguration"},
        "cwe": {"id": "CWE-693", "name": "Protection Mechanism Failure"},
        "nist": {"function": "Protect", "category": "PR.DS", "control": "PR.DS-2", "desc": "Data-in-transit is protected"},
        "pci_dss": {"req": "6.5.10", "desc": "Broken access control"},
        "soc2": {"criteria": "CC6.1", "desc": "Logical and physical access controls"},
        "iso27001": {"control": "A.14.1.2", "desc": "Securing application services on public networks"},
    },
    "Reflected XSS": {
        "owasp": {"id": "A03:2021", "name": "Injection"},
        "cwe": {"id": "CWE-79", "name": "Improper Neutralization of Input During Web Page Generation"},
        "nist": {"function": "Protect", "category": "PR.DS", "control": "PR.DS-5", "desc": "Protections against data leaks"},
        "pci_dss": {"req": "6.2.4", "desc": "Software engineering techniques to prevent injection attacks"},
        "soc2": {"criteria": "CC6.6", "desc": "Restricting access to system boundaries"},
        "iso27001": {"control": "A.14.2.5", "desc": "Secure system engineering principles"},
    },
    "SQL Injection": {
        "owasp": {"id": "A03:2021", "name": "Injection"},
        "cwe": {"id": "CWE-89", "name": "SQL Injection"},
        "nist": {"function": "Protect", "category": "PR.DS", "control": "PR.DS-5", "desc": "Protections against data leaks"},
        "pci_dss": {"req": "6.2.4", "desc": "Software engineering techniques to prevent injection attacks"},
        "soc2": {"criteria": "CC6.6", "desc": "Restricting access to system boundaries"},
        "iso27001": {"control": "A.14.2.5", "desc": "Secure system engineering principles"},
    },
    "ssl_expired": {
        "owasp": {"id": "A02:2021", "name": "Cryptographic Failures"},
        "cwe": {"id": "CWE-295", "name": "Improper Certificate Validation"},
        "nist": {"function": "Protect", "category": "PR.DS", "control": "PR.DS-2", "desc": "Data-in-transit is protected"},
        "pci_dss": {"req": "4.2.1", "desc": "Strong cryptography for transmission of cardholder data"},
        "soc2": {"criteria": "CC6.7", "desc": "Restricting transmission, movement, and removal of information"},
        "iso27001": {"control": "A.10.1.1", "desc": "Policy on the use of cryptographic controls"},
    },
    "ssl_expiring_soon": {
        "owasp": {"id": "A02:2021", "name": "Cryptographic Failures"},
        "cwe": {"id": "CWE-295", "name": "Improper Certificate Validation"},
        "nist": {"function": "Identify", "category": "ID.RA", "control": "ID.RA-1", "desc": "Asset vulnerabilities identified"},
        "pci_dss": {"req": "4.2.1", "desc": "Strong cryptography for transmission of cardholder data"},
        "soc2": {"criteria": "CC7.1", "desc": "Monitoring of infrastructure and software"},
        "iso27001": {"control": "A.10.1.1", "desc": "Policy on the use of cryptographic controls"},
    },
    "ssl_weak_protocol": {
        "owasp": {"id": "A02:2021", "name": "Cryptographic Failures"},
        "cwe": {"id": "CWE-326", "name": "Inadequate Encryption Strength"},
        "nist": {"function": "Protect", "category": "PR.DS", "control": "PR.DS-2", "desc": "Data-in-transit is protected"},
        "pci_dss": {"req": "4.2.1", "desc": "Strong cryptography for transmission of cardholder data"},
        "soc2": {"criteria": "CC6.7", "desc": "Restricting transmission, movement, and removal of information"},
        "iso27001": {"control": "A.10.1.1", "desc": "Policy on the use of cryptographic controls"},
    },
    "ssl_weak_cipher": {
        "owasp": {"id": "A02:2021", "name": "Cryptographic Failures"},
        "cwe": {"id": "CWE-327", "name": "Use of Broken or Risky Cryptographic Algorithm"},
        "nist": {"function": "Protect", "category": "PR.DS", "control": "PR.DS-2", "desc": "Data-in-transit is protected"},
        "pci_dss": {"req": "4.2.1", "desc": "Strong cryptography for transmission of cardholder data"},
        "soc2": {"criteria": "CC6.7", "desc": "Restricting transmission, movement, and removal of information"},
        "iso27001": {"control": "A.10.1.1", "desc": "Policy on the use of cryptographic controls"},
    },
    "ssl_invalid_cert": {
        "owasp": {"id": "A02:2021", "name": "Cryptographic Failures"},
        "cwe": {"id": "CWE-295", "name": "Improper Certificate Validation"},
        "nist": {"function": "Protect", "category": "PR.DS", "control": "PR.DS-2", "desc": "Data-in-transit is protected"},
        "pci_dss": {"req": "4.2.1", "desc": "Strong cryptography for transmission of cardholder data"},
        "soc2": {"criteria": "CC6.7", "desc": "Restricting transmission, movement, and removal of information"},
        "iso27001": {"control": "A.10.1.1", "desc": "Policy on the use of cryptographic controls"},
    },
    "port_open": {
        "owasp": {"id": "A05:2021", "name": "Security Misconfiguration"},
        "cwe": {"id": "CWE-200", "name": "Exposure of Sensitive Information"},
        "nist": {"function": "Protect", "category": "PR.AC", "control": "PR.AC-5", "desc": "Network integrity protected"},
        "pci_dss": {"req": "1.3.1", "desc": "Restrict inbound traffic to required protocols"},
        "soc2": {"criteria": "CC6.6", "desc": "Restricting access to system boundaries"},
        "iso27001": {"control": "A.13.1.1", "desc": "Network controls"},
    },
    "dns_risky_subdomains": {
        "owasp": {"id": "A05:2021", "name": "Security Misconfiguration"},
        "cwe": {"id": "CWE-200", "name": "Exposure of Sensitive Information"},
        "nist": {"function": "Identify", "category": "ID.AM", "control": "ID.AM-2", "desc": "Software platforms and applications identified"},
        "pci_dss": {"req": "2.1", "desc": "Change vendor-supplied defaults"},
        "soc2": {"criteria": "CC6.1", "desc": "Logical and physical access controls"},
        "iso27001": {"control": "A.8.1.1", "desc": "Inventory of assets"},
    },
    "virustotal_malicious": {
        "owasp": {"id": "A09:2021", "name": "Security Logging and Monitoring Failures"},
        "cwe": {"id": "CWE-829", "name": "Inclusion of Functionality from Untrusted Control Sphere"},
        "nist": {"function": "Detect", "category": "DE.CM", "control": "DE.CM-4", "desc": "Malicious code detected"},
        "pci_dss": {"req": "5.2", "desc": "Anti-malware mechanisms and procedures"},
        "soc2": {"criteria": "CC7.2", "desc": "Identification of security incidents"},
        "iso27001": {"control": "A.12.2.1", "desc": "Controls against malware"},
    },
    "shodan_vulns": {
        "owasp": {"id": "A06:2021", "name": "Vulnerable and Outdated Components"},
        "cwe": {"id": "CWE-1104", "name": "Use of Unmaintained Third-Party Components"},
        "nist": {"function": "Identify", "category": "ID.RA", "control": "ID.RA-1", "desc": "Asset vulnerabilities identified"},
        "pci_dss": {"req": "6.3.3", "desc": "Security patches installed within one month"},
        "soc2": {"criteria": "CC7.1", "desc": "Monitoring of infrastructure and software"},
        "iso27001": {"control": "A.12.6.1", "desc": "Management of technical vulnerabilities"},
    },
    "nvd_cve": {
        "owasp": {"id": "A06:2021", "name": "Vulnerable and Outdated Components"},
        "cwe": {"id": "CWE-1104", "name": "Use of Unmaintained Third-Party Components"},
        "nist": {"function": "Identify", "category": "ID.RA", "control": "ID.RA-1", "desc": "Asset vulnerabilities identified"},
        "pci_dss": {"req": "6.3.3", "desc": "Security patches installed within one month"},
        "soc2": {"criteria": "CC7.1", "desc": "Monitoring of infrastructure and software"},
        "iso27001": {"control": "A.12.6.1", "desc": "Management of technical vulnerabilities"},
    },
    "observatory_grade": {
        "owasp": {"id": "A05:2021", "name": "Security Misconfiguration"},
        "cwe": {"id": "CWE-16", "name": "Configuration"},
        "nist": {"function": "Protect", "category": "PR.IP", "control": "PR.IP-1", "desc": "Security configuration baselines"},
        "pci_dss": {"req": "2.2", "desc": "Configuration standards for all system components"},
        "soc2": {"criteria": "CC6.1", "desc": "Logical and physical access controls"},
        "iso27001": {"control": "A.14.1.1", "desc": "Information security requirements analysis"},
    },
    "crtsh_sensitive_subdomains": {
        "owasp": {"id": "A01:2021", "name": "Broken Access Control"},
        "cwe": {"id": "CWE-200", "name": "Exposure of Sensitive Information"},
        "nist": {"function": "Identify", "category": "ID.AM", "control": "ID.AM-2", "desc": "Software platforms and applications identified"},
        "pci_dss": {"req": "2.4", "desc": "Inventory of system components in scope"},
        "soc2": {"criteria": "CC6.1", "desc": "Logical and physical access controls"},
        "iso27001": {"control": "A.8.1.1", "desc": "Inventory of assets"},
    },
    "Identity Breach Intelligence": {
        "owasp": {"id": "A07:2021", "name": "Identification and Authentication Failures"},
        "cwe": {"id": "CWE-521", "name": "Weak Password Requirements"},
        "nist": {"function": "Respond", "category": "RS.MI", "control": "RS.MI-1", "desc": "Incidents are contained"},
        "pci_dss": {"req": "12.10.1", "desc": "Incident response plan"},
        "soc2": {"criteria": "CC7.3", "desc": "Response to identified security incidents"},
        "iso27001": {"control": "A.16.1.5", "desc": "Response to information security incidents"},
    },
}

# ──────────────────────────────────────────────
# Total controls per framework (for scoring)
# ──────────────────────────────────────────────
FRAMEWORK_TOTAL_CONTROLS = {
    "owasp": 10,     # OWASP Top 10
    "pci_dss": 12,   # PCI-DSS major requirements
    "soc2": 9,       # SOC2 CC criteria
    "nist": 5,       # NIST CSF functions
    "iso27001": 14,  # ISO 27001 Annex A domains
}

FRAMEWORK_LABELS = {
    "owasp": "OWASP Top 10 2021",
    "pci_dss": "PCI-DSS v4.0",
    "soc2": "SOC 2 Type II",
    "nist": "NIST CSF",
    "iso27001": "ISO 27001",
}


def map_finding_to_frameworks(finding_type: str) -> dict:
    """Map a single finding type to all compliance frameworks."""
    mapping = COMPLIANCE_MAP.get(finding_type)
    if not mapping:
        return {
            "finding_type": finding_type,
            "mapped": False,
            "frameworks": {},
        }
    return {
        "finding_type": finding_type,
        "mapped": True,
        "frameworks": mapping,
    }


def enrich_findings_with_compliance(findings: list[dict]) -> list[dict]:
    """Add compliance mapping data to each finding."""
    enriched = []
    for finding in findings:
        ftype = finding.get("type", "")
        mapping = map_finding_to_frameworks(ftype)
        enriched.append({
            **finding,
            "compliance": mapping["frameworks"] if mapping["mapped"] else {},
        })
    return enriched


def calculate_framework_compliance(
    findings: list[dict],
    framework: str,
) -> dict:
    """Calculate compliance score for a specific framework.

    Args:
        findings: List of scan findings
        framework: One of 'owasp', 'pci_dss', 'soc2', 'nist', 'iso27001'

    Returns:
        dict with score, status, controls_passed, controls_total, gaps, violations
    """
    if framework not in FRAMEWORK_TOTAL_CONTROLS:
        return {"error": f"Unknown framework: {framework}"}

    total = FRAMEWORK_TOTAL_CONTROLS[framework]
    label = FRAMEWORK_LABELS.get(framework, framework)

    # Collect violated controls
    violated_controls: set[str] = set()
    gaps: list[str] = []
    violations: list[dict] = []

    for finding in findings:
        ftype = finding.get("type", "")
        severity = finding.get("severity", "info").lower()
        mapping = COMPLIANCE_MAP.get(ftype, {})
        fw_mapping = mapping.get(framework)

        if fw_mapping:
            # Determine control ID
            if framework == "owasp":
                ctrl_id = fw_mapping.get("id", "")
            elif framework == "pci_dss":
                ctrl_id = fw_mapping.get("req", "")
            elif framework == "soc2":
                ctrl_id = fw_mapping.get("criteria", "")
            elif framework == "nist":
                ctrl_id = fw_mapping.get("control", "")
            elif framework == "iso27001":
                ctrl_id = fw_mapping.get("control", "")
            else:
                ctrl_id = ""

            if ctrl_id and ctrl_id not in violated_controls:
                violated_controls.add(ctrl_id)
                desc = fw_mapping.get("desc", fw_mapping.get("name", ""))
                gaps.append(f"[{ctrl_id}] {desc} — triggered by {ftype} ({severity})")
                violations.append({
                    "control_id": ctrl_id,
                    "description": desc,
                    "triggered_by": ftype,
                    "severity": finding.get("severity", "Info"),
                })

    controls_passed = max(0, total - len(violated_controls))
    score = round((controls_passed / total) * 100) if total > 0 else 100

    if score >= 90:
        status = "compliant"
    elif score >= 70:
        status = "partial"
    else:
        status = "non-compliant"

    return {
        "framework": framework,
        "framework_label": label,
        "score": score,
        "status": status,
        "controls_passed": controls_passed,
        "controls_total": total,
        "controls_violated": len(violated_controls),
        "gaps": gaps,
        "violations": violations,
    }


def calculate_all_compliance(findings: list[dict]) -> dict:
    """Calculate compliance scores for all supported frameworks.

    Returns:
        dict keyed by framework name, each containing full compliance report.
    """
    results = {}
    for framework in FRAMEWORK_TOTAL_CONTROLS:
        results[framework] = calculate_framework_compliance(findings, framework)

    # Overall compliance score (weighted average)
    total_score = sum(r["score"] for r in results.values())
    avg_score = round(total_score / len(results)) if results else 100

    return {
        "overall_score": avg_score,
        "overall_status": "compliant" if avg_score >= 90 else "partial" if avg_score >= 70 else "non-compliant",
        "frameworks": results,
    }
