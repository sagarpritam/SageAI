from typing import Any, Dict, List, Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.infrastructure.quantum_spin_liquid_backbone import (
    quantum_spin_liquid_service,
)

router = APIRouter(
    prefix="/api/infrastructure/quantum-spin-liquid",
    tags=["Quantum Spin Liquid Backbone"],
)


class TuneVortexRequest(BaseModel):
    ribbon_id: str = "QSLB-RIBBON-KITAEV-ALPHA"
    flux_quantum_bias: Optional[float] = 0.5


@router.get("/telemetry")
def get_telemetry() -> Dict[str, Any]:
    return quantum_spin_liquid_service.get_telemetry()


@router.get("/ribbons")
def get_ribbons() -> List[Dict[str, Any]]:
    return quantum_spin_liquid_service.get_ribbons()


@router.post("/tune-vortex")
def tune_vortex(req: TuneVortexRequest) -> Dict[str, Any]:
    return quantum_spin_liquid_service.tune_vortex(
        ribbon_id=req.ribbon_id, flux_quantum_bias=req.flux_quantum_bias or 0.5
    )
