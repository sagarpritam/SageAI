"""
FastAPI Router for Capability 115: Langlands-Kapustin S-Duality & Geometric Langlands Synchronizer.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.geometric_langlands.geometric_langlands import (
    get_geometric_langlands_synchronizer,
)

router = APIRouter(
    prefix="/api/geometric-langlands",
    tags=[
        "Capability 115: Langlands-Kapustin S-Duality & Gauge Langlands Synchronizer"
    ],
)


class SyncDualityRequest(BaseModel):
    sheaf_id: str = Field(
        ..., description="ID of the Langlands dual gauge / Hitchin sheaf bundle"
    )
    yang_mills_coupling_g: float = Field(
        default=1.18,
        ge=0.2,
        le=4.0,
        description="4D N=4 Super-Yang-Mills gauge coupling g_YM",
    )
    theta_vacuum_angle_pi: float = Field(
        default=0.25,
        ge=0.0,
        le=2.0,
        description="CP-violating theta angle normalized in units of pi",
    )
    riemann_genus: int = Field(
        default=3,
        ge=2,
        le=12,
        description="Genus g of the compactified Riemann surface Sigma_g",
    )
    hecke_eigen_gain: float = Field(
        default=1.25,
        ge=0.8,
        le=2.5,
        description="Hecke eigensheaf cohomology synchronization gain",
    )


@router.get("/sheaves")
async def list_sheaves():
    """List all registered Geometric Langlands dual gauge bundles."""
    sync = get_geometric_langlands_synchronizer()
    return {"sheaves": sync.get_sheaves()}


@router.post("/sync-duality")
async def sync_duality_route(request: SyncDualityRequest):
    """Execute Kapustin-Witten S-duality tau -> -1/tau & Wilson/'t Hooft loop lock."""
    sync = get_geometric_langlands_synchronizer()
    try:
        return sync.sync_s_duality(
            sheaf_id=request.sheaf_id,
            yang_mills_coupling_g=request.yang_mills_coupling_g,
            theta_vacuum_angle_pi=request.theta_vacuum_angle_pi,
            riemann_genus=request.riemann_genus,
            hecke_eigen_gain=request.hecke_eigen_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_langlands_metrics():
    """Retrieve aggregate Geometric Langlands S-Duality metrics."""
    sync = get_geometric_langlands_synchronizer()
    return sync.get_langlands_metrics()
