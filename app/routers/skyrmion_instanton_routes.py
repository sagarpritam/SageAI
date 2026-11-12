"""
FastAPI Router for Capability 133: Topological Skyrmion-Instanton BPST Lattice & Theta-Vacuum Shield.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.skyrmion_instanton_qcd.skyrmion_instanton_qcd import (
    get_skyrmion_instanton_shield,
)

router = APIRouter(
    prefix="/api/skyrmion-instanton-qcd",
    tags=["Capability 133: Skyrmion-Instanton BPST Lattice & Theta-Vacuum Shield"],
)


class ClampInstantonRequest(BaseModel):
    lattice_id: str = Field(..., description="ID of the Skyrmion-Instanton lattice")
    winding_q: int = Field(
        default=1, ge=1, le=32, description="Pontryagin topological winding number Q"
    )
    instanton_size_rho: float = Field(
        default=0.35,
        ge=0.05,
        le=2.5,
        description="BPST instanton core scale size rho (fm)",
    )
    gauge_coupling: float = Field(
        default=1.25, ge=0.4, le=5.0, description="Non-abelian Yang-Mills coupling g"
    )
    theta_clamp_gain: float = Field(
        default=1.55,
        ge=0.85,
        le=2.5,
        description="Theta-vacuum CP-violation clamp gain",
    )


@router.get("/lattices")
async def list_lattices():
    """List registered BPST instanton and Skyrmion lattices."""
    shield = get_skyrmion_instanton_shield()
    return {"lattices": shield.get_lattices()}


@router.post("/clamp-instanton")
async def clamp_instanton_route(request: ClampInstantonRequest):
    """Evaluate Pontryagin action and stabilize theta-vacuum topology."""
    shield = get_skyrmion_instanton_shield()
    try:
        return shield.clamp_instanton_tunneling(
            lattice_id=request.lattice_id,
            winding_q=request.winding_q,
            instanton_size_rho=request.instanton_size_rho,
            gauge_coupling=request.gauge_coupling,
            theta_clamp_gain=request.theta_clamp_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_skyrmion_metrics():
    """Retrieve aggregate Skyrmion-Instanton BPST shield telemetry."""
    shield = get_skyrmion_instanton_shield()
    return shield.get_skyrmion_metrics()
