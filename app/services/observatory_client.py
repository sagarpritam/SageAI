"""Mozilla HTTP Observatory client.

Gets an industry-standard security grade (A+ to F) for any website.
Free, no API key required.
Docs: https://observatory.mozilla.org/
"""

import logging
import httpx

logger = logging.getLogger("sageai.observatory")

OBSERVATORY_API = "https://observatory.mozilla.org/api/v2"


async def analyze_site(hostname: str) -> list[dict]:
    """Analyze a site using Mozilla HTTP Observatory."""
    findings = []
    hostname = hostname.replace("https://", "").replace("http://", "").split("/")[0]

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            # Trigger a new scan
            response = await client.post(
                f"{OBSERVATORY_API}/analyze",
                params={"host": hostname},
            )

            if response.status_code not in (200, 201):
                # Try GET for cached result
                response = await client.get(
                    f"{OBSERVATORY_API}/analyze",
                    params={"host": hostname},
                )

            if response.status_code != 200:
                return findings

            data = response.json()

            grade = data.get("grade")
            score = data.get("score")
            tests_passed = data.get("tests_passed", 0)
            tests_failed = data.get("tests_failed", 0)
            tests_total = tests_passed + tests_failed

            if grade:
                # Map grade to severity
                if grade.startswith("F"):
                    severity = "critical"
                elif grade.startswith("D"):
                    severity = "high"
                elif grade.startswith("C"):
                    severity = "medium"
                elif grade.startswith("B"):
                    severity = "low"
                else:
                    severity = "info"

                findings.append({
                    "type": "observatory_grade",
                    "severity": severity,
                    "detail": f"Mozilla Observatory grade: {grade} ({score}/100) — {tests_passed}/{tests_total} tests passed",
                    "grade": grade,
                    "score": score,
                    "source": "Mozilla Observatory",
                })

            # Get detailed test results
            scan_id = data.get("id")
            if scan_id:
                tests_response = await client.get(f"{OBSERVATORY_API}/getScanResults", params={"scan": scan_id})
                if tests_response.status_code == 200:
                    tests = tests_response.json()
                    failed_tests = {k: v for k, v in tests.items() if isinstance(v, dict) and not v.get("pass", True)}

                    for test_name, test_data in list(failed_tests.items())[:5]:
                        findings.append({
                            "type": "observatory_test_fail",
                            "severity": "medium",
                            "detail": f"Observatory: {test_name.replace('-', ' ').title()} — {test_data.get('score_description', 'Failed')}",
                            "test_name": test_name,
                            "source": "Mozilla Observatory",
                        })

    except httpx.TimeoutException:
        logger.warning("Mozilla Observatory timeout")
    except Exception as e:
        logger.error(f"Observatory error: {e}")

    return findings
