"""
FastAPI Router for Capability 106: Fibonacci Anyon Braid Compiler & Topological Fault-Tolerance Synthesizer.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any

from app.services.fibonacci_anyon_compiler.fibonacci_anyon_compiler import get_fibonacci_anyon_compiler

router = APIRouter(prefix="/api/fibonacci-anyon", tags=["Capability 106: Fibonacci Anyon Compiler"])


class CompileBraidRequest(BaseModel):
    braid_id: str = Field(..., description="ID of the Fibonacci anyon braid channel")
    target_gate: str = Field(default="HADAMARD", description="Target quantum gate (HADAMARD, PHASE_S, T_GATE, CNOT, TOFFOLI)")
    braid_length_steps: int = Field(default=32, ge=8, le=128, description="Number of braiding generator steps")
    damping_gain: float = Field(default=1.1, ge=0.8, le=2.5, description="Topological decoherence damping gain")


@router.get("/braids")
async def list_braids():
    """List all registered Fibonacci anyon braid channels."""
    compiler = get_fibonacci_anyon_compiler()
    return {"braids": compiler.get_braids()}


@router.post("/compile-braid")
async def compile_braid_route(request: CompileBraidRequest):
    """Compile universal quantum gate onto Fibonacci anyon worldline braid words."""
    compiler = get_fibonacci_anyon_compiler()
    try:
        telemetry = compiler.compile_braid(
            braid_id=request.braid_id,
            target_gate=request.target_gate,
            braid_length_steps=request.braid_length_steps,
            damping_gain=request.damping_gain,
        )
        return telemetry
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_fibonacci_metrics():
    """Retrieve aggregate Fibonacci anyon compiler metrics."""
    compiler = get_fibonacci_anyon_compiler()
    return compiler.get_fibonacci_metrics()
