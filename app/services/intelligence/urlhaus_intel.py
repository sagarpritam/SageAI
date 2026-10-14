"""URLhaus Intelligence Service — Keyless Malware Distribution Scanning."""

import logging

import httpx

logger = logging.getLogger("sageai.intelligence.urlhaus")


async def urlhaus_scan(target: str) -> list[dict]:
    """Check a domain or IP against URLhaus for active malware distribution.

    URLhaus is a project from abuse.ch that provides free access to malware
    distribution URLs, no API key required.
    """
    findings = []

    url = "https://urlhaus-api.abuse.ch/v1/host/"
    data = {"host": target}

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            # URLhaus API accepts form-encoded POST requests for querying hosts
            response = await client.post(url, data=data)
            response.raise_for_status()

            result = response.json()

            # query_status can be 'ok', 'no_results', or 'error'
            if result.get("query_status") == "ok":
                entries = result.get("urls", [])

                # Check if the host itself is listed as offline or online
                for entry in entries[:5]:  # Take the top 5 most recent entries
                    findings.append(
                        {
                            "source": "URLhaus",
                            "type": "malware_distribution",
                            "title": "Malware Distribution Server Detected",
                            "description": f"URLhaus flagged this host as distributing malware. "
                            f"URL: {entry.get('url')} | Tags: {','.join(entry.get('tags', []))} "
                            f"| Status: {entry.get('url_status')}",
                            "severity": "critical",
                            "raw_data": entry,
                        }
                    )

        except httpx.HTTPStatusError as e:
            logger.warning(f"URLhaus API HTTP error for {target}: {e}")
        except Exception as e:
            logger.warning(f"Failed to query URLhaus for {target}: {e}")

    return findings
