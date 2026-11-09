from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.randall_sundrum_stabilizer import randall_sundrum_stabilizer

router = APIRouter(
    prefix="/api/randall-sundrum",
    tags=["5D Warped Spacetime Randall-Sundrum Brane Metric Stabilizer (Cap 93)"],
)


class StabilizeRadionRequest(BaseModel):
    brane_id: str = Field(..., description="Target RS Brane ID")
    target_rc_planck: float = Field(
        default=36.8,
        ge=10.0,
        le=100.0,
        description="Compactification radius in Planck lengths",
    )
    scalar_flux_boost: float = Field(
        default=1.0,
        ge=0.1,
        le=10.0,
        description="Goldberger-Wise scalar flux boost factor",
    )


@router.get("/branes")
async def get_branes() -> List[Dict[str, Any]]:
    return randall_sundrum_stabilizer.list_branes()


@router.post("/stabilize-radion")
async def stabilize_radion(req: StabilizeRadionRequest) -> Dict[str, Any]:
    try:
        return randall_sundrum_stabilizer.stabilize_radion_modulus(
            brane_id=req.brane_id,
            target_rc_planck=req.target_rc_planck,
            scalar_flux_boost=req.scalar_flux_boost,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    return randall_sundrum_stabilizer.get_stabilizer_metrics()
