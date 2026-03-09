"""03 // BABEL X: THE LINGUISTIC MESH / DARK WEB MONITORING.

Free alternative: Ahmia.fi (Tor search engine) + Paste site monitoring.
Searches the dark web and paste sites for references to the target.
If BABELX_API_KEY is set, uses the Babel Street API instead.
"""

import logging
import os

import httpx

logger = logging.getLogger("sageai.intelligence.darkweb")

AHMIA_API = "https://ahmia.fi/search/"
PASTE_SOURCES = [
    ("PasteBin (cached)", "https://psbdmp.ws/api/v3/search/{query}"),
]


async def darkweb_search(target: str) -> list[dict]:
    """Search dark web and paste sites for target references."""
    api_key = os.getenv("BABELX_API_KEY")

    if api_key:
        return await _babelx_api_search(target, api_key)
    else:
        return await _darkweb_free_search(target)


async def _darkweb_free_search(target: str) -> list[dict]:
    """Free dark web monitoring: Ahmia.fi + paste site search."""
    findings = []

    # 1. Ahmia.fi — Tor search engine (clearnet gateway)
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.get(
                AHMIA_API,
                params={"q": target},
                headers={"User-Agent": "SageAI-Scanner/3.0"},
            )
            if resp.status_code == 200:
                import re
                # Parse results from HTML
                result_count = len(re.findall(r'<li class="result"', resp.text))
                onion_links = re.findall(r'href="([^"]*\.onion[^"]*)"', resp.text)
                titles = re.findall(r'<h4>(.*?)</h4>', resp.text, re.DOTALL)

                if result_count > 0 or onion_links:
                    findings.append({
                        "module": "darkweb",
                        "type": "tor_mentions",
                        "severity": "high" if result_count > 5 else "medium",
                        "title": f"Babel X: {result_count} Dark Web Mentions Found",
                        "detail": (
                            f"Ahmia.fi found {result_count} references to '{target}' on the Tor network. "
                            f"Onion links found: {len(onion_links)}"
                        ),
                        "data": {
                            "query": target,
                            "result_count": result_count,
                            "onion_link_count": len(onion_links),
                            "sample_titles": [t.strip()[:100] for t in titles[:5]],
                        },
                        "source": "Ahmia.fi Tor Search (free)",
                    })
                else:
                    findings.append({
                        "module": "darkweb",
                        "type": "tor_clean",
                        "severity": "info",
                        "title": "Babel X: No Dark Web Mentions Found",
                        "detail": f"No references to '{target}' were found on the Tor network via Ahmia.fi.",
                        "data": {"query": target, "result_count": 0},
                        "source": "Ahmia.fi Tor Search (free)",
                    })
    except Exception as e:
        logger.error(f"Ahmia.fi search error: {e}")

    # 2. Paste site search
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"https://psbdmp.ws/api/v3/search/{target}",
                headers={"User-Agent": "SageAI-Scanner/3.0"},
            )
            if resp.status_code == 200:
                data = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else []
                if isinstance(data, list) and data:
                    findings.append({
                        "module": "darkweb",
                        "type": "paste_leaks",
                        "severity": "high",
                        "title": f"Babel X: {len(data)} Paste Leaks Found",
                        "detail": f"Found {len(data)} paste entries referencing '{target}' on public paste sites.",
                        "data": {
                            "paste_count": len(data),
                            "pastes": data[:10],
                        },
                        "source": "PasteBin Dump Monitor (free)",
                    })
    except Exception as e:
        logger.warning(f"Paste site search error: {e}")

    # 3. Google Dork simulation (checking for leaked data patterns)
    try:
        hostname = target.replace("https://", "").replace("http://", "").split("/")[0]
        dork_patterns = [
            f"site:pastebin.com \"{hostname}\"",
            f"site:github.com \"{hostname}\" password OR secret OR api_key",
            f"\"{hostname}\" filetype:sql OR filetype:env OR filetype:log",
        ]
        findings.append({
            "module": "darkweb",
            "type": "dork_suggestions",
            "severity": "info",
            "title": "Babel X: Google Dork Reconnaissance Suggestions",
            "detail": "Suggested search queries to find leaked data in public sources.",
            "data": {"dork_queries": dork_patterns},
            "source": "SageAI Dork Generator (free)",
        })
    except Exception:
        pass

    return findings


async def _babelx_api_search(target: str, api_key: str) -> list[dict]:
    """Full Babel Street / Babel X API search (enterprise)."""
    findings = []
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://api.babelstreet.com/v1/search",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "query": target,
                    "sources": ["darkweb", "forums", "paste_sites", "social_media"],
                    "languages": ["en", "ru", "zh", "ar", "es"],
                    "limit": 50,
                },
            )
            if resp.status_code == 401:
                logger.warning("Babel X API key invalid, falling back to free")
                return await _darkweb_free_search(target)

            if resp.status_code == 200:
                data = resp.json()
                results = data.get("results", [])
                for r in results[:20]:
                    findings.append({
                        "module": "darkweb",
                        "type": f"babel_{r.get('source_type', 'unknown')}",
                        "severity": "high" if r.get("source_type") == "darkweb" else "medium",
                        "title": f"Babel X: {r.get('title', 'Untitled')}",
                        "detail": r.get("snippet", "")[:300],
                        "data": r,
                        "source": "Babel Street API (Enterprise)",
                    })

    except Exception as e:
        logger.error(f"Babel X API error: {e}")
        return await _darkweb_free_search(target)

    return findings
