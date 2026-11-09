from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.services.cosmic_censorship_enforcer import cosmic_censorship_enforcer

router = APIRouter(
    prefix="/api/cosmic-censorship",
    tags=["Penrose Cosmic Censorship Spacetime Horizon Enforcer (Cap 94)"],
)


class EnforceCensorshipRequest(BaseModel):
    node_id: str = Field(..., description="Target spacetime curvature node ID")
    simulated_overspin_torque_pct: float = Field(default=2.5, ge=0.0, le=20.0, description="Overspin torque percentage")
    compensatory_damping_gain: float = Field(default=1.0, ge=0.1, le=10.0, description="Compensatory damping gain")


@router.get("/singularities")
async def get_singularities() -> List[Dict[str, Any]]:
    return cosmic_censorship_enforcer.list_nodes()


@router.post("/enforce-horizon")
async def enforce_horizon(req: EnforceCensorshipRequest) -> Dict[str, Any]:
    try:
        return cosmic_censorship_enforcer.enforce_cosmic_censorship(
            node_id=req.node_id,
            simulated_overspin_torque_pct=req.simulated_overspin_torque_pct,
            compensatory_damping_gain=req.compensatory_damping_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    return cosmic_censorship_enforcer.get_enforcer_metrics()

