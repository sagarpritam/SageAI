"""
FastAPI Router for Capability 165: Derived Azumaya Brauer-Grothendieck Shield & Non-Commutative Motives.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.azumaya_brauer_shield.azumaya_brauer_shield import (
    get_azumaya_brauer_shield_service,
)

router = APIRouter(
    prefix="/api/azumaya-brauer-shield",
    tags=["Capability 165: Derived Azumaya Brauer Shield"],
)


class SealBrauerRequest(BaseModel):
    algebra_id: str = Field(..., description="ID of the derived Azumaya algebra")
    torsion_order_n: int = Field(
        default=4, ge=1, le=64, description="Torsion order in Brauer-Grothendieck group"
    )
    periodic_cyclic_degree: int = Field(
        default=2, ge=0, le=16, description="Periodic cyclic cohomology HP_* degree"
    )
    morita_equivalence_depth: int = Field(
        default=8, ge=1, le=32, description="Derived Morita equivalence category depth"
    )
    brauer_amplification: float = Field(
        default=1.0,
        ge=0.5,
        le=3.0,
        description="Non-commutative representation barrier multiplier",
    )


@router.get("/algebras")
async def list_azumaya_algebras():
    """List registered derived Azumaya algebras."""
    svc = get_azumaya_brauer_shield_service()
    return {"algebras": svc.get_algebras()}


@router.post("/seal-brauer")
async def seal_azumaya_brauer(request: SealBrauerRequest):
    """Seal derived Azumaya algebra and evaluate Brauer-Grothendieck non-commutative barrier."""
    svc = get_azumaya_brauer_shield_service()
    try:
        return svc.seal_brauer(
            algebra_id=request.algebra_id,
            torsion_order_n=request.torsion_order_n,
            periodic_cyclic_degree=request.periodic_cyclic_degree,
            morita_equivalence_depth=request.morita_equivalence_depth,
            brauer_amplification=request.brauer_amplification,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_azumaya_brauer_metrics():
    """Return aggregate telemetry metrics for Azumaya Brauer shield."""
    svc = get_azumaya_brauer_shield_service()
    return svc.get_metrics()
