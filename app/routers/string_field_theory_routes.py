"""
FastAPI Router for Capability 104: Open-Closed String Field Theory Vertex Integrator.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any

from app.services.string_field_theory.string_field_theory import get_string_field_theory_integrator

router = APIRouter(prefix="/api/string-field-theory", tags=["Capability 104: String Field Theory"])


class CondenseTachyonRequest(BaseModel):
    vertex_id: str = Field(..., description="ID of the string field theory vertex")
    coupling_g0: float = Field(default=0.45, ge=0.1, le=2.0, description="Open string coupling constant g_o")
    truncation_level: int = Field(default=8, ge=2, le=16, description="Level truncation approximation level L")
    damping_gain: float = Field(default=1.1, ge=0.8, le=2.5, description="Non-perturbative damping gain")


@router.get("/vertices")
async def list_vertices():
    """List all registered SFT vertices."""
    integrator = get_string_field_theory_integrator()
    return {"vertices": integrator.get_vertices()}


@router.post("/condense-tachyon")
async def condense_tachyon_route(request: CondenseTachyonRequest):
    """Integrate Witten cubic SFT action and trigger tachyon vacuum condensation."""
    integrator = get_string_field_theory_integrator()
    try:
        telemetry = integrator.condense_tachyon(
            vertex_id=request.vertex_id,
            coupling_g0=request.coupling_g0,
            truncation_level=request.truncation_level,
            damping_gain=request.damping_gain,
        )
        return telemetry
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_sft_metrics():
    """Retrieve aggregate string field theory metrics."""
    integrator = get_string_field_theory_integrator()
    return integrator.get_sft_metrics()
