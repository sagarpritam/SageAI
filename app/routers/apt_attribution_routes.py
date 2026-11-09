"""
FastAPI Router for CTI Graph Fusion & APT Actor Attribution Engine.
"""

from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.apt_attribution.apt_attribution_service import apt_attribution_service

router = APIRouter(
    prefix="/apt-attribution",
    tags=["CTI Graph Fusion & APT Actor Attribution"],
)


class AnalyzeIOCRequest(BaseModel):
    indicator: str = Field(..., description="IP, Domain, or Hash to attribute")
    indicator_type: Optional[str] = "IPV4"
    ja4_fingerprint: Optional[str] = None


class IngestSTIXRequest(BaseModel):
    bundle: Dict[str, Any]


@router.get("/actors")
@limiter.limit("60/minute")
async def list_actors_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all tracked nation-state APT actors."""
    return {"status": "success", "actors": apt_attribution_service.list_actors()}


@router.get("/actors/{actor_id}")
@limiter.limit("60/minute")
async def get_actor_endpoint(
    request: Request,
    actor_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves profile and Diamond Model parameters for an APT actor."""
    actor = apt_attribution_service.get_actor_profile(actor_id)
    if not actor:
        raise HTTPException(status_code=404, detail="Actor not found")
    return {"status": "success", "actor": actor}


@router.post("/analyze-ioc")
@limiter.limit("30/minute")
async def analyze_ioc_endpoint(
    request: Request,
    payload: AnalyzeIOCRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Analyzes an IOC with Diamond Model correlation and JA4 TLS fingerprinting."""
    res = apt_attribution_service.analyze_ioc_attribution(
        indicator=payload.indicator,
        indicator_type=payload.indicator_type or "IPV4",
        ja4_fingerprint=payload.ja4_fingerprint,
    )
    return {"status": "success", "attribution": res}


@router.post("/ingest-stix")
@limiter.limit("20/minute")
async def ingest_stix_endpoint(
    request: Request,
    payload: IngestSTIXRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Ingests a STIX 2.1 JSON bundle into the knowledge graph."""
    res = apt_attribution_service.ingest_stix_bundle(payload.bundle)
    return {"status": "success", "result": res}


@router.get("/graph")
@limiter.limit("60/minute")
async def get_graph_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves STIX 2.1 knowledge graph nodes and edges for visualization."""
    return {
        "status": "success",
        "graph": apt_attribution_service.get_attribution_graph(),
    }


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves threat attribution engine metrics."""
    return {
        "status": "success",
        "metrics": apt_attribution_service.get_fusion_metrics(),
    }
