from typing import Any, Dict, List, Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.infrastructure.topological_crystalline_insulator_bus import (
    tci_bus_service,
)

router = APIRouter(
    prefix="/api/infrastructure/topological-crystalline-insulator",
    tags=["Topological Crystalline Insulator Bus"],
)


class ModulateMirrorRequest(BaseModel):
    channel_id: str = "SNTE-SURFACE-001"
    strain_percent: Optional[float] = 0.05


@router.get("/telemetry")
def get_telemetry() -> Dict[str, Any]:
    return tci_bus_service.get_telemetry()


@router.get("/channels")
def get_channels() -> List[Dict[str, Any]]:
    return tci_bus_service.get_channels()


@router.post("/modulate-mirror-symmetry")
def modulate_mirror_symmetry(req: ModulateMirrorRequest) -> Dict[str, Any]:
    return tci_bus_service.modulate_mirror_symmetry(
        channel_id=req.channel_id, strain_percent=req.strain_percent or 0.05
    )
