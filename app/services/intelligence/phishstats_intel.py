"""PhishStats Intelligence Service — Keyless Phishing Domain/IP Scanning."""

import logging

import httpx

logger = logging.getLogger("sageai.intelligence.phishstats")


async def phishstats_scan(target: str) -> list[dict]:
    """Check a domain or IP against PhishStats for active phishing campaigns.

    PhishStats is a free API, no key required.
    """
    findings = []

    # Simple query for IP or Domain
    # The API supports pagination and querying. We use a simple '_where' filter.
    url = f"https://phishstats.info:2096/api/phishing?_where=(ip,eq,{target})~or(domain,eq,{target})"

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()

            data = response.json()
            # PhishStats returns a list of matching records or a dict with 'data'
            records = data.get("data", []) if isinstance(data, dict) else data

            if isinstance(records, list) and len(records) > 0:
                for record in records[:5]:  # Take top 5 recent hits
                    findings.append(
                        {
                            "source": "PhishStats",
                            "type": "malicious_activity",
                            "title": f"Phishing Activity Detected: {record.get('title', 'Unknown Campaign')}",
                            "description": f"Target was found in PhishStats database. URL: {record.get('url')} (Score: {record.get('score', 0)})",
                            "severity": "high",
                            "raw_data": record,
                        }
                    )

        except httpx.HTTPStatusError as e:
            # 400 or 404 generally means no records or bad query, ignore gracefully
            if e.response.status_code not in (404, 400):
                logger.warning(f"PhishStats API error for {target}: {e}")
        except Exception as e:
            logger.warning(f"Failed to query PhishStats for {target}: {e}")

    return findings
