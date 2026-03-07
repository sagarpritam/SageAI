"""PDF Report Generator — Phase 6.

Generates professional security scan reports as PDF files using ReportLab.
"""

import io
from datetime import datetime, timezone

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.graphics.shapes import Drawing, Rect, String
from reportlab.graphics.charts.piecharts import Pie

from app.services.ai_explainer import OWASP_MAP, REMEDIATION


# ---------------------
# Color palette
# ---------------------
BRAND_DARK = colors.HexColor("#0F172A")
BRAND_BLUE = colors.HexColor("#3B82F6")
BRAND_GREEN = colors.HexColor("#22C55E")
BRAND_YELLOW = colors.HexColor("#EAB308")
BRAND_ORANGE = colors.HexColor("#F97316")
BRAND_RED = colors.HexColor("#EF4444")

SEVERITY_COLORS = {
    "Critical": BRAND_RED,
    "High": BRAND_ORANGE,
    "Medium": BRAND_YELLOW,
    "Low": BRAND_GREEN,
}


def _get_styles():
    """Return custom paragraph styles."""
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        "BrandTitle",
        parent=styles["Title"],
        fontSize=24,
        textColor=BRAND_DARK,
        spaceAfter=6,
    ))
    styles.add(ParagraphStyle(
        "SectionHead",
        parent=styles["Heading2"],
        fontSize=14,
        textColor=BRAND_BLUE,
        spaceBefore=16,
        spaceAfter=8,
    ))
    styles.add(ParagraphStyle(
        "FindingTitle",
        parent=styles["Heading3"],
        fontSize=11,
        textColor=BRAND_DARK,
        spaceBefore=10,
        spaceAfter=4,
    ))
    styles.add(ParagraphStyle(
        "BodySmall",
        parent=styles["BodyText"],
        fontSize=9,
        textColor=colors.HexColor("#334155"),
    ))
    return styles


def _build_risk_chart(risk_score: int) -> Drawing:
    """Build a simple risk gauge chart."""
    d = Drawing(200, 120)

    # Background bar
    d.add(Rect(10, 50, 180, 20, fillColor=colors.HexColor("#E2E8F0"), strokeColor=None))

    # Filled bar
    fill_width = max(1, int(180 * min(risk_score, 100) / 100))
    fill_color = (
        BRAND_RED if risk_score >= 70
        else BRAND_ORANGE if risk_score >= 40
        else BRAND_YELLOW if risk_score >= 20
        else BRAND_GREEN
    )
    d.add(Rect(10, 50, fill_width, 20, fillColor=fill_color, strokeColor=None))

    # Score label
    d.add(String(80, 85, f"Risk Score: {risk_score}/100", fontSize=12, fillColor=BRAND_DARK))
    return d


def _build_severity_pie(findings: list[dict]) -> Drawing | None:
    """Build a pie chart of finding severities."""
    if not findings:
        return None

    severity_counts = {}
    for f in findings:
        sev = f.get("severity", "Low")
        severity_counts[sev] = severity_counts.get(sev, 0) + 1

    d = Drawing(250, 150)
    pie = Pie()
    pie.x = 50
    pie.y = 10
    pie.width = 120
    pie.height = 120
    pie.data = list(severity_counts.values())
    pie.labels = [f"{k} ({v})" for k, v in severity_counts.items()]

    for i, sev in enumerate(severity_counts.keys()):
        pie.slices[i].fillColor = SEVERITY_COLORS.get(sev, BRAND_BLUE)

    d.add(pie)
    return d


