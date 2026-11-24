from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.infrastructure.fukaya_category_bus import fukaya_category_service

router = APIRouter(
    prefix="/api/infrastructure/fukaya-category-bus",
    tags=["Fukaya Category A-Infinity Algebra Lagrangian Interconnect Bus"],
)


class ModulateFukayaRequest(BaseModel):
    channel_id: str = Field(
        ..., description="Target Fukaya Lagrangian channel identifier"
    )
    symplectic_flux_rad: Optional[float] = Field(
        1.6180, description="Symplectic flux perturbation in radians"
    )


@router.get("/telemetry")
async def get_fukaya_telemetry():
    return fukaya_category_service.get_telemetry()


@router.get("/channels")
async def list_fukaya_channels():
    return fukaya_category_service.list_channels()


@router.post("/modulate-fukaya")
async def modulate_fukaya_channel(request: ModulateFukayaRequest):
    return fukaya_category_service.modulate_fukaya(
        channel_id=request.channel_id,
        symplectic_flux_rad=request.symplectic_flux_rad
        if request.symplectic_flux_rad is not None
        else 1.6180,
    )
