"""
FastAPI Router for Capability 157: Beilinson-Drinfeld Grassmannian & Chiral Homology Shield.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.beilinson_drinfeld_chiral.beilinson_drinfeld_chiral import (
    get_beilinson_drinfeld_chiral_shield,
)

router = APIRouter(
    prefix="/api/beilinson-drinfeld-chiral",
    tags=["Capability 157: Beilinson-Drinfeld Chiral Shield"],
)


class SealBeilinsonDrinfeldRequest(BaseModel):
    algebra_id: str = Field(
        ..., description="ID of the Beilinson-Drinfeld chiral algebra configuration"
    )
    algebra_level_k: int = Field(
        default=4, ge=1, le=16, description="Affine Kac-Moody central level k"
    )
    curve_points_n: int = Field(
        default=4,
        ge=2,
        le=32,
        description="Factorization curve marked coalescing points",
    )
    factorization_depth: int = Field(
        default=6, ge=2, le=32, description="Chiral OPE factorization filtration depth"
    )
    chiral_gain: float = Field(
        default=1.6,
        ge=0.85,
        le=2.5,
        description="KZ conformal block flat connection gain multiplier",
    )


@router.get("/algebras")
async def list_chiral_algebras():
    """List registered Beilinson-Drinfeld chiral algebra configurations."""
    sh = get_beilinson_drinfeld_chiral_shield()
    return {"algebras": sh.get_algebras()}


@router.post("/seal-chiral")
async def seal_chiral_route(request: SealBeilinsonDrinfeldRequest):
    """Seal chiral OPE factorization and lock KZ conformal block monodromy."""
    sh = get_beilinson_drinfeld_chiral_shield()
    try:
        return sh.seal_beilinson_drinfeld(
            algebra_id=request.algebra_id,
            algebra_level_k=request.algebra_level_k,
            curve_points_n=request.curve_points_n,
            factorization_depth=request.factorization_depth,
            chiral_gain=request.chiral_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_chiral_metrics_route():
    """Return aggregate Beilinson-Drinfeld Chiral Shield telemetry."""
    sh = get_beilinson_drinfeld_chiral_shield()
    return sh.get_chiral_metrics()
