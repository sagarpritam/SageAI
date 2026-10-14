import csv
import io
import json

from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import Response

router = APIRouter(prefix="/export", tags=["Exports"])


@router.post("")
async def generate_export(data: dict, authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")

    fmt = data.get("format", "json")
    scan_data = data.get("scanData", {})
    target = scan_data.get("target", "unknown-target")
    findings = scan_data.get("findings", [])

    if fmt == "json":
        result = json.dumps(scan_data, indent=2)
        return Response(content=result, media_type="application/json")

    elif fmt == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Title", "Severity", "Description", "Remediation"])
        for f in findings:
            writer.writerow(
                [
                    f.get("title", ""),
                    f.get("severity", ""),
                    f.get("description", ""),
                    f.get("remediation", ""),
                ]
            )
        return Response(content=output.getvalue(), media_type="text/csv")

    elif fmt == "pdf":
        html_content = f"""
        <html>
            <head><title>SageAI Security Report - {target}</title>
            <style>
                body {{ font-family: sans-serif; color: #111; line-height: 1.6; padding: 40px; }}
                h1 {{ color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px; }}
                h2 {{ color: #333; margin-top: 30px; }}
                .finding {{ border: 1px solid #ddd; padding: 20px; margin-bottom: 20px; border-radius: 8px; }}
                .severity {{ font-weight: bold; padding: 4px 8px; border-radius: 4px; display: inline-block; }}
                .high {{ background: #fee2e2; color: #dc2626; }}
                .medium {{ background: #fef3c7; color: #d97706; }}
                .low {{ background: #d1fae5; color: #059669; }}
                .info {{ background: #e0e7ff; color: #4f46e5; }}
            </style>
            </head>
            <body>
                <h1>Security Assessment Report: {target}</h1>
                <p>Generated automatically by SageAI Autonomous Pentester.</p>

                <h2>Executive Summary</h2>
                <p>This report contains <b>{len(findings)}</b> identified vulnerabilities on the target infrastructure.</p>

                <h2>Detailed Findings</h2>
        """
        for f in findings:
            sev = str(f.get("severity", "info")).lower()
            html_content += f"""
                <div class="finding">
                    <h3 style="margin-top: 0;">{f.get("title", "Unknown")} <span class="severity {sev}">{sev.upper()}</span></h3>
                    <p><strong>Description:</strong><br/>{f.get("description", "N/A")}</p>
                    <p><strong>Remediation:</strong><br/>{f.get("remediation", "N/A")}</p>
                </div>
            """
        html_content += "</body></html>"

        try:
            from weasyprint import HTML

            pdf_bytes = HTML(string=html_content).write_pdf()
            return Response(content=pdf_bytes, media_type="application/pdf")
        except Exception as e:
            # Fallback if WeasyPrint fails (e.g. missing GTK on Windows local dev)
            print(f"WeasyPrint PDF generation failed: {e}")
            return Response(content=html_content, media_type="text/html")
    else:
        raise HTTPException(status_code=400, detail="Unsupported format")
