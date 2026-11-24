from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.security.aps_eta_sentinel import aps_eta_service

router = APIRouter(
    prefix="/api/security/aps-eta-sentinel",
    tags=["Atiyah-Patodi-Singer Eta-Invariant Spectral Flow Sentinel"],
)


class ClampApsRequest(BaseModel):
    sector_id: str = Field(..., description="Target APS spectral sector identifier")
    spectral_bias_rad: Optional[float] = Field(
        0.7071, description="Spectral asymmetry bias angle in radians"
    )


@router.get("/posture")
async def get_aps_posture():
    return aps_eta_service.get_posture()


@router.get("/sectors")
async def list_aps_sectors():
    return aps_eta_service.list_sectors()


@router.post("/clamp-aps")
async def clamp_aps_sector(request: ClampApsRequest):
    return aps_eta_service.clamp_aps(
        sector_id=request.sector_id,
        spectral_bias_rad=request.spectral_bias_rad
        if request.spectral_bias_rad is not None
        else 0.7071,
    )
