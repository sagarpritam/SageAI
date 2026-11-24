from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.security.chiral_abj_sentinel import chiral_abj_sentinel

router = APIRouter(
    prefix="/api/security/chiral-abj-sentinel", tags=["Chiral ABJ Sentinel"]
)


class ClampAnomalyRequest(BaseModel):
    sector_id: Optional[str] = "ABJ-SPECTRAL-FLOW-ALPHA"
    spectral_flow_cycles: Optional[int] = 1000


@router.get("/posture")
async def get_posture():
    return chiral_abj_sentinel.get_posture()


@router.get("/sectors")
async def get_sectors():
    return chiral_abj_sentinel.get_sectors()


@router.post("/clamp-anomaly")
async def clamp_anomaly(req: ClampAnomalyRequest):
    return chiral_abj_sentinel.clamp_anomaly(
        sector_id=req.sector_id, spectral_flow_cycles=req.spectral_flow_cycles
    )
