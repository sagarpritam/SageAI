"""
FastAPI Router for Space-Ground Quantum Key Distribution (QKD) Mesh.
"""

from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.space_ground_qkd.space_ground_qkd_mesh import space_ground_qkd_mesh

router = APIRouter(
    prefix="/space-ground-qkd",
    tags=["Space-Ground Quantum Key Distribution (QKD) Mesh"],
)


class EvaluateQBERRequest(BaseModel):
    link_id: str = Field(..., description="Target space-ground quantum link identifier")
    measured_qber_pct: float = Field(..., description="Measured Quantum Bit Error Rate percentage")
    photon_coincidence_window_ns: float = Field(1.2, description="Coincidence resolution window in nanoseconds")


class EntanglementSwapRequest(BaseModel):
    link_id: str = Field(..., description="Target link to execute Bell-State Measurement entanglement swap")


@router.get("/links")
@limiter.limit("60/minute")
async def list_links_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all monitored space-ground quantum photon links."""
    return {"status": "success", "links": space_ground_qkd_mesh.list_links()}


@router.get("/links/{link_id}")
@limiter.limit("60/minute")
async def get_link_endpoint(
    request: Request,
    link_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves details of a specific quantum photon link."""
    link = space_ground_qkd_mesh.get_link(link_id)
    if not link:
        raise HTTPException(status_code=404, detail="Space-ground QKD link not found")
    return {"status": "success", "link": link}


@router.post("/evaluate-qber")
@limiter.limit("60/minute")
async def evaluate_qber_endpoint(
    request: Request,
    body: EvaluateQBERRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Evaluates Quantum Bit Error Rate (QBER) and detects adversary photon beam-splitting taps."""
    try:
        verdict = space_ground_qkd_mesh.evaluate_qber_and_eavesdropping(
            link_id=body.link_id,
            measured_qber_pct=body.measured_qber_pct,
            photon_coincidence_window_ns=body.photon_coincidence_window_ns,
        )
        return {"status": "success", "evaluation": verdict}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/swap")
@limiter.limit("30/minute")
async def execute_swap_endpoint(
    request: Request,
    body: EntanglementSwapRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Executes Bell-State Measurement (BSM) entanglement swapping across orbital repeaters."""
    try:
        result = space_ground_qkd_mesh.execute_entanglement_swap(body.link_id)
        return {"status": "success", "swap": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_qkd_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Returns space-ground quantum key distribution fleet metrics."""
    return {"status": "success", "metrics": space_ground_qkd_mesh.get_qkd_metrics()}

