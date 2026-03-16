
"""Intelligence Hub router."""

# ────────────────────── Standard library ──────────────────────
from typing import List

# ────────────────────── Third‑party ──────────────────────
from fastapi import APIRouter, Depends, HTTPException, status
import httpx

# ────────────────────── Local imports ──────────────────────
from app.schemas.intelligence import (
    IntelligenceSweepRequest,
    IntelligenceSweepResponse,
    LinkAnalysisResponse,
    ModuleListResponse,
    ModuleScanRequest,
    ModuleScanResponse,
)
from app.core.security import get_current_user

router = APIRouter()

# NOTE: The duplicate Pydantic model definitions that previously existed
# further down in this file have been removed.  The imported models from
# ``app.schemas.intelligence`` are now the single source of truth.


# ── Full Sweep ────────────────────────────────────


@router.post("/sweep")
async def run_intelligence_sweep(
    req: IntelligenceSweepRequest,
    user=Depends(get_current_user),
):
    """Run a full intelligence sweep across all OSINT modules.

    This is the 'Blacklight' — the full 9-module intelligence pipeline.
    """
    valid_types = ("domain", "ip", "email", "username", "phone")
    if req.target_type not in valid_types:
        raise HTTPException(
            status_code=400, detail=f"target_type must be one of: {valid_types}"
        )

    try:
        from app.services.intelligence import run_full_intelligence_sweep

        results = await run_full_intelligence_sweep(req.target, req.target_type)
        return {
            "status": "complete",
            "results": results,
        }
    except Exception as e:
        logger.error(f"Intelligence sweep failed: {e}")
        raise HTTPException(
            status_code=500, detail=f"Intelligence sweep failed: {str(e)}"
        )


# ── Individual Module Endpoints ───────────────────


@router.post("/shodan")
async def run_shodan_scan(req: ModuleScanRequest, user=Depends(get_current_user)):
    """01 // SHODAN: THE PANOPTICON — Device & infrastructure search."""
    from app.services.intelligence.shodan_intel import shodan_scan

    return {"module": "shodan", "findings": await shodan_scan(req.target)}


@router.post("/censys")
async def run_censys_scan(req: ModuleScanRequest, user=Depends(get_current_user)):
    """08 // CENSYS: THE GLOBAL RADAR — Server & certificate monitoring."""
    from app.services.intelligence.censys_intel import censys_scan

    return {"module": "censys", "findings": await censys_scan(req.target)}


@router.post("/intelx")
async def run_intelx_search(req: ModuleScanRequest, user=Depends(get_current_user)):
    """06 // INTEL X: THE ARCHIVE OF SECRETS — Breach & dark web archives."""
    from app.services.intelligence.intelx_intel import intelx_search

    return {"module": "intelx", "findings": await intelx_search(req.target)}


@router.post("/osint-industries")
async def run_osint_industries(req: ModuleScanRequest, user=Depends(get_current_user)):
    """09 // OSINT INDUSTRIES: THE INTERCEPTOR — Email/phone correlation."""
    from app.services.intelligence.osint_industries_intel import osint_industries_lookup

    return {
        "module": "osint_industries",
        "findings": await osint_industries_lookup(req.target, req.target_type),
    }


@router.post("/spiderfoot")
async def run_spiderfoot(req: ModuleScanRequest, user=Depends(get_current_user)):
    """04 // SPIDERFOOT: RECON AUTOMATION — Multi-source profiling."""
    from app.services.intelligence.spiderfoot_intel import spiderfoot_scan

    return {"module": "spiderfoot", "findings": await spiderfoot_scan(req.target)}


@router.post("/recon-ng")
async def run_recon_ng(req: ModuleScanRequest, user=Depends(get_current_user)):
    """07 // RECON-NG: THE FRAMEWORK — Modular recon."""
    from app.services.intelligence.recon_ng_intel import recon_ng_scan

    return {"module": "recon_ng", "findings": await recon_ng_scan(req.target)}


@router.post("/darkweb")
async def run_darkweb_search(req: ModuleScanRequest, user=Depends(get_current_user)):
    """03 // BABEL X: THE LINGUISTIC MESH — Dark web monitoring."""
    from app.services.intelligence.darkweb_intel import darkweb_search

    return {"module": "darkweb", "findings": await darkweb_search(req.target)}


@router.post("/identity")
async def run_identity_resolve(req: ModuleScanRequest, user=Depends(get_current_user)):
    """05 // SOCIAL LINKS: NEURAL DE-MASKING — Identity resolution."""
    from app.services.intelligence.identity_intel import identity_resolve

    return {
        "module": "identity",
        "findings": await identity_resolve(req.target, req.target_type),
    }


@router.post("/graph")
async def build_relationship_graph(
    req: ModuleScanRequest, user=Depends(get_current_user)
):
    """02 // MALTEGO: LINK ANALYSIS — Build entity relationship graph.

    Note: This requires running a full sweep first to collect data.
    """
    from app.services.intelligence import run_full_intelligence_sweep

    results = await run_full_intelligence_sweep(req.target, req.target_type)
    return {
        "module": "link_analysis",
        "graph": results.get("graph", {}),
        "meta": results.get("_meta", {}),
    }


# ── Status ────────────────────────────────────────


@router.get("/modules")
async def list_intelligence_modules(user=Depends(get_current_user)):
    """List all available intelligence modules and their status."""
    import os

    return {
        "modules": [
            {
                "id": "shodan",
                "name": "SHODAN: The Panopticon",
                "number": "01",
                "description": "Device & infrastructure search",
                "tier": "pro" if os.getenv("SHODAN_API_KEY") else "free",
                "available": True,
            },
            {
                "id": "maltego",
                "name": "MALTEGO: Link Analysis",
                "number": "02",
                "description": "Entity relationship visualization",
                "tier": "free",
                "available": True,
            },
            {
                "id": "darkweb",
                "name": "BABEL X: The Linguistic Mesh",
                "number": "03",
                "description": "Dark web monitoring & chatter decoding",
                "tier": "pro" if os.getenv("BABELX_API_KEY") else "free",
                "available": True,
            },
            {
                "id": "spiderfoot",
                "name": "SPIDERFOOT: Recon Automation",
                "number": "04",
                "description": "Automated multi-source OSINT profiling",
                "tier": "free",
                "available": True,
            },
            {
                "id": "identity",
                "name": "SOCIAL LINKS: Neural De-Masking",
                "number": "05",
                "description": "Identity resolution & behavioral tracking",
                "tier": "pro" if os.getenv("SOCIAL_LINKS_API_KEY") else "free",
                "available": True,
            },
            {
                "id": "intelx",
                "name": "INTEL X: The Archive of Secrets",
                "number": "06",
                "description": "Historical breaches & dark web archives",
                "tier": "pro" if os.getenv("INTELX_API_KEY") else "free",
                "available": True,
            },
            {
                "id": "recon_ng",
                "name": "RECON-NG: The Framework",
                "number": "07",
                "description": "Modular precision recon",
                "tier": "free",
                "available": True,
            },
            {
                "id": "censys",
                "name": "CENSYS: The Global Radar",
                "number": "08",
                "description": "Server & certificate monitoring",
                "tier": "pro" if os.getenv("CENSYS_API_ID") else "free",
                "available": True,
            },
            {
                "id": "osint_industries",
                "name": "OSINT INDUSTRIES: The Interceptor",
                "number": "09",
                "description": "Email/phone correlation across 1500+ platforms",
                "tier": "pro" if os.getenv("OSINT_INDUSTRIES_API_KEY") else "free",
                "available": True,
            },
        ]
    }
