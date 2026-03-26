"""06 // INTEL X: THE ARCHIVE OF SECRETS — Historical breach & dark web archive search.

Free alternative: HaveIBeenPwned (HIBP) API + Wayback Machine CDX API.
If INTELX_API_KEY is set, upgrades to the Intelligence X API for deeper
breach data, paste archives, and dark web content.
"""

import logging
import os

import httpx

logger = logging.getLogger("sageai.intelligence.intelx")

HIBP_API = "https://haveibeenpwned.com/api/v3"
WAYBACK_API = "https://web.archive.org/cdx/search/cdx"
INTELX_API = "https://2.intelx.io"


async def intelx_search(target: str) -> list[dict]:
    """Search for historical breaches and archived data."""
    from app.core.config import settings
    api_key = settings.INTELX_API_KEY

    if api_key:
        return await _intelx_api_search(target, api_key)
    else:
        return await _intelx_free_search(target)


async def _intelx_free_search(target: str) -> list[dict]:
    """Free alternative: HIBP breach check + Wayback Machine."""
    findings = []

    # 1. HaveIBeenPwned — breach check (works for emails and domains)
    from app.core.config import settings
    hibp_key = settings.HIBP_API_KEY
    if "@" in target:
        # Email breach check
        try:
            headers = (
                {"hibp-api-key": hibp_key, "user-agent": "SageAI-Scanner"}
                if hibp_key
                else {"user-agent": "SageAI-Scanner"}
            )
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.get(
                    f"{HIBP_API}/breachedaccount/{target}",
                    headers=headers,
                    params={"truncateResponse": "false"},
                )
                if resp.status_code == 200:
                    breaches = resp.json()
                    breach_names = [b.get("Name", "Unknown") for b in breaches]
                    total_records = sum(b.get("PwnCount", 0) for b in breaches)
                    findings.append(
                        {
                            "module": "intelx",
                            "type": "email_breaches",
                            "severity": "critical" if len(breaches) > 5 else "high",
                            "title": f"Intel X: Email Found in {len(breaches)} Data Breaches",
                            "detail": f"Breaches: {', '.join(breach_names[:10])}. Total exposed records: {total_records:,}",
                            "data": {
                                "email": target,
                                "breach_count": len(breaches),
                                "breaches": breaches[:10],
                                "total_records_exposed": total_records,
                            },
                            "source": "HaveIBeenPwned (free)",
                        }
                    )
                elif resp.status_code == 404:
                    findings.append(
                        {
                            "module": "intelx",
                            "type": "email_clean",
                            "severity": "info",
                            "title": "Intel X: Email Not Found in Known Breaches",
                            "detail": f"{target} was not found in any known data breaches.",
                            "data": {"email": target},
                            "source": "HaveIBeenPwned (free)",
                        }
                    )
        except Exception as e:
            logger.error(f"HIBP lookup error: {e}")
    else:
        # Domain breach check
        try:
            hostname = (
                target.replace("https://", "").replace("http://", "").split("/")[0]
            )
            async with httpx.AsyncClient(timeout=15) as client:
                headers = (
                    {"hibp-api-key": hibp_key, "user-agent": "SageAI-Scanner"}
                    if hibp_key
                    else {"user-agent": "SageAI-Scanner"}
                )
                resp = await client.get(
                    f"{HIBP_API}/breaches",
                    headers=headers,
                )
                if resp.status_code == 200:
                    all_breaches = resp.json()
                    domain_breaches = [
                        b
                        for b in all_breaches
                        if hostname.lower() in b.get("Domain", "").lower()
                    ]
                    if domain_breaches:
                        findings.append(
                            {
                                "module": "intelx",
                                "type": "domain_breaches",
                                "severity": "high",
                                "title": f"Intel X: Domain Associated with {len(domain_breaches)} Breaches",
                                "detail": f"Breaches: {', '.join(b.get('Name', '') for b in domain_breaches[:5])}",
                                "data": {
                                    "domain": hostname,
                                    "breaches": domain_breaches[:5],
                                },
                                "source": "HaveIBeenPwned (free)",
                            }
                        )
        except Exception as e:
            logger.error(f"HIBP domain lookup error: {e}")

    # 2. Wayback Machine — historical snapshots
    try:
        hostname = target.replace("https://", "").replace("http://", "").split("/")[0]
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                WAYBACK_API,
                params={
                    "url": f"*.{hostname}",
                    "output": "json",
                    "fl": "timestamp,original,statuscode,mimetype",
                    "limit": "50",
                    "collapse": "urlkey",
                },
            )
            if resp.status_code == 200:
                data = resp.json()
                if data and len(data) > 1:
                    records = data[1:]  # Skip header row
                    urls_found = set(rec[1] for rec in records if len(rec) > 1)
                    findings.append(
                        {
                            "module": "intelx",
                            "type": "wayback_archive",
                            "severity": "info",
                            "title": f"Intel X: {len(urls_found)} Archived URLs Found",
                            "detail": f"The Wayback Machine has {len(urls_found)} unique URLs archived for this domain.",
                            "data": {
                                "domain": hostname,
                                "archived_url_count": len(urls_found),
                                "sample_urls": list(urls_found)[:15],
                                "earliest_snapshot": records[0][0] if records else None,
                                "latest_snapshot": records[-1][0] if records else None,
                            },
                            "source": "Wayback Machine CDX API (free)",
                        }
                    )

                    # Look for interesting paths (admin panels, config files, etc.)
                    sensitive_patterns = [
                        "/admin",
                        "/wp-admin",
                        "/config",
                        "/.env",
                        "/api/",
                        "/backup",
                        "/debug",
                        "/.git",
                    ]
                    sensitive_urls = [
                        url
                        for url in urls_found
                        if any(p in url.lower() for p in sensitive_patterns)
                    ]
                    if sensitive_urls:
                        findings.append(
                            {
                                "module": "intelx",
                                "type": "wayback_sensitive_paths",
                                "severity": "medium",
                                "title": f"Intel X: {len(sensitive_urls)} Sensitive Paths in Archives",
                                "detail": f"Potentially sensitive URLs found in historical archives: {', '.join(sensitive_urls[:5])}",
                                "data": {"sensitive_urls": sensitive_urls[:10]},
                                "source": "Wayback Machine CDX API (free)",
                            }
                        )
    except Exception as e:
        logger.error(f"Wayback Machine search error: {e}")

    return findings


