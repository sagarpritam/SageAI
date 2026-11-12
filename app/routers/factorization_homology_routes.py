"""
FastAPI Router for Capability 140: Ayala-Francis Factorization Homology & E_n-Disk Algebra Manifold Firewall.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.factorization_homology_tft.factorization_homology_tft import (
    get_factorization_homology_firewall,
)

router = APIRouter(
    prefix="/api/factorization-homology-tft",
    tags=["Capability 140: Factorization Homology & E_n-Disk Firewall"],
)


class SealFactorizationRequest(BaseModel):
    manifold_id: str = Field(
        ..., description="ID of the factorization homology manifold"
    )
    operad_dimension: int = Field(
        default=3, ge=1, le=12, description="E_n little-disks operad dimension"
    )
    excision_strata_depth: int = Field(
        default=12, ge=4, le=128, description="Ayala-Francis excision collar depth"
    )
    koszul_duality_order: int = Field(
        default=6, ge=2, le=32, description="Koszul self-duality filtration order"
    )
    excision_gain: float = Field(
        default=1.6, ge=0.85, le=2.5, description="Manifold excision gluing gain"
    )


@router.get("/manifolds")
async def list_factorization_manifolds():
    """List registered factorization homology manifolds."""
    fw = get_factorization_homology_firewall()
    return {"manifolds": fw.get_manifolds()}


@router.post("/seal-manifold")
async def seal_factorization_manifold_route(request: SealFactorizationRequest):
    """Verify Ayala-Francis excision and seal E_n-disk algebra manifolds."""
    fw = get_factorization_homology_firewall()
    try:
        return fw.seal_factorization_manifold(
            manifold_id=request.manifold_id,
            operad_dimension=request.operad_dimension,
            excision_strata_depth=request.excision_strata_depth,
            koszul_duality_order=request.koszul_duality_order,
            excision_gain=request.excision_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_factorization_metrics():
    """Retrieve aggregate Factorization Homology Firewall metrics."""
    fw = get_factorization_homology_firewall()
    return fw.get_factorization_metrics()
