from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.desitter_repulsion_grid import desitter_repulsion_grid

router = APIRouter(
    prefix="/api/desitter-repulsion",
    tags=["Cosmological de Sitter Horizon Casimir-Polder Repulsion Grid (Cap 86)"],
)


class GenerateRepulsionRequest(BaseModel):
    grid_id: str = Field(..., description="Target de Sitter repulsion grid ID")
    target_metric_region: str = Field(
        default="LOCAL_INERTIAL_FRAME_SEC_1", description="Target metric region"
    )
    coupling_gain: float = Field(
        default=1.0, ge=0.1, le=10.0, description="Coupling gain"
    )


@router.get("/grids")
async def get_grids() -> List[Dict[str, Any]]:
    return desitter_repulsion_grid.list_nodes()


@router.post("/generate-repulsion")
async def generate_repulsion(req: GenerateRepulsionRequest) -> Dict[str, Any]:
    try:
        return desitter_repulsion_grid.generate_repulsion_barrier(
            grid_id=req.grid_id,
            target_metric_region=req.target_metric_region,
            coupling_gain=req.coupling_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    return desitter_repulsion_grid.get_grid_metrics()
