from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.security.connes_spectral_sentinel import connes_spectral_service

router = APIRouter(
    prefix="/api/security/connes-spectral-sentinel",
    tags=["Connes Noncommutative Geometry Spectral Triple Sentinel"],
)


class ClampConnesRequest(BaseModel):
    sector_id: str = Field(
        ..., description="Target Connes spectral triple sector identifier"
    )
    dirac_cutoff_rad: Optional[float] = Field(
        0.618, description="Dirac operator cutoff parameter in radians"
    )


@router.get("/posture")
async def get_connes_posture():
    return connes_spectral_service.get_posture()


@router.get("/sectors")
async def list_connes_sectors():
    return connes_spectral_service.list_sectors()


@router.post("/clamp-connes")
async def clamp_connes_sector(request: ClampConnesRequest):
    return connes_spectral_service.clamp_connes(
        sector_id=request.sector_id,
        dirac_cutoff_rad=request.dirac_cutoff_rad
        if request.dirac_cutoff_rad is not None
        else 0.618,
    )