async def _intelx_api_search(target: str, api_key: str) -> list[dict]:
    """Full Intelligence X API search."""
    findings = []
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            # Start search
            search_resp = await client.post(
                f"{INTELX_API}/intelligent/search",
                headers={"x-key": api_key},
                json={
                    "term": target,
                    "maxresults": 20,
                    "media": 0,
                    "sort": 2,
                    "terminate": [],
                },
            )
            if search_resp.status_code != 200:
                logger.warning("IntelX API error, falling back to free tier")
                return await _intelx_free_search(target)

            search_data = search_resp.json()
            search_id = search_data.get("id")
            if not search_id:
                return await _intelx_free_search(target)

            # Fetch results
            import asyncio

            await asyncio.sleep(3)
            result_resp = await client.get(
                f"{INTELX_API}/intelligent/search/result",
                headers={"x-key": api_key},
                params={"id": search_id, "limit": 20},
            )

            if result_resp.status_code == 200:
                results = result_resp.json().get("records", [])
                if results:
                    paste_count = sum(1 for r in results if r.get("bucket") == "pastes")
                    leak_count = sum(1 for r in results if r.get("bucket") == "leaks")
                    darknet_count = sum(
                        1 for r in results if r.get("bucket") == "darknet"
                    )

                    findings.append(
                        {
                            "module": "intelx",
                            "type": "intelx_deep_search",
                            "severity": "critical"
                            if leak_count > 0 or darknet_count > 0
                            else "medium",
                            "title": f"Intel X: {len(results)} Records Found in Deep Archives",
                            "detail": f"Pastes: {paste_count}, Leaks: {leak_count}, Darknet: {darknet_count}",
                            "data": {
                                "total_records": len(results),
                                "pastes": paste_count,
                                "leaks": leak_count,
                                "darknet": darknet_count,
                                "records_preview": [
                                    {
                                        "name": r.get("name", ""),
                                        "date": r.get("date", ""),
                                        "bucket": r.get("bucket", ""),
                                    }
                                    for r in results[:10]
                                ],
                            },
                            "source": "Intelligence X API (Pro)",
                        }
                    )

    except Exception as e:
        logger.error(f"IntelX API error: {e}")
        return await _intelx_free_search(target)

    return findings
