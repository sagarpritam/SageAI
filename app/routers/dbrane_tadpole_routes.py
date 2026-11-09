from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.services.dbrane_tadpole_filter import get_dbrane_tadpole_filter

router = APIRouter(
    prefix="/api/dbrane-tadpole",
    tags=["D-Brane Ramond-Ramond Charge Tadpole Anomaly Filter (Cap 96)"],
)


class CancelTadpoleRequest(BaseModel):
    stack_id: str = Field(..., description="Target D-Brane stack ID")
    compensatory_flux_quanta: int = Field(default=1, ge=1, le=100, description="Compensatory Ramond-Ramond flux quanta")
    green_schwarz_boost: float = Field(default=1.0, ge=0.1, le=10.0, description="Green-Schwarz axion coupling boost")


@router.get("/stacks")
async def get_stacks() -> List[Dict[str, Any]]:
    filt = get_dbrane_tadpole_filter()
    return filt.list_stacks()


@router.post("/cancel-tadpole")
async def cancel_tadpole(req: CancelTadpoleRequest) -> Dict[str, Any]:
    try:
        filt = get_dbrane_tadpole_filter()
        return filt.cancel_tadpole_anomaly(
            stack_id=req.stack_id,
            compensatory_flux_quanta=req.compensatory_flux_quanta,
            green_schwarz_boost=req.green_schwarz_boost,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    filt = get_dbrane_tadpole_filter()
    return filt.get_filter_metrics()
