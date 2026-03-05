"""Risk engine — calculates aggregate risk score from scan findings.

Handles both core scanner results and OSINT enrichment data with
weighted scoring for different finding types.
"""

# Severity weights (case-insensitive)
SEVERITY_WEIGHTS = {
    "critical": 40,
    "high": 25,
    "medium": 15,
    "low": 5,
    "info": 0,
}

# Bonus weights for specific high-impact finding types
FINDING_TYPE_BONUS = {
    "SQL Injection": 20,
    "Reflected XSS": 10,
    "ssl_expired": 20,
    "ssl_invalid_cert": 20,
    "ssl_weak_protocol": 10,
    "virustotal_malicious": 25,
    "shodan_vulns": 20,
    "nvd_cve": 15,
    "observatory_grade": 0,  # scored by grade below
    "crtsh_sensitive_subdomains": 5,
}


def calculate_risk(findings: list[dict]) -> dict:
    """Calculate an aggregate risk score from scan findings.
    
    Scoring:
      - Base: sum of severity weights per finding
      - Bonus: extra weight for critical finding types (SQLi, expired SSL, etc.)
      - Observatory: deducts points for bad grades
      - Capped at 100
    """
    score = 0

    for f in findings:
        severity = f.get("severity", "info").lower()
        ftype = f.get("type", "")

        # Base severity score
        score += SEVERITY_WEIGHTS.get(severity, 0)

        # Type-specific bonus
        score += FINDING_TYPE_BONUS.get(ftype, 0)

        # Observatory grade scoring
        if ftype == "observatory_grade":
            grade = f.get("grade", "")
            if grade.startswith("F"):
                score += 30
            elif grade.startswith("D"):
                score += 20
            elif grade.startswith("C"):
                score += 10

        # CVSS-based scoring for NVD CVEs
        if ftype == "nvd_cve" and f.get("cvss_score"):
            cvss = float(f["cvss_score"])
            if cvss >= 9.0:
                score += 15
            elif cvss >= 7.0:
                score += 10
            elif cvss >= 4.0:
                score += 5

    # Cap at 100
    score = min(score, 100)

    if score >= 70:
        level = "Critical"
    elif score >= 40:
        level = "High"
    elif score >= 20:
        level = "Medium"
    else:
        level = "Low"

    return {
        "risk_score": score,
        "risk_level": level,
        "total_findings": len(findings),
    }
