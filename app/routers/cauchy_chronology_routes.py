from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.services.cauchy_chronology_protector import cauchy_chronology_protector

router = APIRouter(
    prefix="/api/cauchy-chronology",
    tags=["Cauchy Horizon Quantum Chronology Protector (Cap 88)"],
)


class ClampChronologyRequest(BaseModel):
    horizon_id: str = Field(..., description="Target Cauchy horizon ID")
    simulated_blueshift_factor: float = Field(default=1.0e12, ge=1.0, le=1.0e18, description="Simulated blueshift factor")


@router.get("/horizons")
async def get_horizons() -> List[Dict[str, Any]]:
    return cauchy_chronology_protector.list_horizons()


@router.post("/clamp-ctc")
async def clamp_ctc(req: ClampChronologyRequest) -> Dict[str, Any]:
    try:
        return cauchy_chronology_protector.clamp_cauchy_chronology_violation(
            horizon_id=req.horizon_id,
            simulated_blueshift_factor=req.simulated_blueshift_factor,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    return cauchy_chronology_protector.get_chronology_metrics()
