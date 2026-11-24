from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.infrastructure.topological_defect_bus import topological_defect_bus

router = APIRouter(
    prefix="/api/infrastructure/topological-defect", tags=["Topological Defect Bus"]
)


class QuenchFluxRequest(BaseModel):
    channel_id: Optional[str] = "KIBBLE-ZUREK-QUENCH-ALPHA"
    quench_time_ns: Optional[float] = 1.25


@router.get("/telemetry")
async def get_telemetry():
    return topological_defect_bus.get_telemetry()


@router.get("/channels")
async def get_channels():
    return topological_defect_bus.get_channels()


@router.post("/quench-flux")
async def quench_flux(req: QuenchFluxRequest):
    return topological_defect_bus.quench_flux(
        channel_id=req.channel_id, quench_time_ns=req.quench_time_ns
    )
