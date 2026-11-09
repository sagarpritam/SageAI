from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.inflaton_reheating_pump import inflaton_reheating_pump

router = APIRouter(
    prefix="/api/inflaton-reheating",
    tags=["Inflaton Chaotic Reheating & Thermal Baryogenesis Pump (Cap 92)"],
)


class TriggerReheatingCycleRequest(BaseModel):
    node_id: str = Field(..., description="Target inflaton resonance node ID")
    initial_amplitude_planck: float = Field(
        default=0.85,
        ge=0.01,
        le=5.0,
        description="Inflaton field amplitude in Planck units",
    )
    coupling_gain: float = Field(
        default=1.0, ge=0.1, le=10.0, description="Coupling parameter gain"
    )


@router.get("/nodes")
async def get_nodes() -> List[Dict[str, Any]]:
    return inflaton_reheating_pump.list_nodes()


@router.post("/reheat-cycle")
async def trigger_reheat_cycle(req: TriggerReheatingCycleRequest) -> Dict[str, Any]:
    try:
        return inflaton_reheating_pump.trigger_reheating_cycle(
            node_id=req.node_id,
            initial_amplitude_planck=req.initial_amplitude_planck,
            coupling_gain=req.coupling_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    return inflaton_reheating_pump.get_pump_metrics()
