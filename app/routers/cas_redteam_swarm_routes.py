"""
FastAPI Router for Multi-Agent Autonomous Red-Team Swarm (Continuous Adversary Simulation / CAS).
"""

from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.cas_redteam_swarm.cas_redteam_swarm_service import (
    cas_redteam_swarm_service,
)

router = APIRouter(
    prefix="/cas-redteam",
    tags=["Continuous Adversary Simulation (CAS) Swarm"],
)


class LaunchCampaignRequest(BaseModel):
    name: str = Field(..., description="Campaign name")
    target_scope: str = Field(..., description="Target domain, IP subnet, or cluster")
    scenario_type: Optional[str] = "CLOUD_INGRESS_AND_CONTAINER_ESCAPE"
    intensity: Optional[str] = "BALANCED"


class ExecuteRoundRequest(BaseModel):
    campaign_id: str


@router.get("/campaigns")
@limiter.limit("60/minute")
async def list_campaigns_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all active and historical red-team campaigns."""
    return {
        "status": "success",
        "campaigns": cas_redteam_swarm_service.list_campaigns(),
    }


@router.get("/campaigns/{campaign_id}")
@limiter.limit("60/minute")
async def get_campaign_endpoint(
    request: Request,
    campaign_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves details of a specific red-team campaign."""
    camp = cas_redteam_swarm_service.get_campaign(campaign_id)
    if not camp:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {"status": "success", "campaign": camp}


@router.post("/launch")
@limiter.limit("20/minute")
async def launch_campaign_endpoint(
    request: Request,
    payload: LaunchCampaignRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Launches an autonomous 4-agent red-team offensive simulation."""
    camp = cas_redteam_swarm_service.launch_campaign(
        name=payload.name,
        target_scope=payload.target_scope,
        scenario_type=payload.scenario_type or "CLOUD_INGRESS_AND_CONTAINER_ESCAPE",
        intensity=payload.intensity or "BALANCED",
    )
    return {"status": "success", "campaign": camp}


@router.post("/execute-round")
@limiter.limit("30/minute")
async def execute_round_endpoint(
    request: Request,
    payload: ExecuteRoundRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Executes a round across the 4 autonomous offensive agents."""
    try:
        res = cas_redteam_swarm_service.execute_swarm_round(payload.campaign_id)
        return {"status": "success", "result": res}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/mitre-matrix")
@limiter.limit("60/minute")
async def get_mitre_matrix_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves the MITRE ATT&CK coverage matrix."""
    return {
        "status": "success",
        "coverage": cas_redteam_swarm_service.get_mitre_coverage_matrix(),
    }


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves red team swarm performance metrics."""
    return {
        "status": "success",
        "metrics": cas_redteam_swarm_service.get_swarm_metrics(),
    }
