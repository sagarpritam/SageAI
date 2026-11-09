from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.calabi_yau_stabilizer import calabi_yau_stabilizer

router = APIRouter(
    prefix="/api/calabi-yau",
    tags=["10D Superstring Calabi-Yau Moduli Stabilizer (Cap 87)"],
)


class StabilizeModuliRequest(BaseModel):
    manifold_id: str = Field(..., description="Target Calabi-Yau manifold ID")
    target_volume_string_units: float = Field(default=50.0, ge=1.0, le=500.0, description="Target compactification volume")
    flux_intensity_factor: float = Field(default=1.0, ge=0.1, le=10.0, description="RR/NS flux factor")


@router.get("/manifolds")
async def get_manifolds() -> List[Dict[str, Any]]:
    return calabi_yau_stabilizer.list_manifolds()


@router.post("/stabilize-moduli")
async def stabilize_moduli(req: StabilizeModuliRequest) -> Dict[str, Any]:
    try:
        return calabi_yau_stabilizer.stabilize_moduli(
            manifold_id=req.manifold_id,
            target_volume_string_units=req.target_volume_string_units,
            flux_intensity_factor=req.flux_intensity_factor,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    return calabi_yau_stabilizer.get_stabilization_metrics()
