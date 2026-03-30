"""SageAI Defensive Security Shield — Security Posture Engine.

Calculates a composite security posture score with:
- Weighted multi-factor scoring across 4 categories
- Trend tracking (improvement/degradation over time)
- Letter grading (A+ through F)
- Category breakdown: Infrastructure, Application, Configuration, Data Exposure
"""

import logging
from datetime import datetime, timezone, timedelta
from typing import Optional

logger = logging.getLogger("sageai.posture")


# ──────────────────────────────────────────────
# Severity weights
# ──────────────────────────────────────────────
SEVERITY_WEIGHT = {
    "critical": 10.0,
    "high": 6.0,
    "medium": 3.0,
    "low": 1.0,
    "info": 0.0,
}

# ──────────────────────────────────────────────
# Finding → Category mapping
# ──────────────────────────────────────────────
CATEGORY_MAP = {
    # Infrastructure
    "port_open": "infrastructure",
    "ssl_expired": "infrastructure",
    "ssl_expiring_soon": "infrastructure",
    "ssl_weak_protocol": "infrastructure",
    "ssl_weak_cipher": "infrastructure",
    "ssl_invalid_cert": "infrastructure",
    "dns_risky_subdomains": "infrastructure",
    "shodan_vulns": "infrastructure",
    "nvd_cve": "infrastructure",
    # Application
    "SQL Injection": "application",
    "Reflected XSS": "application",
    "observatory_grade": "application",
    # Configuration
    "Missing Security Headers": "configuration",
    "crtsh_sensitive_subdomains": "configuration",
    # Data Exposure
    "virustotal_malicious": "data_exposure",
    "Identity Breach Intelligence": "data_exposure",
}

CATEGORY_LABELS = {
    "infrastructure": "Infrastructure",
    "application": "Application",
    "configuration": "Configuration",
    "data_exposure": "Data Exposure",
}

# ──────────────────────────────────────────────
# Grade thresholds (posture score → grade)
# Higher posture = better security
# ──────────────────────────────────────────────
GRADE_THRESHOLDS = [
    (95, "A+"),
    (90, "A"),
    (85, "A-"),
    (80, "B+"),
    (75, "B"),
    (70, "B-"),
    (65, "C+"),
    (60, "C"),
    (55, "C-"),
    (50, "D+"),
    (45, "D"),
    (40, "D-"),
    (0, "F"),
]


def _get_grade(posture_score: int) -> str:
    """Convert posture score to letter grade."""
    for threshold, grade in GRADE_THRESHOLDS:
        if posture_score >= threshold:
            return grade
    return "F"


def _get_grade_color(grade: str) -> str:
    """Return a hex color string for gauge rendering."""
    if grade.startswith("A"):
        return "#22C55E"
    if grade.startswith("B"):
        return "#3B82F6"
    if grade.startswith("C"):
        return "#EAB308"
    if grade.startswith("D"):
        return "#F97316"
    return "#EF4444"


def _categorize_findings(findings: list[dict]) -> dict[str, list[dict]]:
    """Sort findings into the 4 posture categories."""
    buckets: dict[str, list[dict]] = {
        "infrastructure": [],
        "application": [],
        "configuration": [],
        "data_exposure": [],
    }
    for f in findings:
        ftype = f.get("type", "")
        cat = CATEGORY_MAP.get(ftype, "configuration")  # default: config
        buckets[cat].append(f)
    return buckets


def _category_penalty(findings: list[dict], max_penalty: float = 25.0) -> float:
    """Calculate the penalty (0 → max_penalty) for a category's findings."""
    if not findings:
        return 0.0
    raw = sum(
        SEVERITY_WEIGHT.get(f.get("severity", "info").lower(), 0.0)
        for f in findings
    )
    # Diminishing returns: first few findings hurt more
    # penalty = max_penalty * (1 - e^(-raw/20))
    import math
    return round(max_penalty * (1 - math.exp(-raw / 20)), 2)


def calculate_posture(findings: list[dict]) -> dict:
    """Calculate a composite security posture score.

    Returns:
        dict with posture_score, grade, grade_color, category_scores,
        finding_counts, and severity_distribution.
    """
    if not findings:
        return {
            "posture_score": 100,
            "grade": "A+",
            "grade_color": "#22C55E",
            "categories": {
                cat: {"score": 100, "label": CATEGORY_LABELS[cat], "findings": 0, "penalty": 0}
                for cat in CATEGORY_LABELS
            },
            "total_findings": 0,
            "severity_distribution": {
                "critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0,
            },
        }

    buckets = _categorize_findings(findings)

    # Each category starts at 25 (perfect = 100 total).
    # Penalties subtract from each category's allocation.
    category_scores = {}
    total_posture = 0.0

    for cat_key, cat_label in CATEGORY_LABELS.items():
        cat_findings = buckets[cat_key]
        penalty = _category_penalty(cat_findings, max_penalty=25.0)
        cat_score = max(0, round(25.0 - penalty))
        category_scores[cat_key] = {
            "score": round((cat_score / 25.0) * 100),  # 0-100 per category
            "label": cat_label,
            "findings": len(cat_findings),
            "penalty": round(penalty, 1),
        }
        total_posture += cat_score

    posture_score = max(0, min(100, round(total_posture)))
    grade = _get_grade(posture_score)

    # Severity distribution
    severity_dist = {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}
    for f in findings:
        sev = f.get("severity", "info").lower()
        if sev in severity_dist:
            severity_dist[sev] += 1

    return {
        "posture_score": posture_score,
        "grade": grade,
        "grade_color": _get_grade_color(grade),
        "categories": category_scores,
        "total_findings": len(findings),
        "severity_distribution": severity_dist,
    }


def calculate_posture_trends(
    scans: list[dict],
    days: int = 30,
) -> list[dict]:
    """Build posture trend data from historical scans.

    Args:
        scans: List of scan dicts with 'findings' (list) and 'created_at' (ISO string).
        days: How many days of history to include.

    Returns:
        List of {date, posture_score, grade, total_findings} sorted by date.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    trend_points = []

    for scan in scans:
        created = scan.get("created_at")
        if not created:
            continue
        if isinstance(created, str):
            try:
                created = datetime.fromisoformat(created.replace("Z", "+00:00"))
            except (ValueError, TypeError):
                continue
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)

        if created < cutoff:
            continue

        findings = scan.get("findings", [])
        posture = calculate_posture(findings)

        trend_points.append({
            "date": created.strftime("%Y-%m-%d"),
            "posture_score": posture["posture_score"],
            "grade": posture["grade"],
            "total_findings": posture["total_findings"],
        })

    # Sort chronologically
    trend_points.sort(key=lambda p: p["date"])
    return trend_points


def posture_delta(current_score: int, previous_score: Optional[int]) -> dict:
    """Calculate the change between current and previous posture scores."""
    if previous_score is None:
        return {"delta": 0, "direction": "new", "label": "First scan"}

    delta = current_score - previous_score
    if delta > 0:
        direction = "improving"
        label = f"↑ {delta} pts improvement"
    elif delta < 0:
        direction = "degrading"
        label = f"↓ {abs(delta)} pts regression"
    else:
        direction = "stable"
        label = "→ No change"

    return {"delta": delta, "direction": direction, "label": label}
