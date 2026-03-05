"""NVD (National Vulnerability Database) client.

Queries NIST's CVE API to match detected technologies against known vulnerabilities.
Free, no API key required (rate-limited: 5 requests per 30 seconds).
Docs: https://nvd.nist.gov/developers/vulnerabilities
"""

import logging
import httpx

logger = logging.getLogger("sageai.nvd")

NVD_API = "https://services.nvd.nist.gov/rest/json/cves/2.0"


async def search_cves(keyword: str, max_results: int = 5) -> list[dict]:
    """Search NVD for CVEs matching a keyword (e.g., 'apache 2.4', 'nginx', 'openssl')."""
    findings = []

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(NVD_API, params={
                "keywordSearch": keyword,
                "resultsPerPage": max_results,
            })

            if response.status_code != 200:
                logger.warning(f"NVD API returned {response.status_code}")
                return findings

            data = response.json()
            vulns = data.get("vulnerabilities", [])

            for vuln in vulns:
                cve = vuln.get("cve", {})
                cve_id = cve.get("id", "Unknown")

                # Get CVSS score
                metrics = cve.get("metrics", {})
                cvss_score = None
                cvss_severity = None

                # Try CVSS 3.1 first, then 3.0, then 2.0
                for version in ["cvssMetricV31", "cvssMetricV30", "cvssMetricV2"]:
                    metric_list = metrics.get(version, [])
                    if metric_list:
                        cvss_data = metric_list[0].get("cvssData", {})
                        cvss_score = cvss_data.get("baseScore")
                        cvss_severity = cvss_data.get("baseSeverity", "UNKNOWN")
                        break

                # Get description
                descriptions = cve.get("descriptions", [])
                desc = next((d["value"] for d in descriptions if d.get("lang") == "en"), "No description")

                severity_map = {"CRITICAL": "critical", "HIGH": "high", "MEDIUM": "medium", "LOW": "low"}

                findings.append({
                    "type": "nvd_cve",
                    "severity": severity_map.get(str(cvss_severity).upper(), "medium"),
                    "detail": f"{cve_id} (CVSS {cvss_score}): {desc[:150]}",
                    "cve_id": cve_id,
                    "cvss_score": cvss_score,
                    "source": "NVD/NIST",
                })

    except httpx.TimeoutException:
        logger.warning("NVD API timeout")
    except Exception as e:
        logger.error(f"NVD lookup error: {e}")

    return findings


async def check_server_cves(server_header: str) -> list[dict]:
    """Extract server software from HTTP Server header and look up CVEs."""
    if not server_header:
        return []

    # Parse common server headers: "nginx/1.18.0", "Apache/2.4.41", "Microsoft-IIS/10.0"
    keyword = server_header.split("(")[0].strip().replace("/", " ")
    if len(keyword) < 3:
        return []

    return await search_cves(keyword, max_results=3)
