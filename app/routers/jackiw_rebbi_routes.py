from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.security.jackiw_rebbi_sentinel import jackiw_rebbi_service

router = APIRouter(
    prefix="/api/security/jackiw-rebbi-sentinel",
    tags=["Jackiw-Rebbi Soliton Sentinel"],
)


class ClampSolitonRequest(BaseModel):
    sector_id: str = Field(
        ..., description="Target Jackiw-Rebbi soliton sector identifier"
    )
    soliton_displacement_nm: Optional[float] = Field(
        0.05, description="Domain wall soliton center displacement in nanometers"
    )


@router.get("/posture")
async def get_soliton_posture():
    return jackiw_rebbi_service.get_posture()


@router.get("/sectors")
async def list_soliton_sectors():
    return jackiw_rebbi_service.list_sectors()


@router.post("/clamp-soliton")
async def clamp_soliton_domain(request: ClampSolitonRequest):
    return jackiw_rebbi_service.clamp_soliton(
        sector_id=request.sector_id,
        soliton_displacement_nm=request.soliton_displacement_nm
        if request.soliton_displacement_nm is not None
        else 0.05,
    )
