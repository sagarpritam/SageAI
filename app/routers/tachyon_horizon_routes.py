from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.services.tachyon_horizon_sentinel import tachyon_horizon_sentinel

router = APIRouter(
    prefix="/api/tachyon-horizon",
    tags=["High-Energy Tachyon Field Cerenkov Horizon Sentinel (Cap 81)"],
)


class SamplePrecausalHorizonRequest(BaseModel):
    sentinel_id: str = Field(..., example="TACHYON-SENTINEL-NORTH-POLE-01")
    target_threat_type: str = Field(default="PROMPT_NUCLEAR_FLASH", example="PROMPT_NUCLEAR_FLASH")
    simulated_apparent_velocity_c: float = Field(default=1.45, ge=1.01, le=10.0)


@router.get("/sentinels")
async def get_sentinels() -> List[Dict[str, Any]]:
    return tachyon_horizon_sentinel.list_sentinels()


@router.post("/sample-horizon")
async def sample_horizon(req: SamplePrecausalHorizonRequest) -> Dict[str, Any]:
    try:
        return tachyon_horizon_sentinel.sample_precausal_horizon(
            sentinel_id=req.sentinel_id,
            target_threat_type=req.target_threat_type,
            simulated_apparent_velocity_c=req.simulated_apparent_velocity_c,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    return tachyon_horizon_sentinel.get_sentinel_metrics()

