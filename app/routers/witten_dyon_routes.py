from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.security.witten_dyon_sentinel import witten_dyon_sentinel

router = APIRouter(
    prefix="/api/security/witten-dyon-sentinel", tags=["Witten Dyon Sentinel"]
)


class ClampDyonRequest(BaseModel):
    sector_id: Optional[str] = "WITTEN-DYON-POLARIZATION-ALPHA"
    axion_angle_rad: Optional[float] = 3.14159


@router.get("/posture")
async def get_posture():
    return witten_dyon_sentinel.get_posture()


@router.get("/sectors")
async def get_sectors():
    return witten_dyon_sentinel.get_sectors()


@router.post("/clamp-dyon")
async def clamp_dyon(req: ClampDyonRequest):
    return witten_dyon_sentinel.clamp_dyon(
        sector_id=req.sector_id, axion_angle_rad=req.axion_angle_rad
    )
