"""
FastAPI Router for Cyber Threat Intelligence (CTI) STIX 2.1 & TAXII 2.1 Hub.
"""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.cti.stix_taxii_service import cti_service

router = APIRouter(
    prefix="/cti", tags=["Cyber Threat Intelligence (CTI) STIX 2.1 & TAXII 2.1"]
)


class GenerateStixBundleRequest(BaseModel):
    actor_name: str = Field(
        ..., description="Threat actor name or alias (e.g. APT28, Scattered Spider)"
    )
    indicators: List[Dict[str, str]] = Field(
        ...,
        description="List of indicators ({type: 'sha256'|'ip'|'domain', value: '...'})",
    )
    campaign_name: Optional[str] = Field(
        "Enterprise Targeted Campaign 2026", description="Associated attack campaign"
    )


class ParseStixBundleRequest(BaseModel):
    bundle: Dict[str, Any] = Field(
        ..., description="External STIX 2.1 JSON bundle to parse"
    )


@router.get("/threat-actors")
@limiter.limit("60/minute")
async def get_threat_actors_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Returns threat actor profiles (APT28, Lazarus, Scattered Spider, LockBit 3.0).
    """
    return {
        "status": "success",
        "threat_actors": cti_service.get_threat_actors(),
    }


@router.post("/generate-bundle")
@limiter.limit("60/minute")
async def generate_bundle_endpoint(
    request: Request,
    payload: GenerateStixBundleRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Synthesizes an OASIS STIX 2.1 JSON bundle from threat actor attribution and indicators.
    """
    user_id = str(current_user.get("sub", "CTI-Officer"))
    org_id = str(current_user.get("org", "system"))

    try:
        result = cti_service.generate_stix_bundle(
            actor_name=payload.actor_name,
            indicators=payload.indicators,
            campaign_name=payload.campaign_name or "Enterprise Targeted Campaign 2026",
            actor=user_id,
            org_id=org_id,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/parse-stix")
@limiter.limit("60/minute")
async def parse_stix_endpoint(
    request: Request,
    payload: ParseStixBundleRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Parses and extracts indicators, actors, and relationships from an external STIX 2.1 bundle.
    """
    try:
        parsed = cti_service.parse_stix_bundle(payload.bundle)
        return {
            "status": "success",
            "parsed_stix": parsed,
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/taxii/collections")
@limiter.limit("60/minute")
async def get_taxii_collections_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Returns TAXII 2.1 Collection server metadata.
    """
    return cti_service.get_taxii_collections()
