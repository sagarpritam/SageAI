import httpx


async def check_security_headers(target: str) -> dict | None:
    """Check for missing security headers on the target URL."""
    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
            response = await client.get(target)

        required_headers = [
            "Content-Security-Policy",
            "Strict-Transport-Security",
            "X-Frame-Options",
            "X-Content-Type-Options",
            "X-XSS-Protection",
            "Referrer-Policy",
        ]

        missing = [h for h in required_headers if h.lower() not in
                   {k.lower() for k in response.headers.keys()}]

        if missing:
            return {
                "type": "Missing Security Headers",
                "description": f"The target is missing {len(missing)} recommended security headers.",
                "severity": "Medium",
                "missing_headers": missing,
            }
        return None
    except httpx.RequestError:
        return None


async def test_xss(target: str) -> dict | None:
    """Test for reflected XSS vulnerability."""
    payload = "<script>alert('xss')</script>"
    test_url = f"{target}{'&' if '?' in target else '?'}q={payload}"

    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
            response = await client.get(test_url)

        if payload in response.text:
            return {
                "type": "Reflected XSS",
                "description": "The target reflects unsanitized script input back into the page.",
                "severity": "High",
            }
    except httpx.RequestError:
        return None

    return None


async def test_sqli(target: str) -> dict | None:
    """Test for basic SQL injection indicators."""
    payload = "' OR '1'='1"
    test_url = f"{target}{'&' if '?' in target else '?'}id={payload}"

    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
            response = await client.get(test_url)

        error_indicators = [
            "sql syntax", "mysql", "sqlite", "postgresql",
            "ora-", "warning", "unclosed quotation",
            "unterminated string", "syntax error",
        ]

        body_lower = response.text.lower()
        if any(indicator in body_lower for indicator in error_indicators):
            return {
                "type": "SQL Injection",
                "description": "The target shows database error messages when injected with SQL payloads.",
                "severity": "Critical",
            }
    except httpx.RequestError:
        return None

    return None


async def run_all_scans(target: str, scan_id: str = "") -> list[dict]:
    """Run all scan checks against a target and return findings.
    
    Phase 1 — Core Scans (6 checks):
      Security Headers, XSS, SQLi, SSL/TLS, Ports, DNS

    Phase 2 — OSINT Enrichment (5 sources):
      Shodan InternetDB, CRT.sh, Mozilla Observatory, VirusTotal, NVD CVE
    
    If scan_id is provided, broadcasts real-time progress via WebSocket.
    """
    import asyncio
    from concurrent.futures import ThreadPoolExecutor
    from app.services.ssl_scanner import scan_ssl
    from app.services.port_scanner import scan_ports
    from app.services.dns_scanner import scan_dns
    from app.services.shodan_client import lookup_ip
    from app.services.crtsh_client import search_certificates
    from app.services.observatory_client import analyze_site
    from app.services.virustotal_client import check_url_reputation
    from app.services.nvd_client import check_server_cves

    hostname = target.replace("http://", "").replace("https://", "").split("/")[0]
    loop = asyncio.get_event_loop()
    executor = ThreadPoolExecutor(max_workers=3)

    # Helper to broadcast progress
    async def _progress(phase: str, progress: int, findings_so_far: int, status: str = "running"):
        if scan_id:
            try:
                from app.routers.ws_routes import broadcast_scan_progress
                await broadcast_scan_progress(scan_id, {
                    "phase": phase, "status": status,
                    "progress": progress, "total": 11,
                    "findings_count": findings_so_far,
                })
            except Exception:
                pass

    # ── Phase 1: Core Scans ──────────────────────────
    await _progress("headers", 0, 0)

    http_results = await asyncio.gather(
        check_security_headers(target),
        test_xss(target),
        test_sqli(target),
        return_exceptions=True,
    )
    await _progress("xss_sqli", 3, sum(1 for r in http_results if isinstance(r, dict)))

    # Socket-based scans in thread pool
    try:
        ssl_results = await loop.run_in_executor(executor, scan_ssl, hostname)
    except Exception:
        ssl_results = []
    await _progress("ssl", 4, 0)

    try:
        port_results = await loop.run_in_executor(executor, scan_ports, hostname)
    except Exception:
        port_results = []
    await _progress("ports", 5, 0)

    try:
        dns_results = await loop.run_in_executor(executor, scan_dns, target)
    except Exception:
        dns_results = []
    await _progress("dns", 6, 0)

    # Collect Phase 1
    findings = []
    for result in http_results:
        if isinstance(result, dict):
            findings.append(result)
    for result_list in [ssl_results, port_results, dns_results]:
        if isinstance(result_list, list):
            findings.extend(result_list)

    await _progress("osint_start", 6, len(findings))

    # ── Phase 2: OSINT Enrichment ────────────────────
    server_header = ""
    try:
        async with httpx.AsyncClient(timeout=5, follow_redirects=True) as client:
            resp = await client.head(target)
            server_header = resp.headers.get("server", "")
    except Exception:
        pass

    osint_results = await asyncio.gather(
        lookup_ip(hostname),
        search_certificates(hostname),
        analyze_site(hostname),
        check_url_reputation(target),
        check_server_cves(server_header),
        return_exceptions=True,
    )

    for result in osint_results:
        if isinstance(result, list):
            findings.extend(result)

    await _progress("done", 11, len(findings), status="complete")

    return findings
