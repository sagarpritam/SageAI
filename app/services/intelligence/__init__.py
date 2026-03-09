"""SageAI Intelligence Service — Advanced OSINT Modules.

This package provides 9 intelligence-gathering capabilities using
free / open-source tools (with plug-and-play support for premium API keys).

Modules
-------
shodan_intel      – Enhanced Shodan InternetDB (The Panopticon)
censys_intel      – Certificate & host transparency (The Global Radar)
intelx_intel      – Breach & dark web archive search (The Archive of Secrets)
osint_industries  – Email / phone correlation (The Interceptor)
spiderfoot_intel  – Automated OSINT profiling (Recon Automation)
recon_ng_intel    – Modular recon framework (The Framework)
darkweb_intel     – Dark web monitoring (The Linguistic Mesh)
identity_intel    – Username / identity resolution (Neural De-Masking)
link_analysis     – Entity relationship graphing (Link Analysis / Maltego-style)
"""

import logging

logger = logging.getLogger("sageai.intelligence")


async def run_full_intelligence_sweep(target: str, target_type: str = "domain") -> dict:
    """Run all available intelligence modules against a target.

    Parameters
    ----------
    target : str
        Domain, IP, email, username, or phone number.
    target_type : str
        One of: domain, ip, email, username, phone.

    Returns
    -------
    dict with keys per module containing their findings list.
    """
    import asyncio
    from app.services.intelligence.shodan_intel import shodan_scan
    from app.services.intelligence.censys_intel import censys_scan
    from app.services.intelligence.intelx_intel import intelx_search
    from app.services.intelligence.osint_industries_intel import osint_industries_lookup
    from app.services.intelligence.spiderfoot_intel import spiderfoot_scan
    from app.services.intelligence.recon_ng_intel import recon_ng_scan
    from app.services.intelligence.darkweb_intel import darkweb_search
    from app.services.intelligence.identity_intel import identity_resolve
    from app.services.intelligence.link_analysis import build_link_graph

    results = {}

    # Domain / IP scans
    if target_type in ("domain", "ip"):
        domain_results = await asyncio.gather(
            shodan_scan(target),
            censys_scan(target),
            recon_ng_scan(target),
            spiderfoot_scan(target),
            return_exceptions=True,
        )
        results["shodan"] = domain_results[0] if isinstance(domain_results[0], list) else []
        results["censys"] = domain_results[1] if isinstance(domain_results[1], list) else []
        results["recon_ng"] = domain_results[2] if isinstance(domain_results[2], list) else []
        results["spiderfoot"] = domain_results[3] if isinstance(domain_results[3], list) else []

    # Email / phone lookups
    if target_type in ("email", "phone"):
        results["osint_industries"] = await osint_industries_lookup(target, target_type)

    # Breach / dark web search (works for domain, email, username)
    if target_type in ("domain", "email", "username"):
        breach_results = await asyncio.gather(
            intelx_search(target),
            darkweb_search(target),
            return_exceptions=True,
        )
        results["intelx"] = breach_results[0] if isinstance(breach_results[0], list) else []
        results["darkweb"] = breach_results[1] if isinstance(breach_results[1], list) else []

    # Username identity resolution
    if target_type in ("username", "email"):
        results["identity"] = await identity_resolve(target, target_type)

    # Build the relationship graph from all collected data
    results["graph"] = build_link_graph(target, target_type, results)

    # Stats
    total_findings = sum(len(v) for v in results.values() if isinstance(v, list))
    results["_meta"] = {
        "target": target,
        "target_type": target_type,
        "total_findings": total_findings,
        "modules_run": [k for k in results if k != "_meta"],
    }

    logger.info(f"Intelligence sweep complete for {target} ({target_type}): {total_findings} findings")
    return results
