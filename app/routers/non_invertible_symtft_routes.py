"""
FastAPI Router for Capability 117: Non-Invertible Generalized Symmetry & SymTFT Firewall.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.non_invertible_symtft.non_invertible_symtft import (
    get_non_invertible_symtft_firewall,
)

router = APIRouter(
    prefix="/api/non-invertible-symtft",
    tags=["Capability 117: Non-Invertible Generalized Symmetry & SymTFT Firewall"],
)


class SealDefectRequest(BaseModel):
    sandwich_id: str = Field(
        ..., description="ID of the 3D/4D SymTFT fusion-category bulk sandwich"
    )
    higher_form_p: int = Field(
        default=1,
        ge=0,
        le=3,
        description="Generalized higher p-form global symmetry rank",
    )
    anyon_count: int = Field(
        default=6,
        ge=3,
        le=32,
        description="Simple object / anyon cardinality in Drinfeld center Z(C)",
    )
    pentagon_associator_gain: float = Field(
        default=1.4,
        ge=0.85,
        le=2.5,
        description="Pentagon F-symbol associator anomaly suppression gain",
    )


@router.get("/sandwiches")
async def list_sandwiches():
    """List all registered SymTFT fusion-category bulk sandwiches."""
    fw = get_non_invertible_symtft_firewall()
    return {"sandwiches": fw.get_sandwiches()}


@router.post("/seal-defect")
async def seal_defect_route(request: SealDefectRequest):
    """Condense SymTFT Lagrangian algebra L and seal topological defects."""
    fw = get_non_invertible_symtft_firewall()
    try:
        return fw.seal_topological_defect(
            sandwich_id=request.sandwich_id,
            higher_form_p=request.higher_form_p,
            anyon_count=request.anyon_count,
            pentagon_associator_gain=request.pentagon_associator_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_symtft_metrics():
    """Retrieve aggregate Non-Invertible SymTFT Firewall metrics."""
    fw = get_non_invertible_symtft_firewall()
    return fw.get_symtft_metrics()
