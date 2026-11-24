"""
FastAPI Router for Capability 159: Heegaard Floer Homology & Bordered Contact Firewall.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.heegaard_floer_bordered.heegaard_floer_bordered import (
    get_heegaard_floer_bordered_firewall,
)

router = APIRouter(
    prefix="/api/heegaard-floer-bordered",
    tags=["Capability 159: Heegaard Floer Bordered Firewall"],
)


class SealHeegaardFloerRequest(BaseModel):
    diagram_id: str = Field(..., description="ID of the multi-pointed Heegaard diagram")
    grid_rank: int = Field(
        default=4, ge=1, le=16, description="Spin^c Heegaard toroidal grid rank"
    )
    contact_depth: int = Field(
        default=12,
        ge=2,
        le=64,
        description="Giroux contact structure boundary depth",
    )
    bordered_algebra_dim: int = Field(
        default=6,
        ge=2,
        le=32,
        description="Lipshitz-Ozsvath-Thurston bordered Floer algebra dimension",
    )
    hf_gain: float = Field(
        default=1.6,
        ge=0.85,
        le=2.5,
        description="Bordered Floer differential coherence gain multiplier",
    )


@router.get("/diagrams")
async def list_heegaard_diagrams():
    """List registered Heegaard Floer diagrams."""
    hf = get_heegaard_floer_bordered_firewall()
    return {"diagrams": hf.get_diagrams()}


@router.post("/seal-hf")
async def seal_heegaard_floer_route(request: SealHeegaardFloerRequest):
    """Evaluate Ozsvath-Szabo differential boundaries and lock bordered Floer algebras."""
    hf = get_heegaard_floer_bordered_firewall()
    try:
        return hf.seal_heegaard_floer(
            diagram_id=request.diagram_id,
            grid_rank=request.grid_rank,
            contact_depth=request.contact_depth,
            bordered_algebra_dim=request.bordered_algebra_dim,
            hf_gain=request.hf_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_hf_metrics_route():
    """Return aggregate Heegaard Floer Bordered Firewall telemetry."""
    hf = get_heegaard_floer_bordered_firewall()
    return hf.get_hf_metrics()
