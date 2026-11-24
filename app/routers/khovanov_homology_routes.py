from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.security.khovanov_homology_sentinel import khovanov_homology_service

router = APIRouter(
    prefix="/api/security/khovanov-homology-sentinel",
    tags=["Khovanov Homology Categorified Knot Invariant Sentinel"],
)


class ClampKhovanovRequest(BaseModel):
    sector_id: str = Field(
        ..., description="Target Khovanov categorified sector identifier"
    )
    crossing_mutation_rad: Optional[float] = Field(
        0.7854, description="Crossing mutation perturbation angle in radians"
    )


@router.get("/posture")
async def get_khovanov_posture():
    return khovanov_homology_service.get_posture()


@router.get("/sectors")
async def list_khovanov_sectors():
    return khovanov_homology_service.list_sectors()


@router.post("/clamp-khovanov")
async def clamp_khovanov_sector(request: ClampKhovanovRequest):
    return khovanov_homology_service.clamp_khovanov(
        sector_id=request.sector_id,
        crossing_mutation_rad=request.crossing_mutation_rad
        if request.crossing_mutation_rad is not None
        else 0.7854,
    )
