"""
FastAPI router for Capability 180: Clifford Taubes Vortices & SW=Gr Equivalence Barrier.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.taubes_vortex_sw_barrier import get_taubes_vortex_sw_barrier_service

router = APIRouter(
    prefix="/api/taubes-vortex-sw",
    tags=["Taubes Vortex SW Barrier"],
)


class EquateSWGromovRequest(BaseModel):
    manifold_id: str = Field(..., description="ID of the symplectic 4-manifold")
    vortex_parameter_r: float = Field(
        default=1.0, ge=0.1, le=10.0, description="Taubes vortex scaling parameter r"
    )
    perturbation_eta: float = Field(
        default=0.01, ge=1e-4, le=1.0, description="Self-dual 2-form perturbation eta"
    )
    coupling_gain: float = Field(
        default=1.25, ge=0.5, le=3.0, description="Symplectic pseudoholomorphic coupling gain"
    )


@router.get("/manifolds")
async def list_symplectic_manifolds():
    """List registered symplectic 4-manifolds."""
    svc = get_taubes_vortex_sw_barrier_service()
    return {"manifolds": svc.get_manifolds()}


@router.post("/equate-sw-gromov")
async def equate_sw_gromov(request: EquateSWGromovRequest):
    """Equate Seiberg-Witten and Gromov invariants via vortex solutions."""
    svc = get_taubes_vortex_sw_barrier_service()
    try:
        return svc.equate_sw_gromov(
            manifold_id=request.manifold_id,
            vortex_parameter_r=request.vortex_parameter_r,
            perturbation_eta=request.perturbation_eta,
            coupling_gain=request.coupling_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_taubes_metrics():
    """Return operational metrics for Taubes vortex SW barrier."""
    svc = get_taubes_vortex_sw_barrier_service()
    return svc.get_metrics()
