from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.services.magneto_inertial_fusion import get_magneto_inertial_fusion

router = APIRouter(
    prefix="/api/magneto-inertial-fusion",
    tags=["Sovereign Directed Magneto-Inertial Fusion (MIF) Matrix (Option B)"],
)


class PulseFusionRequest(BaseModel):
    reactor_id: str = Field(..., description="Target MIF reactor platform ID")
    current_boost_ma: float = Field(default=2.0, ge=0.0, le=10.0, description="Driver current boost in Mega-Amperes")
    compression_gain: float = Field(default=1.0, ge=0.1, le=5.0, description="Plasma liner implosion compression gain")


@router.get("/reactors")
async def get_reactors() -> List[Dict[str, Any]]:
    mif = get_magneto_inertial_fusion()
    return mif.list_reactors()


@router.post("/pulse-fusion")
async def pulse_fusion(req: PulseFusionRequest) -> Dict[str, Any]:
    try:
        mif = get_magneto_inertial_fusion()
        return mif.pulse_fusion_reactor(
            reactor_id=req.reactor_id,
            current_boost_ma=req.current_boost_ma,
            compression_gain=req.compression_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    mif = get_magneto_inertial_fusion()
    return mif.get_fusion_metrics()

