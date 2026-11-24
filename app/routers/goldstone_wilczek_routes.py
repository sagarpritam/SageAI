from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.security.goldstone_wilczek_sentinel import (
    goldstone_wilczek_service,
)

router = APIRouter(
    prefix="/api/security/goldstone-wilczek-sentinel",
    tags=["Goldstone-Wilczek Fractional Baryon Sentinel"],
)


class ClampBaryonRequest(BaseModel):
    sector_id: str = Field(
        ..., description="Target Goldstone-Wilczek baryon sector identifier"
    )
    chiral_angle_rad: Optional[float] = Field(
        1.5708, description="Chiral angle theta in radians"
    )


@router.get("/posture")
async def get_baryon_posture():
    return goldstone_wilczek_service.get_posture()


@router.get("/sectors")
async def list_baryon_sectors():
    return goldstone_wilczek_service.list_sectors()


@router.post("/clamp-baryon")
async def clamp_baryon_sector(request: ClampBaryonRequest):
    return goldstone_wilczek_service.clamp_baryon(
        sector_id=request.sector_id,
        chiral_angle_rad=request.chiral_angle_rad
        if request.chiral_angle_rad is not None
        else 1.5708,
    )
