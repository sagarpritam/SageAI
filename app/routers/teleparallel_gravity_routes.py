"""
FastAPI Router for Capability 101: Topological Torsion Teleparallel Gravity Engine.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.teleparallel_gravity.teleparallel_gravity import (
    get_teleparallel_gravity_engine,
)

router = APIRouter(
    prefix="/api/teleparallel-gravity", tags=["Capability 101: Teleparallel Gravity"]
)


class ModulateTorsionRequest(BaseModel):
    node_id: str = Field(..., description="ID of the teleparallel tetrad node")
    boost_factor: float = Field(
        default=1.0, ge=0.5, le=3.5, description="Torsion modulation boost factor"
    )
    torsion_flux_gain: float = Field(
        default=1.05, ge=0.8, le=2.5, description="Torsion flux coupling gain"
    )


@router.get("/nodes")
async def list_tetrad_nodes():
    """List all registered teleparallel tetrad nodes."""
    engine = get_teleparallel_gravity_engine()
    return {"nodes": engine.get_tetrad_nodes()}


@router.post("/modulate-torsion")
async def modulate_torsion_route(request: ModulateTorsionRequest):
    """Modulate Weitzenböck spacetime torsion and f(T) modified gravity."""
    engine = get_teleparallel_gravity_engine()
    try:
        telemetry = engine.modulate_torsion(
            node_id=request.node_id,
            boost_factor=request.boost_factor,
            torsion_flux_gain=request.torsion_flux_gain,
        )
        return telemetry
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_teleparallel_metrics():
    """Retrieve aggregate teleparallel gravity metrics."""
    engine = get_teleparallel_gravity_engine()
    return engine.get_teleparallel_metrics()
