"""
FastAPI Router for Capability 151: Lurie (infinity,n)-Category Bordism Hypothesis Firewall.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.infinity_topos_lurie_cobordism.infinity_topos_lurie_cobordism import (
    get_infinity_cobordism_firewall,
)

router = APIRouter(
    prefix="/api/infinity-topos-lurie-cobordism",
    tags=["Capability 151: Lurie (infinity,n)-Category Bordism Hypothesis"],
)


class SealCobordismRequest(BaseModel):
    cobordism_id: str = Field(
        ..., description="ID of the (infinity,n)-cobordism functor"
    )
    category_dimension_n: int = Field(
        default=3, ge=1, le=12, description="Higher category n-morphisms dimension"
    )
    dualizable_cells: int = Field(
        default=18, ge=4, le=128, description="Fully dualizable framed cell count"
    )
    stratified_seams: int = Field(
        default=14, ge=4, le=64, description="Stratified defect-seam gluing order"
    )
    cobordism_gain: float = Field(
        default=1.6,
        ge=0.85,
        le=2.5,
        description="Extended TQFT framing coherence gain",
    )


@router.get("/cobordisms")
async def list_cobordism_functors():
    """List registered (infinity,n)-category cobordism functors."""
    fw = get_infinity_cobordism_firewall()
    return {"cobordisms": fw.get_cobordisms()}


@router.post("/seal-cobordism")
async def seal_cobordism_functor_route(request: SealCobordismRequest):
    """Seal framed cobordism functor and verify full k-morphism dualizability."""
    fw = get_infinity_cobordism_firewall()
    try:
        return fw.seal_cobordism_functor(
            cobordism_id=request.cobordism_id,
            category_dimension_n=request.category_dimension_n,
            dualizable_cells=request.dualizable_cells,
            stratified_seams=request.stratified_seams,
            cobordism_gain=request.cobordism_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_cobordism_metrics():
    """Retrieve aggregate Lurie (infinity,n)-Category Cobordism Firewall metrics."""
    fw = get_infinity_cobordism_firewall()
    return fw.get_cobordism_metrics()
