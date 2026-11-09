"""
FastAPI Router for Autonomous ICS/SCADA Modbus/DNP3 Micro-Firewall & Actuator Safety Clamps.
"""

from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.industrial_scada.industrial_kinetic_shield import (
    industrial_kinetic_shield,
)

router = APIRouter(
    prefix="/industrial-scada",
    tags=["Autonomous ICS/SCADA Modbus/DNP3 Micro-Firewall"],
)


class InspectPacketRequest(BaseModel):
    plc_id: str = Field(..., description="Target PLC/RTU identifier")
    function_code: int = Field(..., description="Modbus/DNP3 function code")
    target_register: int = Field(..., description="Holding register or coil address")
    requested_value: float = Field(..., description="Setpoint value to write")
    protocol: Optional[str] = "MODBUS_TCP"


@router.get("/plcs")
@limiter.limit("60/minute")
async def list_plcs_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all monitored industrial PLCs, RTUs, and safety envelopes."""
    return {"status": "success", "plcs": industrial_kinetic_shield.list_plcs()}


@router.get("/plcs/{plc_id}")
@limiter.limit("60/minute")
async def get_plc_endpoint(
    request: Request,
    plc_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves details of a specific industrial controller."""
    plc = industrial_kinetic_shield.get_plc(plc_id)
    if not plc:
        raise HTTPException(status_code=404, detail="PLC not found")
    return {"status": "success", "plc": plc}


@router.post("/inspect-packet")
@limiter.limit("60/minute")
async def inspect_packet_endpoint(
    request: Request,
    payload: InspectPacketRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Performs DPI on SCADA packets and enforces physical kinetic safety clamps."""
    try:
        res = industrial_kinetic_shield.inspect_scada_packet(
            plc_id=payload.plc_id,
            function_code=payload.function_code,
            target_register=payload.target_register,
            requested_value=payload.requested_value,
            protocol=payload.protocol or "MODBUS_TCP"
        )
        return {"status": "success", "inspection": res}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves ICS/SCADA micro-firewall telemetry and clamped threats."""
    return {"status": "success", "metrics": industrial_kinetic_shield.get_metrics()}

