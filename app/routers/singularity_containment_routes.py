from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.services.singularity_containment import micro_singularity_containment

router = APIRouter(
    prefix="/api/singularity-containment",
    tags=["Micro-Singularity Hawking Radiation Containment (Cap 82)"],
)


class AdjustMatterFeedRequest(BaseModel):
    cell_id: str = Field(..., example="SINGULARITY-VAULT-CERN-01")
    delta_rate_kg_s: float = Field(default=0.05, ge=-1.0, le=1.0)


@router.get("/cells")
async def get_cells() -> List[Dict[str, Any]]:
    return micro_singularity_containment.list_cells()


@router.post("/telemetry/{cell_id}")
async def get_cell_telemetry(cell_id: str) -> Dict[str, Any]:
    try:
        return micro_singularity_containment.sample_singularity_telemetry(cell_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/adjust-feed")
async def adjust_feed(req: AdjustMatterFeedRequest) -> Dict[str, Any]:
    try:
        return micro_singularity_containment.adjust_relativistic_matter_feed(
            cell_id=req.cell_id,
            delta_rate_kg_s=req.delta_rate_kg_s,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    return micro_singularity_containment.get_matrix_metrics()

