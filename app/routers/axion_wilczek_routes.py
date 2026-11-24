from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.security.axion_wilczek_sentinel import axion_wilczek_service

router = APIRouter(
    prefix="/api/security/axion-wilczek-sentinel",
    tags=["Wilczek Axion Sentinel"],
)


class ClampAxionRequest(BaseModel):
    sector_id: str = Field(..., description="Target Wilczek Axion sector identifier")
    theta_angle_rad: Optional[float] = Field(
        3.1416, description="Axion vacuum theta angle in radians"
    )


@router.get("/posture")
async def get_axion_posture():
    return axion_wilczek_service.get_posture()


@router.get("/sectors")
async def list_axion_sectors():
    return axion_wilczek_service.list_sectors()


@router.post("/clamp-axion")
async def clamp_axion_sector(request: ClampAxionRequest):
    return axion_wilczek_service.clamp_axion(
        sector_id=request.sector_id,
        theta_angle_rad=request.theta_angle_rad
        if request.theta_angle_rad is not None
        else 3.1416,
    )
