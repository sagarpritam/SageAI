"""
FastAPI Router for Post-Quantum Planetary Sovereign Time-Synchronization Mesh.
"""

from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.security import get_current_user
from app.core.rate_limit import limiter
from app.services.atomic_clock_mesh import optical_atomic_clock_mesh

router = APIRouter(
    prefix="/atomic-clock",
    tags=["Post-Quantum Optical Atomic Clock Mesh"],
)


class SynchronizeMeshRequest(BaseModel):
    primary_clock_id: str = Field("clock-strontium-boulder-01", description="Reference atomic lattice clock ID")
    fiber_link_length_km: float = Field(1250.0, description="Dark fiber synchronization span in km")
    carrier_phase_jitter_fs: float = Field(4.2, description="Observed carrier phase jitter in femtoseconds")


class GenerateTimestampRequest(BaseModel):
    clock_id: str = Field("clock-strontium-boulder-01", description="Optical atomic clock to anchor epoch")
    payload_data: str = Field(..., description="Telemetry, financial transaction, or SCADA state hash to anchor")
    target_subsystem: str = Field("SCADA_INTERGRID_PMU", description="Destination critical subsystem")


@router.get("/clocks")
@limiter.limit("60/minute")
async def list_clocks_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all registered optical lattice atomic clocks and microwave standards."""
    return {"status": "success", "clocks": optical_atomic_clock_mesh.list_clocks()}


@router.get("/clocks/{clock_id}")
@limiter.limit("60/minute")
async def get_clock_endpoint(
    request: Request,
    clock_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves status and fractional uncertainty of a specific atomic clock."""
    clk = optical_atomic_clock_mesh.get_clock(clock_id)
    if not clk:
        raise HTTPException(status_code=404, detail=f"Clock {clock_id} not found.")
    return {"status": "success", "clock": clk}


@router.post("/synchronize-mesh")
@limiter.limit("30/minute")
async def synchronize_mesh_endpoint(
    request: Request,
    payload: SynchronizeMeshRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Executes planetary optical frequency comb & White Rabbit PTP clock synchronization."""
    try:
        sync_result = optical_atomic_clock_mesh.synchronize_mesh(
            primary_clock_id=payload.primary_clock_id,
            fiber_link_length_km=payload.fiber_link_length_km,
            carrier_phase_jitter_fs=payload.carrier_phase_jitter_fs,
        )
        return {"status": "success", "sync": sync_result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/generate-timestamp")
@limiter.limit("30/minute")
async def generate_timestamp_endpoint(
    request: Request,
    payload: GenerateTimestampRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Issues and verifies an ML-DSA-87 authenticated post-quantum atomic lattice timestamp."""
    try:
        result = optical_atomic_clock_mesh.generate_and_verify_timestamp(
            clock_id=payload.clock_id,
            payload_data=payload.payload_data,
            target_subsystem=payload.target_subsystem,
        )
        return {"status": "success", "timestamp_record": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves planetary optical atomic clock mesh stability metrics."""
    return {"status": "success", "metrics": optical_atomic_clock_mesh.get_metrics()}
