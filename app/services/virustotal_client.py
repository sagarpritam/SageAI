"""VirusTotal URL scanner client.

Checks if a URL has been flagged as malicious by 70+ security vendors.
Requires free API key (500 requests/day): https://www.virustotal.com/gui/join-us
"""

import os
import logging
import base64
import httpx

logger = logging.getLogger("sageai.virustotal")

VT_API = "https://www.virustotal.com/api/v3"


async def check_url_reputation(url: str) -> list[dict]:
    """Check a URL's reputation on VirusTotal (70+ security vendors)."""
    findings = []
    api_key = os.getenv("VIRUSTOTAL_API_KEY")

    if not api_key:
        logger.debug("VirusTotal not configured — skipping")
        return findings

    try:
        # URL ID is base64url of the URL without padding
        url_id = base64.urlsafe_b64encode(url.encode()).decode().rstrip("=")

        async with httpx.AsyncClient(timeout=15) as client:
            # Try to get existing analysis first
            response = await client.get(
                f"{VT_API}/urls/{url_id}",
                headers={"x-apikey": api_key},
            )

            if response.status_code == 404:
                # Submit URL for scanning
                response = await client.post(
                    f"{VT_API}/urls",
                    headers={"x-apikey": api_key},
                    data={"url": url},
                )
                if response.status_code == 200:
                    findings.append({
                        "type": "virustotal_submitted",
                        "severity": "info",
                        "detail": "URL submitted to VirusTotal for analysis — results will be available in a few minutes",
                        "source": "VirusTotal",
                    })
                return findings

            if response.status_code != 200:
                return findings

            data = response.json().get("data", {}).get("attributes", {})
            stats = data.get("last_analysis_stats", {})

            malicious = stats.get("malicious", 0)
            suspicious = stats.get("suspicious", 0)
            harmless = stats.get("harmless", 0)
            undetected = stats.get("undetected", 0)
            total = malicious + suspicious + harmless + undetected

            if malicious > 0:
                findings.append({
                    "type": "virustotal_malicious",
                    "severity": "critical" if malicious >= 5 else "high",
                    "detail": f"VirusTotal: {malicious}/{total} vendors flagged this URL as malicious",
                    "malicious_count": malicious,
                    "total_vendors": total,
                    "source": "VirusTotal",
                })
            elif suspicious > 0:
                findings.append({
                    "type": "virustotal_suspicious",
                    "severity": "medium",
                    "detail": f"VirusTotal: {suspicious}/{total} vendors flagged this URL as suspicious",
                    "source": "VirusTotal",
                })
            else:
                findings.append({
                    "type": "virustotal_clean",
                    "severity": "info",
                    "detail": f"VirusTotal: URL is clean — 0/{total} vendors flagged it",
                    "source": "VirusTotal",
                })

            # Check reputation score
            reputation = data.get("reputation", 0)
            if reputation < -10:
                findings.append({
                    "type": "virustotal_bad_reputation",
                    "severity": "high",
                    "detail": f"VirusTotal community reputation score: {reputation} (negative = bad)",
                    "source": "VirusTotal",
                })

    except Exception as e:
        logger.error(f"VirusTotal error: {e}")

    return findings
