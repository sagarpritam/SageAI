from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.security.kontsevich_formality_sentinel import (
    kontsevich_formality_service,
)

router = APIRouter(
    prefix="/api/security/kontsevich-formality-sentinel",
    tags=["Kontsevich Formality L-Infinity Quantization Sentinel"],
)


class ClampKontsevichRequest(BaseModel):
    sector_id: str = Field(
        ..., description="Target Kontsevich formality sentinel sector identifier"
    )
    formality_cutoff_rad: Optional[float] = Field(
        0.31415, description="Kontsevich formality quantization cutoff in radians"
    )


@router.get("/posture")
async def get_kontsevich_posture():
    return kontsevich_formality_service.get_posture()


@router.get("/sectors")
async def list_kontsevich_sectors():
    return kontsevich_formality_service.get_sectors()


@router.post("/clamp-kontsevich")
async def clamp_kontsevich_sector(request: ClampKontsevichRequest):
    return kontsevich_formality_service.clamp_kontsevich(
        sector_id=request.sector_id,
        formality_cutoff_rad=request.formality_cutoff_rad
        if request.formality_cutoff_rad is not None
        else 0.31415,
    )
