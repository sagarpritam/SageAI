"""
FastAPI Router for Deep-Space Interplanetary Optical Laser Telemetry Cryptographic Mesh.
"""

from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.deep_space_laser.deep_space_laser_mesh import deep_space_laser_mesh

router = APIRouter(
    prefix="/deep-space-laser",
    tags=["Deep-Space Interplanetary Optical Laser Telemetry Mesh"],
)


class AcquireBeamRequest(BaseModel):
    terminal_id: str = Field(
        ..., description="Target deep-space optical terminal identifier"
    )
    point_ahead_angle_urad: float = Field(
        ..., description="Point-ahead acquisition angle in micro-radians"
    )
    doppler_shift_ghz: float = Field(
        ..., description="Relativistic Doppler frequency shift in GHz"
    )
    photon_snr_db: float = Field(..., description="Photon Signal-to-Noise Ratio in dB")


class TransmitFrameRequest(BaseModel):
    terminal_id: str = Field(
        ..., description="Target terminal to transmit authenticated DSOC frame"
    )
    payload_size_kb: int = Field(
        1024, description="Telemetry payload size in kilobytes"
    )
    pqc_cipher: str = Field(
        "ML-KEM-1024_LDPC", description="Post-quantum framing standard"
    )


@router.get("/terminals")
@limiter.limit("60/minute")
async def list_terminals_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all monitored deep-space optical laser terminals."""
    return {"status": "success", "terminals": deep_space_laser_mesh.list_terminals()}


@router.get("/terminals/{terminal_id}")
@limiter.limit("60/minute")
async def get_terminal_endpoint(
    request: Request,
    terminal_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves details of a specific deep-space optical terminal."""
    term = deep_space_laser_mesh.get_terminal(terminal_id)
    if not term:
        raise HTTPException(status_code=404, detail="Deep-space terminal not found")
    return {"status": "success", "terminal": term}


@router.post("/acquire-beam")
@limiter.limit("60/minute")
async def acquire_beam_endpoint(
    request: Request,
    body: AcquireBeamRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Calibrates point-ahead angle and tracks relativistic astronomical Doppler shifts."""
    try:
        verdict = deep_space_laser_mesh.acquire_deepspace_beam(
            terminal_id=body.terminal_id,
            point_ahead_angle_urad=body.point_ahead_angle_urad,
            doppler_shift_ghz=body.doppler_shift_ghz,
            photon_snr_db=body.photon_snr_db,
        )
        return {"status": "success", "acquisition": verdict}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/transmit-frame")
@limiter.limit("30/minute")
async def transmit_frame_endpoint(
    request: Request,
    body: TransmitFrameRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Transmits post-quantum authenticated DSOC photon frame across interplanetary space."""
    try:
        result = deep_space_laser_mesh.transmit_authenticated_dsoc_frame(
            terminal_id=body.terminal_id,
            payload_size_kb=body.payload_size_kb,
            pqc_cipher=body.pqc_cipher,
        )
        return {"status": "success", "transmission": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_deepspace_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Returns deep-space optical communications fleet metrics."""
    return {
        "status": "success",
        "metrics": deep_space_laser_mesh.get_deepspace_metrics(),
    }
