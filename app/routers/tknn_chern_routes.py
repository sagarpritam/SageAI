from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.security.tknn_chern_sentinel import tknn_chern_service

router = APIRouter(
    prefix="/api/security/tknn-chern-sentinel",
    tags=["TKNN Chern Sentinel"],
)


class ClampChernRequest(BaseModel):
    sector_id: str = Field(..., description="Target TKNN Chern sector identifier")
    chern_flux_rad: Optional[float] = Field(1.5708, description="Chern flux in radians")


@router.get("/posture")
async def get_chern_posture():
    return tknn_chern_service.get_posture()


@router.get("/sectors")
async def list_chern_sectors():
    return tknn_chern_service.list_sectors()


@router.post("/clamp-chern")
async def clamp_chern_sector(request: ClampChernRequest):
    return tknn_chern_service.clamp_chern(
        sector_id=request.sector_id,
        chern_flux_rad=request.chern_flux_rad
        if request.chern_flux_rad is not None
        else 1.5708,
    )
