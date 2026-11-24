from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.infrastructure.voevodsky_slice_bus import voevodsky_slice_service

router = APIRouter(
    prefix="/api/infrastructure/voevodsky-slice-bus",
    tags=["Voevodsky Motivic Homotopy Slice Filtration Interconnect Bus"],
)


class ModulateSliceRequest(BaseModel):
    channel_id: str = Field(
        ..., description="Target Voevodsky slice channel identifier"
    )
    slice_weight_bias_rad: Optional[float] = Field(
        1.4142, description="Hopkins-Morel motivic slice weight bias in radians"
    )


@router.get("/telemetry")
async def get_slice_telemetry():
    return voevodsky_slice_service.get_telemetry()


@router.get("/channels")
async def list_slice_channels():
    return voevodsky_slice_service.list_channels()


@router.post("/modulate-slice")
async def modulate_slice_channel(request: ModulateSliceRequest):
    return voevodsky_slice_service.modulate_slice(
        channel_id=request.channel_id,
        slice_weight_bias_rad=request.slice_weight_bias_rad
        if request.slice_weight_bias_rad is not None
        else 1.4142,
    )
