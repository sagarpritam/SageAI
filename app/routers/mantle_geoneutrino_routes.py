from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.mantle_geoneutrino import deep_mantle_geoneutrino_mesh

router = APIRouter(prefix="/api/mantle-geoneutrino", tags=["Deep Mantle Geoneutrino Tomography (Cap 79)"])


class ReconstructMantleRequest(BaseModel):
    region_label: str = Field(default="YELLOWSTONE_CALDERA_SUPERPLUME", example="YELLOWSTONE_CALDERA_SUPERPLUME")
    depth_target_km: float = Field(default=2890.0, ge=100.0, le=6371.0)
    observation_days: float = Field(default=60.0, ge=1.0, le=730.0)


@router.get("/observatories")
async def get_observatories() -> List[Dict[str, Any]]:
    return deep_mantle_geoneutrino_mesh.list_observatories()


@router.post("/reconstruct-tomography")
async def reconstruct_tomography(req: ReconstructMantleRequest) -> Dict[str, Any]:
    try:
        return deep_mantle_geoneutrino_mesh.reconstruct_mantle_tomography(
            region_label=req.region_label,
            depth_target_km=req.depth_target_km,
            observation_days=req.observation_days,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    return deep_mantle_geoneutrino_mesh.get_mesh_metrics()

