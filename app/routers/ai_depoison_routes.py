"""
FastAPI Router for Autonomous Sovereign AI Model De-Poisoning & LoRA Backdoor Extraction.
"""

from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.ai_depoison.ai_depoison_engine import ai_model_depoison_engine

router = APIRouter(
    prefix="/ai-depoison",
    tags=["Autonomous Sovereign AI Model De-Poisoning & LoRA Backdoor Extraction"],
)


class ScanAdapterRequest(BaseModel):
    adapter_id: str = Field(..., description="Target fine-tuned LoRA adapter identifier")
    anomaly_threshold: float = Field(10.0, description="Activation sparsity anomaly threshold percentage")


class ExciseBackdoorRequest(BaseModel):
    adapter_id: str = Field(..., description="Target adapter to ablate backdoor neurons and excise weights")


@router.get("/adapters")
@limiter.limit("60/minute")
async def list_adapters_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all monitored fine-tuned LoRA adapters."""
    return {"status": "success", "adapters": ai_model_depoison_engine.list_adapters()}


@router.get("/adapters/{adapter_id}")
@limiter.limit("60/minute")
async def get_adapter_endpoint(
    request: Request,
    adapter_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves details of a specific fine-tuned LoRA adapter."""
    adapter = ai_model_depoison_engine.get_adapter(adapter_id)
    if not adapter:
        raise HTTPException(status_code=404, detail="LoRA adapter not found")
    return {"status": "success", "adapter": adapter}


@router.post("/scan")
@limiter.limit("60/minute")
async def scan_adapter_endpoint(
    request: Request,
    body: ScanAdapterRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Scans adapter weight matrices for latent sleeper agent trojan triggers."""
    try:
        verdict = ai_model_depoison_engine.scan_adapter_for_poison(
            adapter_id=body.adapter_id,
            anomaly_threshold=body.anomaly_threshold,
        )
        return {"status": "success", "scan": verdict}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/excise-backdoor")
@limiter.limit("30/minute")
async def excise_backdoor_endpoint(
    request: Request,
    body: ExciseBackdoorRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Executes surgical rank-1 neuron ablation to excise backdoor weights without full retraining."""
    try:
        result = ai_model_depoison_engine.excise_backdoor_weights(body.adapter_id)
        return {"status": "success", "excision": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_depoison_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Returns AI model de-poisoning and trojan weight ablation metrics."""
    return {"status": "success", "metrics": ai_model_depoison_engine.get_depoison_metrics()}

