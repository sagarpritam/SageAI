"""
FastAPI Router for Autonomous Multi-Agent Threat Hunting Swarm.
"""

from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.threat_hunting_swarm.hunting_swarm_service import (
    threat_hunting_swarm_service,
)

router = APIRouter(
    prefix="/threat-hunting-swarm",
    tags=["Threat Hunting Swarm"],
)


class LaunchHuntRequest(BaseModel):
    hunt_topic: Optional[str] = Field(
        None, description="Topic or technique name to hunt"
    )
    hypothesis_focus: Optional[str] = Field(
        None, description="Custom hypothesis or Sigma rule focus"
    )


class ExecuteHuntActionRequest(BaseModel):
    hunt_id: str
    action: str


@router.get("/hunts")
@limiter.limit("60/minute")
async def list_hunts_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Lists all active and completed threat hunts."""
    return {
        "status": "success",
        "hunts": threat_hunting_swarm_service.list_active_hunts(),
    }


@router.post("/launch")
@limiter.limit("30/minute")
async def launch_hunt_endpoint(
    request: Request,
    payload: LaunchHuntRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Launches an autonomous multi-agent threat hunt swarm."""
    return threat_hunting_swarm_service.launch_hunt(
        hunt_topic=payload.hunt_topic,
        hypothesis_focus=payload.hypothesis_focus,
        operator=current_user.get("email", "SecOpsHunter"),
    )


@router.post("/action")
@limiter.limit("30/minute")
async def execute_hunt_action_endpoint(
    request: Request,
    payload: ExecuteHuntActionRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Executes Arbiter containment action for a detected threat hunt finding."""
    try:
        return threat_hunting_swarm_service.execute_hunt_containment(
            hunt_id=payload.hunt_id,
            action=payload.action,
            operator=current_user.get("email", "SecOpsDirector"),
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
