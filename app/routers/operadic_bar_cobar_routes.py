"""
FastAPI Router for Capability 148: Koszul Operadic Bar-Cobar Duality & Formality Firewall.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.operadic_bv_bar_cobar.operadic_bv_bar_cobar import (
    get_operadic_bar_cobar_firewall,
)

router = APIRouter(
    prefix="/api/operadic-bv-bar-cobar",
    tags=["Capability 148: Koszul Operadic Bar-Cobar & Formality Firewall"],
)


class SealOperadRequest(BaseModel):
    operad_id: str = Field(..., description="ID of the Koszul operadic complex")
    operad_arity: int = Field(
        default=4, ge=2, le=16, description="Primary quadratic operad arity"
    )
    graph_complex_loops: int = Field(
        default=12, ge=4, le=128, description="Kontsevich admissible formality loops"
    )
    homotopy_transfer_order: int = Field(
        default=10, ge=4, le=64, description="Kadeishvili homotopy transfer order"
    )
    operadic_gain: float = Field(
        default=1.6, ge=0.85, le=2.5, description="Bar-cobar quasi-isomorphism gain"
    )


@router.get("/operads")
async def list_koszul_operads():
    """List registered Koszul operadic bar-cobar complexes."""
    fw = get_operadic_bar_cobar_firewall()
    return {"operads": fw.get_operads()}


@router.post("/seal-operad")
async def seal_operadic_formality_route(request: SealOperadRequest):
    """Seal bar-cobar quasi-isomorphism and lock Kontsevich L_infinity weights."""
    fw = get_operadic_bar_cobar_firewall()
    try:
        return fw.seal_operadic_formality(
            operad_id=request.operad_id,
            operad_arity=request.operad_arity,
            graph_complex_loops=request.graph_complex_loops,
            homotopy_transfer_order=request.homotopy_transfer_order,
            operadic_gain=request.operadic_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_operad_metrics():
    """Retrieve aggregate Koszul Operadic Bar-Cobar & Formality Firewall metrics."""
    fw = get_operadic_bar_cobar_firewall()
    return fw.get_operad_metrics()
