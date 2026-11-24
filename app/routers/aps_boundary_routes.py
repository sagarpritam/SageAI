from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.security.aps_boundary_sentinel import aps_boundary_service

router = APIRouter(
    prefix="/api/security/aps-boundary-sentinel",
    tags=["Atiyah-Patodi-Singer Eta-Invariant Boundary Sentinel"],
)


class ClampBoundaryRequest(BaseModel):
    sector_id: str = Field(
        ..., description="Target APS boundary sentinel sector identifier"
    )
    spectral_cutoff_rad: Optional[float] = Field(
        0.31415, description="Spectral projection cutoff in radians"
    )


@router.get("/posture")
async def get_boundary_posture():
    return aps_boundary_service.get_posture()


@router.get("/sectors")
async def list_boundary_sectors():
    return aps_boundary_service.get_sectors()


@router.post("/clamp-boundary")
async def clamp_boundary_sector(request: ClampBoundaryRequest):
    return aps_boundary_service.clamp_boundary(
        sector_id=request.sector_id,
        spectral_cutoff_rad=request.spectral_cutoff_rad
        if request.spectral_cutoff_rad is not None
        else 0.31415,
    )