def generate_pdf_report(scan_data: dict) -> bytes:
    """Generate a professional PDF security report.

    Args:
        scan_data: dict with keys: id, target, risk_score, risk_level, findings, created_at

    Returns:
        PDF file as bytes
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=0.5 * inch,
        bottomMargin=0.5 * inch,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
    )

    styles = _get_styles()
    story = []

    # ---- Header ----
    story.append(Paragraph("🛡️ SageAI Security Report", styles["BrandTitle"]))
    story.append(HRFlowable(width="100%", thickness=2, color=BRAND_BLUE))
    story.append(Spacer(1, 12))

    # Meta info table
    meta = [
        ["Report ID:", scan_data.get("id", "N/A")],
        ["Target:", scan_data.get("target", "N/A")],
        ["Generated:", datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")],
        ["Risk Level:", scan_data.get("risk_level", "Low")],
    ]
    meta_table = Table(meta, colWidths=[1.5 * inch, 4.5 * inch])
    meta_table.setStyle(TableStyle([
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("TEXTCOLOR", (0, 0), (0, -1), BRAND_DARK),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 16))

    # ---- Executive Summary ----
    story.append(Paragraph("Executive Summary", styles["SectionHead"]))

    risk_score = scan_data.get("risk_score", 0)
    risk_level = scan_data.get("risk_level", "Low")
    findings = scan_data.get("findings", [])

    story.append(Paragraph(
        f"The scan identified <b>{len(findings)}</b> finding(s) with an overall "
        f"risk score of <b>{risk_score}/100</b> ({risk_level}). "
        f"See below for detailed findings and recommended remediation steps.",
        styles["BodySmall"],
    ))
    story.append(Spacer(1, 8))

    # Risk gauge
    story.append(_build_risk_chart(risk_score))
    story.append(Spacer(1, 8))

    # Severity pie chart
    pie = _build_severity_pie(findings)
    if pie:
        story.append(pie)
        story.append(Spacer(1, 16))

    # ---- Findings ----
    if findings:
        story.append(Paragraph("Detailed Findings", styles["SectionHead"]))

        for i, finding in enumerate(findings, 1):
            ftype = finding.get("type", "Unknown")
            severity = finding.get("severity", "Low")
            sev_color = SEVERITY_COLORS.get(severity, BRAND_BLUE)

            story.append(Paragraph(
                f"#{i} — {ftype} "
                f"<font color='{sev_color.hexval()}'>[{severity}]</font>",
                styles["FindingTitle"],
            ))

            desc = finding.get("description", "No description.")
            story.append(Paragraph(desc, styles["BodySmall"]))

            # OWASP mapping
            owasp = OWASP_MAP.get(ftype)
            if owasp:
                story.append(Paragraph(
                    f"<b>OWASP:</b> {owasp['owasp_id']} — {owasp['owasp_category']} | "
                    f"<b>CWE:</b> {owasp['cwe']}",
                    styles["BodySmall"],
                ))

            # Missing headers detail
            missing = finding.get("missing_headers")
            if missing:
                story.append(Paragraph(
                    f"<b>Missing:</b> {', '.join(missing)}",
                    styles["BodySmall"],
                ))

            # Remediation
            remediation = REMEDIATION.get(ftype, {}).get("steps", [])
            if remediation:
                story.append(Spacer(1, 4))
                story.append(Paragraph("<b>Remediation:</b>", styles["BodySmall"]))
                for step in remediation:
                    story.append(Paragraph(f"  • {step}", styles["BodySmall"]))

            story.append(Spacer(1, 8))
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#CBD5E1")))

    else:
        story.append(Paragraph("Detailed Findings", styles["SectionHead"]))
        story.append(Paragraph("No vulnerabilities were detected. ✅", styles["BodySmall"]))

    # ---- Footer ----
    story.append(Spacer(1, 24))
    story.append(HRFlowable(width="100%", thickness=1, color=BRAND_BLUE))
    story.append(Paragraph(
        "Generated by SageAI Security Scanner — https://SageAI.io",
        styles["BodySmall"],
    ))

    doc.build(story)
    return buffer.getvalue()


def generate_report(scan_data: dict) -> dict:
    """Generate a structured JSON report (kept for API compatibility)."""
    return {
        "report_id": scan_data.get("id", "unknown"),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "target": scan_data.get("target", ""),
        "summary": {
            "risk_score": scan_data.get("risk_score", 0),
            "risk_level": scan_data.get("risk_level", "Low"),
            "total_findings": len(scan_data.get("findings", [])),
        },
        "findings": scan_data.get("findings", []),
    }


def generate_hackerone_report(scan_data: dict) -> str:
    """Generate a HackerOne-compliant Markdown report for bug bounty submissions."""
    findings = scan_data.get("findings", [])
    target = scan_data.get("target", "Unknown Target")
    
    if not findings:
        return f"# Security Report for {target}\n\nNo vulnerabilities were detected during this scan.\n"

    md = []
    
    for finding in findings:
        title = finding.get("type", "Unknown Vulnerability")
        desc = finding.get("description", "No description provided.")
        severity = finding.get("severity", "Low")
        cvss = finding.get("cvss", "N/A")
        
        md.append(f"# {title} in {target}\n")
        
        md.append("## Description")
        md.append(f"{desc}\n")
        
        md.append("## Impact")
        md.append(f"This vulnerability allows attackers to compromise the confidentiality, integrity, or availability of the system. Severity is rated as **{severity}**.\n")
        
        md.append("## CVSS Score")
        md.append(f"{cvss} ({severity})\n")
        
        md.append("## Remediation")
        remediation = REMEDIATION.get(title, {}).get("steps", [])
        if remediation:
            for step in remediation:
                md.append(f"- {step}")
        else:
            md.append("Please refer to industry best practices (e.g., OWASP) to remediate this issue.")
        md.append("\n---\n")
        
    return "\n".join(md)

