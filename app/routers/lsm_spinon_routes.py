from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.infrastructure.lsm_spinon_bus import lsm_spinon_service

router = APIRouter(
    prefix="/api/infrastructure/lsm-spinon-bus",
    tags=["LSM Spinon Interconnect Bus"],
)


class ModulateSpinonRequest(BaseModel):
    channel_id: str = Field(..., description="Target LSM spinon channel identifier")
    spinon_momentum_k_rad: Optional[float] = Field(
        1.5708, description="Spinon excitation momentum in radians"
    )


@router.get("/telemetry")
async def get_spinon_telemetry():
    return lsm_spinon_service.get_telemetry()


@router.get("/channels")
async def list_spinon_channels():
    return lsm_spinon_service.list_channels()


@router.post("/modulate-spinon")
async def modulate_spinon_mode(request: ModulateSpinonRequest):
    return lsm_spinon_service.modulate_spinon(
        channel_id=request.channel_id,
        spinon_momentum_k_rad=request.spinon_momentum_k_rad or 1.5708,
    )
