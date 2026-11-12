"""
FastAPI Router for Capability 126: dS/CFT De Sitter Static-Patch & Timelike Entanglement Shield.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.ds_static_patch.ds_static_patch import (
    get_ds_static_patch_shield,
)

router = APIRouter(
    prefix="/api/ds-static-patch",
    tags=[
        "Capability 126: dS/CFT De Sitter Static-Patch & Timelike Entanglement Shield"
    ],
)


class LockStaticPatchRequest(BaseModel):
    patch_id: str = Field(..., description="ID of the de Sitter static-patch horizon")
    hubble_scale: float = Field(
        default=1.0,
        ge=0.2,
        le=10.0,
        description="Dimensionless de Sitter Hubble curvature scale H",
    )
    york_time: float = Field(
        default=0.85,
        ge=0.1,
        le=5.0,
        description="Stretched-horizon York time observer clock coordinate",
    )
    timelike_interval: float = Field(
        default=1.4,
        ge=0.2,
        le=8.0,
        description="Timelike separation supporting pseudo-entanglement S_T",
    )
    observer_clamp_gain: float = Field(
        default=1.55,
        ge=0.85,
        le=2.5,
        description="Type II_1 static-patch observer algebra stabilization gain",
    )


@router.get("/patches")
async def list_patches():
    """List all registered de Sitter static-patch horizons."""
    shield = get_ds_static_patch_shield()
    return {"patches": shield.get_patches()}


@router.post("/lock-patch")
async def lock_static_patch_route(request: LockStaticPatchRequest):
    """Lock a de Sitter static-patch horizon and timelike entanglement entropy bound."""
    shield = get_ds_static_patch_shield()
    try:
        return shield.lock_static_patch(
            patch_id=request.patch_id,
            hubble_scale=request.hubble_scale,
            york_time=request.york_time,
            timelike_interval=request.timelike_interval,
            observer_clamp_gain=request.observer_clamp_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_ds_static_patch_metrics():
    """Retrieve aggregate de Sitter static-patch shield metrics."""
    shield = get_ds_static_patch_shield()
    return shield.get_ds_static_patch_metrics()
