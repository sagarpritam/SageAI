"""
FastAPI Router for Spaceborne Satellite Laser Inter-Link (ISL) Cryptographic Ephemeral Rekeying.
"""

from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.orbital_laser_mesh.orbital_laser_mesh_guard import (
    orbital_laser_mesh_guard,
)

router = APIRouter(
    prefix="/orbital-laser",
    tags=["Spaceborne Laser Inter-Satellite Mesh & Telecommand Hardening"],
)


class RekeyRequest(BaseModel):
    satellite_id: str = Field(..., description="Target constellation satellite node")


class TelecommandRequest(BaseModel):
    satellite_id: str = Field(..., description="Target satellite identifier")
    ground_station_id: str = Field(..., description="Uplinking Ground Station ID")
    command_code: int = Field(..., description="CCSDS telecommand code")
    anti_replay_counter: int = Field(..., description="Strict monotonically increasing sequence counter")
    telecommand_mac_hex: str = Field(..., description="Cryptographic MAC authentication tag")


@router.get("/satellites")
@limiter.limit("60/minute")
async def list_satellites_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all satellites in the orbital laser mesh constellation."""
    return {"status": "success", "satellites": orbital_laser_mesh_guard.list_satellites()}


@router.get("/satellites/{satellite_id}")
@limiter.limit("60/minute")
async def get_satellite_endpoint(
    request: Request,
    satellite_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves details of a specific satellite node."""
    sat = orbital_laser_mesh_guard.get_satellite(satellite_id)
    if not sat:
        raise HTTPException(status_code=404, detail="Satellite not found")
    return {"status": "success", "satellite": sat}


@router.post("/rekey")
@limiter.limit("30/minute")
async def rekey_laser_link_endpoint(
    request: Request,
    body: RekeyRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Executes a 60-second ephemeral PQC rekeying handshake across optical laser links."""
    try:
        res = orbital_laser_mesh_guard.rekey_laser_link(body.satellite_id)
        return {"status": "success", "rekey": res}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/inspect-telecommand")
@limiter.limit("60/minute")
async def inspect_telecommand_endpoint(
    request: Request,
    body: TelecommandRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Validates CCSDS telecommands for authorization, replay defense, and integrity."""
    try:
        res = orbital_laser_mesh_guard.inspect_ccsds_telecommand(
            satellite_id=body.satellite_id,
            ground_station_id=body.ground_station_id,
            command_code=body.command_code,
            anti_replay_counter=body.anti_replay_counter,
            telecommand_mac_hex=body.telecommand_mac_hex,
        )
        return {"status": "success", "telecommand_inspection": res}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_orbital_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Returns orbital laser mesh and constellation telemetry metrics."""
    return {"status": "success", "metrics": orbital_laser_mesh_guard.get_orbital_metrics()}

