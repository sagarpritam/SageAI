"""
FastAPI Router for AI-Powered Threat Hunting & Multi-SIEM Query Forge.
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.threat_hunting.threat_hunter import threat_hunter_service

router = APIRouter(prefix="/threat-hunting", tags=["AI Threat Hunting & Query Forge"])


class ForgeQueryRequest(BaseModel):
    hypothesis: str = Field(..., description="Natural language threat hunting hypothesis")


class ExecuteHuntRequest(BaseModel):
    hypothesis: str = Field(..., description="Hypothesis to guide the threat hunt")
    telemetry_events: List[Dict[str, Any]] = Field(..., description="Events to scan for adversarial patterns")


@router.get("/templates")
@limiter.limit("60/minute")
async def get_hunting_templates_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Returns pre-configured enterprise threat hunting hypotheses.
    """
    return {
        "status": "success",
        "templates": threat_hunter_service.get_hunt_templates(),
    }


@router.post("/forge-query")
@limiter.limit("60/minute")
async def forge_query_endpoint(
    request: Request,
    payload: ForgeQueryRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Translates natural-language hunting hypothesis into Sigma, KQL, SPL, and EQL queries.
    """
    try:
        queries = threat_hunter_service.forge_query(payload.hypothesis)
        return {
            "status": "success",
            "queries": queries,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/hunt")
@limiter.limit("30/minute")
async def execute_hunt_endpoint(
    request: Request,
    payload: ExecuteHuntRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Executes a threat hunting mission across provided telemetry events and generates findings.
    """
    user_id = str(current_user.get("sub", "Lead-Threat-Hunter"))
    org_id = str(current_user.get("org", "system"))

    try:
        results = threat_hunter_service.execute_hunt(
            hypothesis=payload.hypothesis,
            telemetry_events=payload.telemetry_events,
            actor=user_id,
            org_id=org_id,
        )
        return {
            "status": "success",
            "hunt_results": results,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

