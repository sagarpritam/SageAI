"""
FastAPI Router for Autonomous Counter-Quantum Cryptographic Harvest Attack Disruption Matrix.
"""

from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.counter_quantum_matrix import counter_quantum_harvest_matrix

router = APIRouter(
    prefix="/counter-quantum",
    tags=["Counter-Quantum Cryptographic Harvest Disruption Matrix"],
)


class InjectHoneyChaffRequest(BaseModel):
    interceptor_id: str = Field(..., description="Target egress harvest interceptor ID")
    burst_count: int = Field(100, description="Number of synthetic honey-ciphertexts to inject")
    lattice_dimension: int = Field(1024, description="Lattice dimension for simulated post-quantum scheme")
    entropy_sink_type: str = Field("TRAPDOOR_EXPONENTIAL_BRANCH_SINK", description="Complexity sink strategy")


class TriggerDecoherenceRequest(BaseModel):
    interceptor_id: str = Field(..., description="Target egress interceptor to trip decoherence")
    target_quantum_algorithm: str = Field("SHOR_DISCRETE_LOG_OR_LATTICE_BKZ", description="Target algorithm to foil")


@router.get("/interceptors")
@limiter.limit("60/minute")
async def list_interceptors_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all registered counter-quantum harvest interceptors."""
    return {"status": "success", "interceptors": counter_quantum_harvest_matrix.list_interceptors()}


@router.get("/interceptors/{interceptor_id}")
@limiter.limit("60/minute")
async def get_interceptor_endpoint(
    request: Request,
    interceptor_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves status of a specific counter-quantum egress interceptor."""
    it = counter_quantum_harvest_matrix.get_interceptor(interceptor_id)
    if not it:
        raise HTTPException(status_code=404, detail=f"Interceptor {interceptor_id} not found.")
    return {"status": "success", "interceptor": it}


@router.post("/inject-honey-chaff")
@limiter.limit("30/minute")
async def inject_honey_chaff_endpoint(
    request: Request,
    payload: InjectHoneyChaffRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Injects high-entropy decoy ciphertexts to poison adversary HNDL vaults."""
    try:
        event = counter_quantum_harvest_matrix.inject_quantum_honey_chaff(
            interceptor_id=payload.interceptor_id,
            burst_count=payload.burst_count,
            lattice_dimension=payload.lattice_dimension,
            entropy_sink_type=payload.entropy_sink_type,
        )
        return {"status": "success", "injection": event}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/trigger-decoherence")
@limiter.limit("30/minute")
async def trigger_decoherence_endpoint(
    request: Request,
    payload: TriggerDecoherenceRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Forces adversary quantum cryptanalytic QPUs into exponential branch decoherence."""
    try:
        result = counter_quantum_harvest_matrix.trigger_trapdoor_decoherence(
            interceptor_id=payload.interceptor_id,
            target_quantum_algorithm=payload.target_quantum_algorithm,
        )
        return {"status": "success", "decoherence": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves Counter-Quantum Harvest Matrix defense metrics."""
    return {"status": "success", "metrics": counter_quantum_harvest_matrix.get_metrics()}

