"""07 // RECON-NG: THE FRAMEWORK — Modular recon for high-precision targets.

Simulates Recon-ng's modular approach using free OSINT APIs.
Harvests domain info, host intelligence, and contact data from
multiple sources without leaving a trace.
"""

import logging
import socket

import httpx

logger = logging.getLogger("sageai.intelligence.recon_ng")

HACKERTARGET_API = "https://api.hackertarget.com"


async def recon_ng_scan(target: str) -> list[dict]:
    """Modular recon scan — the 'Silenced Sniper Rifle' of OSINT."""
    findings = []
    hostname = target.replace("https://", "").replace("http://", "").split("/")[0]

    import asyncio
    results = await asyncio.gather(
        _subdomain_enum(hostname),
        _reverse_dns(hostname),
        _http_headers(hostname),
        _page_links(hostname),
        return_exceptions=True,
    )

    for result in results:
        if isinstance(result, list):
            findings.extend(result)

    return findings


async def _subdomain_enum(hostname: str) -> list[dict]:
    """Subdomain enumeration via HackerTarget (free, 100 req/day)."""
    findings = []
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(f"{HACKERTARGET_API}/hostsearch/", params={"q": hostname})
            if resp.status_code == 200 and "error" not in resp.text.lower():
                lines = [l.strip() for l in resp.text.strip().split("\n") if l.strip()]
                subdomains = []
                for line in lines:
                    parts = line.split(",")
                    if len(parts) >= 2:
                        subdomains.append({"hostname": parts[0], "ip": parts[1]})

                if subdomains:
                    findings.append({
                        "module": "recon_ng",
                        "type": "subdomain_enumeration",
                        "severity": "info",
                        "title": f"Recon-ng: {len(subdomains)} Subdomains Discovered",
                        "detail": f"Hosts: {', '.join(s['hostname'] for s in subdomains[:15])}",
                        "data": {"subdomains": subdomains[:50]},
                        "source": "HackerTarget API (free)",
                    })
    except Exception as e:
        logger.warning(f"HackerTarget subdomain enum error: {e}")
    return findings


async def _reverse_dns(hostname: str) -> list[dict]:
    """Reverse DNS lookup."""
    findings = []
    try:
        ip = socket.gethostbyname(hostname)
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(f"{HACKERTARGET_API}/reversedns/", params={"q": ip})
            if resp.status_code == 200 and "error" not in resp.text.lower():
                records = [l.strip() for l in resp.text.strip().split("\n") if l.strip()]
                if records:
                    findings.append({
                        "module": "recon_ng",
                        "type": "reverse_dns",
                        "severity": "info",
                        "title": f"Recon-ng: {len(records)} Reverse DNS Records",
                        "detail": f"Records: {', '.join(records[:10])}",
                        "data": {"ip": ip, "reverse_dns": records[:20]},
                        "source": "HackerTarget Reverse DNS (free)",
                    })
    except Exception as e:
        logger.warning(f"Reverse DNS error: {e}")
    return findings


async def _http_headers(hostname: str) -> list[dict]:
    """Grab and analyze HTTP headers for interesting data."""
    findings = []
    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
            resp = await client.get(f"https://{hostname}")
            headers = dict(resp.headers)

            # Server identification
            server = headers.get("server", "")
            powered_by = headers.get("x-powered-by", "")

            interesting = {}
            if server:
                interesting["server"] = server
            if powered_by:
                interesting["x-powered-by"] = powered_by
            for key in ["x-aspnet-version", "x-generator", "x-drupal-cache", "x-varnish", "x-cache", "via"]:
                if key in headers:
                    interesting[key] = headers[key]

            if interesting:
                findings.append({
                    "module": "recon_ng",
                    "type": "http_fingerprint",
                    "severity": "info",
                    "title": f"Recon-ng: HTTP Server Fingerprint",
                    "detail": f"Server: {server or 'hidden'} | X-Powered-By: {powered_by or 'hidden'} | {len(interesting)} identifying headers detected.",
                    "data": {"headers": interesting, "all_headers": headers},
                    "source": "HTTP Header Analysis (free)",
                })

            # Technology detection from headers
            techs = []
            if "cloudflare" in str(headers).lower():
                techs.append("Cloudflare CDN")
            if "nginx" in server.lower():
                techs.append("Nginx")
            if "apache" in server.lower():
                techs.append("Apache")
            if "express" in powered_by.lower():
                techs.append("Express.js/Node.js")
            if "php" in powered_by.lower():
                techs.append("PHP")
            if "asp.net" in str(headers).lower():
                techs.append("ASP.NET")

            if techs:
                findings.append({
                    "module": "recon_ng",
                    "type": "tech_detection",
                    "severity": "info",
                    "title": f"Recon-ng: {len(techs)} Technologies Detected",
                    "detail": f"Technologies: {', '.join(techs)}",
                    "data": {"technologies": techs},
                    "source": "HTTP Header Analysis (free)",
                })

    except Exception as e:
        logger.warning(f"HTTP header analysis error: {e}")
    return findings


async def _page_links(hostname: str) -> list[dict]:
    """Extract external links and resources from the main page."""
    findings = []
    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
            resp = await client.get(f"https://{hostname}")

        import re
        # Extract links
        links = re.findall(r'href=["\']([^"\']+)["\']', resp.text)
        external_links = [l for l in links if l.startswith("http") and hostname not in l]

        if external_links:
            domains = set()
            for link in external_links:
                try:
                    from urllib.parse import urlparse
                    domains.add(urlparse(link).netloc)
                except Exception:
                    pass

            findings.append({
                "module": "recon_ng",
                "type": "external_links",
                "severity": "info",
                "title": f"Recon-ng: {len(domains)} External Domains Linked",
                "detail": f"External domains: {', '.join(sorted(domains)[:15])}",
                "data": {"external_domains": sorted(domains)[:30], "total_external_links": len(external_links)},
                "source": "Page Link Extraction (free)",
            })

        # Extract email addresses from page
        emails = set(re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', resp.text))
        if emails:
            findings.append({
                "module": "recon_ng",
                "type": "email_harvesting",
                "severity": "medium",
                "title": f"Recon-ng: {len(emails)} Email Addresses Harvested",
                "detail": f"Emails found on page: {', '.join(sorted(emails)[:10])}",
                "data": {"emails": sorted(emails)[:20]},
                "source": "Page Content Extraction (free)",
            })

    except Exception as e:
        logger.warning(f"Page link extraction error: {e}")
    return findings
