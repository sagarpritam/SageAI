"""
FastAPI Router for Decentralized SIEM & eBPF Kernel Telemetry Agent.
"""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.telemetry.ebpf_agent import (
    ebpf_agent_service,
)

router = APIRouter(prefix="/ebpf", tags=["eBPF Kernel Telemetry & SIEM"])


class IngestKernelEventRequest(BaseModel):
    syscall: str = Field(..., description="Kernel syscall name, e.g. sys_enter_execve")
    comm: str = Field(..., description="Process command name")
    pid: int = Field(..., description="Process ID")
    ppid: Optional[int] = Field(1, description="Parent Process ID")
    container_id: Optional[str] = Field("host", description="Container runtime ID")
    args: Optional[List[str]] = Field([], description="Command-line arguments or parameters")
    severity: Optional[str] = Field("INFO", description="Initial severity level")


class QuarantineProcessRequest(BaseModel):
    pid: int = Field(..., description="Process ID to isolate and kill")
    reason: Optional[str] = Field("Suspicious Kernel Syscall Behavior", description="Quarantine rationale")


@router.get("/status")
@limiter.limit("60/minute")
async def get_ebpf_agent_status(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Returns status of attached kernel probes, ring buffer capacity, and active quarantines."""
    return {
        "status": "success",
        "agent": ebpf_agent_service.get_probes_status(),
    }


@router.get("/events")
@limiter.limit("120/minute")
async def get_ebpf_telemetry_stream(
    request: Request,
    limit: int = 50,
    severity: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves recent real-time kernel telemetry events from the eBPF ring buffer."""
    events = ebpf_agent_service.get_telemetry_stream(limit=limit, severity_filter=severity)
    return {
        "status": "success",
        "count": len(events),
        "events": events,
    }


@router.post("/simulate-event")
@limiter.limit("60/minute")
async def simulate_kernel_event(
    request: Request,
    payload: IngestKernelEventRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Ingests or emulates a kernel tracepoint event into the ring buffer.
    Triggers automated container escape & threat detection heuristics.
    """
    event = ebpf_agent_service.ingest_kernel_event(payload.model_dump())
    return {
        "status": "success",
        "event": event,
    }


@router.post("/quarantine")
@limiter.limit("30/minute")
async def quarantine_process_endpoint(
    request: Request,
    payload: QuarantineProcessRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Triggers autonomous or manual process quarantine, freezes cgroup, and anchors into Merkle chain.
    """
    org_id = str(current_user.get("org", "system"))
    user_id = str(current_user.get("sub", "SecOps-Director"))

    result = ebpf_agent_service.quarantine_process(
        pid=payload.pid,
        reason=payload.reason or "Manual SecOps Quarantine Trigger",
        actor=user_id,
        org_id=org_id,
    )
    return {
        "status": "success",
        "quarantine": result,
    }

