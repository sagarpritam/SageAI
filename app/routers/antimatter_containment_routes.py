from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.services.antimatter_containment import superconducting_antimatter_containment

router = APIRouter(prefix="/api/antimatter-containment", tags=["Antimatter Containment (Cap 76)"])


class CompressPlasmaRequest(BaseModel):
    cell_id: str = Field(..., example="CELL-ALPHA-PENNING-01")
    delta_voltage_v: float = Field(default=0.5, ge=0.1, le=5.0)
    target_radius_mm: float = Field(default=1.45, ge=0.5, le=5.0)


class QuenchDivertRequest(BaseModel):
    cell_id: str = Field(..., example="CELL-ALPHA-PENNING-01")
    reason: str = Field(default="SCHEDULED_SAFETY_DRILL")


@router.get("/cells")
async def get_cells() -> List[Dict[str, Any]]:
    return superconducting_antimatter_containment.list_cells()


@router.get("/telemetry/{cell_id}")
async def get_cell_telemetry(cell_id: str) -> Dict[str, Any]:
    try:
        return superconducting_antimatter_containment.monitor_plasma_dynamics(cell_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/compress-plasma")
async def compress_plasma(req: CompressPlasmaRequest) -> Dict[str, Any]:
    try:
        return superconducting_antimatter_containment.trigger_rotating_wall_compression(
            cell_id=req.cell_id,
            delta_voltage_v=req.delta_voltage_v,
            target_radius_mm=req.target_radius_mm,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/quench-divert")
async def quench_divert(req: QuenchDivertRequest) -> Dict[str, Any]:
    try:
        return superconducting_antimatter_containment.execute_fail_safe_quench_divert(
            cell_id=req.cell_id,
            reason=req.reason,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    return superconducting_antimatter_containment.get_matrix_metrics()
