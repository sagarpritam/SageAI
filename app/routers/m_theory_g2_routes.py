"""
FastAPI Router for Capability 107: 11D M-Theory G2-Manifold Supergravity Compactifier.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.m_theory_g2.m_theory_g2 import get_m_theory_g2_compactifier

router = APIRouter(
    prefix="/api/m-theory-g2",
    tags=["Capability 107: 11D M-Theory G2 Compactifier"],
)


class CompactifyFluxRequest(BaseModel):
    manifold_id: str = Field(
        ..., description="ID of the 7D G2 compactification manifold"
    )
    eleven_d_radius_planck: float = Field(
        default=18.5,
        ge=8.0,
        le=40.0,
        description="11D compactification radius in Planck lengths",
    )
    flux_quantum_g4: int = Field(
        default=4,
        ge=1,
        le=16,
        description="Quantized 4-form G_4 flux integer",
    )
    torsion_damping_gain: float = Field(
        default=1.15,
        ge=0.8,
        le=2.5,
        description="Joyce torsion-free damping gain",
    )


@router.get("/manifolds")
async def list_manifolds():
    """List all registered 7D G2 compactification manifolds."""
    compactifier = get_m_theory_g2_compactifier()
    return {"manifolds": compactifier.get_manifolds()}


@router.post("/compactify-flux")
async def compactify_flux_route(request: CompactifyFluxRequest):
    """Compactify 11D supergravity on X_7 and stabilize G_4 flux moduli."""
    compactifier = get_m_theory_g2_compactifier()
    try:
        return compactifier.compactify_flux(
            manifold_id=request.manifold_id,
            eleven_d_radius_planck=request.eleven_d_radius_planck,
            flux_quantum_g4=request.flux_quantum_g4,
            torsion_damping_gain=request.torsion_damping_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_mtheory_metrics():
    """Retrieve aggregate 11D M-Theory G2 compactifier metrics."""
    compactifier = get_m_theory_g2_compactifier()
    return compactifier.get_mtheory_metrics()
