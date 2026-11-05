"""
FastAPI Router for Autonomous Biometric & Neural Interface (BCI) Zero-Trust Cryptographic Gate.
"""

from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.neural_bci.neural_bci_guard import neural_bci_guard

router = APIRouter(
    prefix="/neural-bci",
    tags=["Biometric & Neural Interface (BCI) Zero-Trust Gate"],
)


class EvaluateIntentRequest(BaseModel):
    operator_id: str = Field(..., description="Target enrolled BCI operator identifier")
    p300_amplitude_uv: float = Field(..., description="Measured P300 event-related potential in microvolts")
    n400_latency_ms: float = Field(..., description="Measured N400 latency in milliseconds")
    cognitive_stress_index: float = Field(..., description="Normalized cognitive stress / duress index (0.0 to 1.0)")
    synthetic_replay_flag: Optional[bool] = Field(False, description="Flag for synthetic brainwave injection detection")


class IssueSvidRequest(BaseModel):
    operator_id: str = Field(..., description="Operator identifier for PQC SVID token generation")


@router.get("/operators")
@limiter.limit("60/minute")
async def list_operators_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all enrolled neural BCI operator profiles."""
    return {"status": "success", "operators": neural_bci_guard.list_operators()}


@router.get("/operators/{operator_id}")
@limiter.limit("60/minute")
async def get_operator_endpoint(
    request: Request,
    operator_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves details of a specific BCI operator."""
    op = neural_bci_guard.get_operator(operator_id)
    if not op:
        raise HTTPException(status_code=404, detail="Operator profile not found")
    return {"status": "success", "operator": op}


@router.post("/evaluate-intent")
@limiter.limit("60/minute")
async def evaluate_intent_endpoint(
    request: Request,
    body: EvaluateIntentRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Evaluates real-time neural EEG intent, detecting coercion or synthetic replay."""
    try:
        verdict = neural_bci_guard.evaluate_neural_intent(
            operator_id=body.operator_id,
            p300_amplitude_uv=body.p300_amplitude_uv,
            n400_latency_ms=body.n400_latency_ms,
            cognitive_stress_index=body.cognitive_stress_index,
            synthetic_replay_flag=body.synthetic_replay_flag or False,
        )
        return {"status": "success", "evaluation": verdict}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/issue-svid")
@limiter.limit("30/minute")
async def issue_svid_endpoint(
    request: Request,
    body: IssueSvidRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Issues an ephemeral post-quantum SVID token bound to verified neural intent."""
    try:
        res = neural_bci_guard.issue_pqc_neural_svid(body.operator_id)
        return {"status": "success", "svid": res}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_bci_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Returns fleet metrics for all neural BCI zero-trust gates."""
    return {"status": "success", "metrics": neural_bci_guard.get_bci_metrics()}

