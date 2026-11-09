from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.magnetosphere_dynamo import magnetosphere_dynamo_decoupler

router = APIRouter(
    prefix="/api/magnetosphere-dynamo",
    tags=["Magnetosphere Dynamo & HEMP Decoupler (Cap 78)"],
)


class TriggerDecouplingRequest(BaseModel):
    station_id: str = Field(..., examples=["DYNAMO-ORBITAL-COIL-01"])
    threat_type: str = Field(
        default="HEMP_NUCLEAR_BURST", examples=["HEMP_NUCLEAR_BURST"]
    )
    simulated_e1_kv_m: float = Field(default=55.0, ge=1.0, le=200.0)
    simulated_rise_time_ns: float = Field(default=2.1, ge=0.1, le=50.0)


@router.get("/stations")
async def get_stations() -> List[Dict[str, Any]]:
    return magnetosphere_dynamo_decoupler.list_stations()


@router.post("/trigger-decoupling")
async def trigger_decoupling(req: TriggerDecouplingRequest) -> Dict[str, Any]:
    try:
        return magnetosphere_dynamo_decoupler.trigger_emp_decoupling(
            station_id=req.station_id,
            threat_type=req.threat_type,
            simulated_e1_kv_m=req.simulated_e1_kv_m,
            simulated_rise_time_ns=req.simulated_rise_time_ns,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    return magnetosphere_dynamo_decoupler.get_dynamo_metrics()
