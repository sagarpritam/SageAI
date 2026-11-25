"""
FastAPI router for Capability 186: Cannon-Thurston Hyperbolic Group Boundary & Fractal Rigid Barrier.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.cannon_thurston_hyperbolic_barrier import (
    get_cannon_thurston_hyperbolic_barrier_service,
)

router = APIRouter(
    prefix="/api/cannon-thurston-hyperbolic",
    tags=["Cannon-Thurston Hyperbolic Barrier"],
)


class VerifyBoundaryRigidityRequest(BaseModel):
    group_id: str = Field(..., description="ID of the hyperbolic group configuration")
    geodesic_ray_steps: int = Field(
        default=100, ge=10, le=500, description="Boundary geodesic ray tracking steps"
    )
    delta_hyperbolicity_tolerance: float = Field(
        default=0.05, ge=1e-3, le=0.5, description="Gromov delta-hyperbolicity tolerance"
    )
    barrier_gain: float = Field(
        default=1.25, ge=0.5, le=3.0, description="Fractal boundary barrier gain"
    )


@router.get("/groups")
async def list_hyperbolic_groups():
    """List registered Gromov hyperbolic group configurations."""
    svc = get_cannon_thurston_hyperbolic_barrier_service()
    return {"groups": svc.get_groups()}


@router.post("/verify-boundary-rigidity")
async def verify_boundary_rigidity(request: VerifyBoundaryRigidityRequest):
    """Verify Cannon-Thurston continuous surjection and boundary fractal rigidity."""
    svc = get_cannon_thurston_hyperbolic_barrier_service()
    try:
        return svc.verify_boundary_rigidity(
            group_id=request.group_id,
            geodesic_ray_steps=request.geodesic_ray_steps,
            delta_hyperbolicity_tolerance=request.delta_hyperbolicity_tolerance,
            barrier_gain=request.barrier_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
async def get_cannon_thurston_metrics():
    """Get operational telemetry metrics for Cannon-Thurston hyperbolic barrier."""
    svc = get_cannon_thurston_hyperbolic_barrier_service()
    return svc.get_metrics()
