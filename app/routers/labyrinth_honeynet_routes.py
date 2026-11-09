"""
FastAPI Router for AI-Synthesized Autonomous Honeynet Labyrinths.
"""

from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.labyrinth_honeynet.labyrinth_honeynet_service import (
    labyrinth_honeynet_service,
)

router = APIRouter(
    prefix="/labyrinth-honeynet",
    tags=["AI-Synthesized Autonomous Honeynet Labyrinths"],
)


class CreateLabyrinthRequest(BaseModel):
    name: str = Field(..., description="Labyrinth designation name")
    architecture_type: Optional[str] = "FINANCIAL_CORE"
    depth_levels: Optional[int] = 5
    deception_persona: Optional[str] = "High-Value Enterprise Node"


class TrapAdversaryRequest(BaseModel):
    labyrinth_id: str
    adversary_ip: str
    probe_command: str
    protocol: Optional[str] = "SSH"


@router.get("/mazes")
@limiter.limit("60/minute")
async def list_labyrinths_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all active deceptive honeynet labyrinths."""
    return {"status": "success", "mazes": labyrinth_honeynet_service.list_labyrinths()}


@router.get("/mazes/{labyrinth_id}")
@limiter.limit("60/minute")
async def get_labyrinth_endpoint(
    request: Request,
    labyrinth_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves details of a specific honeynet labyrinth."""
    maze = labyrinth_honeynet_service.get_labyrinth(labyrinth_id)
    if not maze:
        raise HTTPException(status_code=404, detail="Labyrinth not found")
    return {"status": "success", "maze": maze}


@router.post("/create")
@limiter.limit("30/minute")
async def create_labyrinth_endpoint(
    request: Request,
    payload: CreateLabyrinthRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Synthesizes a new recursive enterprise deception labyrinth."""
    maze = labyrinth_honeynet_service.create_labyrinth(
        name=payload.name,
        architecture_type=payload.architecture_type or "FINANCIAL_CORE",
        depth_levels=payload.depth_levels or 5,
        deception_persona=payload.deception_persona or "High-Value Enterprise Node",
    )
    return {"status": "success", "maze": maze}


@router.post("/trap-adversary")
@limiter.limit("60/minute")
async def trap_adversary_endpoint(
    request: Request,
    payload: TrapAdversaryRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Executes state mirroring and injects adaptive latency to trap an adversary."""
    try:
        res = labyrinth_honeynet_service.trap_adversary_interaction(
            labyrinth_id=payload.labyrinth_id,
            adversary_ip=payload.adversary_ip,
            probe_command=payload.probe_command,
            protocol=payload.protocol or "SSH",
        )
        return {"status": "success", "trap": res}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/adversary/{adversary_ip}")
@limiter.limit("60/minute")
async def get_adversary_session_endpoint(
    request: Request,
    adversary_ip: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves telemetry, keystroke log, and dwell time for an adversary."""
    session = labyrinth_honeynet_service.get_adversary_session(adversary_ip)
    if not session:
        raise HTTPException(status_code=404, detail="Adversary session not found")
    return {"status": "success", "session": session}


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves honeynet engagement and adversary dwell time metrics."""
    return {
        "status": "success",
        "metrics": labyrinth_honeynet_service.get_labyrinth_metrics(),
    }
