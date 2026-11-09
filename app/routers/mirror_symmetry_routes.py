"""
FastAPI Router for Capability 105: Calabi-Yau Mirror Symmetry Hodge Diamond Inverter.
"""


from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.mirror_symmetry.mirror_symmetry import (
    get_calabi_yau_mirror_symmetry_inverter,
)

router = APIRouter(prefix="/api/mirror-symmetry", tags=["Capability 105: Calabi-Yau Mirror Symmetry"])


class InvertHodgeRequest(BaseModel):
    manifold_id: str = Field(..., description="ID of the Calabi-Yau mirror pair")
    complex_modulus_z: float = Field(default=0.05, ge=0.001, le=0.5, description="Complex structure modulus z")
    instanton_degree_max: int = Field(default=5, ge=1, le=10, description="Maximum Gromov-Witten curve degree d")
    duality_coupling_gain: float = Field(default=1.05, ge=0.8, le=2.5, description="Homological mirror coupling gain")


@router.get("/manifolds")
async def list_manifolds():
    """List all registered Calabi-Yau mirror pairs."""
    inverter = get_calabi_yau_mirror_symmetry_inverter()
    return {"manifolds": inverter.get_manifolds()}


@router.post("/invert-hodge")
async def invert_hodge_route(request: InvertHodgeRequest):
    """Execute mirror symmetry Hodge diamond inversion and evaluate Picard-Fuchs periods."""
    inverter = get_calabi_yau_mirror_symmetry_inverter()
    try:
        telemetry = inverter.invert_hodge_diamond(
            manifold_id=request.manifold_id,
            complex_modulus_z=request.complex_modulus_z,
            instanton_degree_max=request.instanton_degree_max,
            duality_coupling_gain=request.duality_coupling_gain,
        )
        return telemetry
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_mirror_metrics():
    """Retrieve aggregate mirror symmetry metrics."""
    inverter = get_calabi_yau_mirror_symmetry_inverter()
    return inverter.get_mirror_metrics()

