"""
FastAPI Router for Sovereign Air-Gapped Offline LLM Ingestion & Model Fine-Tuning Fabric.
"""

from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.airgap_llm_guard.airgap_llm_guard_service import (
    airgap_llm_guard_service,
)

router = APIRouter(
    prefix="/airgap-llm-guard",
    tags=["Sovereign Air-Gapped Offline LLM Ingestion"],
)


class ScanModelRequest(BaseModel):
    model_name: str = Field(..., description="Model identifier / repository label")
    format_type: Optional[str] = "SAFETENSORS"
    base_architecture: Optional[str] = "Llama3-8B"
    parameters_billions: Optional[float] = 8.0
    raw_hash_seed: Optional[str] = None


class ValidateLoRARequest(BaseModel):
    model_id: str
    lora_rank: Optional[int] = 16
    epsilon: Optional[float] = 0.85
    delta: Optional[float] = 1e-6


class SealModelRequest(BaseModel):
    model_id: str


@router.get("/models")
@limiter.limit("60/minute")
async def list_models_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all scanned and ingested sovereign models."""
    return {"status": "success", "models": airgap_llm_guard_service.list_models()}


@router.get("/models/{model_id}")
@limiter.limit("60/minute")
async def get_model_endpoint(
    request: Request,
    model_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves details of a specific ingested model."""
    model = airgap_llm_guard_service.get_model(model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    return {"status": "success", "model": model}


@router.post("/scan-artifact")
@limiter.limit("30/minute")
async def scan_artifact_endpoint(
    request: Request,
    payload: ScanModelRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Scans weights for pickle exploits, neural backdoors, and trigger phrase injection."""
    model = airgap_llm_guard_service.scan_model_artifact(
        model_name=payload.model_name,
        format_type=payload.format_type or "SAFETENSORS",
        base_architecture=payload.base_architecture or "Llama3-8B",
        parameters_billions=payload.parameters_billions or 8.0,
        raw_hash_seed=payload.raw_hash_seed,
    )
    return {"status": "success", "model": model}


@router.post("/validate-lora")
@limiter.limit("30/minute")
async def validate_lora_endpoint(
    request: Request,
    payload: ValidateLoRARequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Mathematically validates Differential Privacy bounds on fine-tuning weights."""
    try:
        res = airgap_llm_guard_service.validate_lora_privacy(
            model_id=payload.model_id,
            lora_rank=payload.lora_rank or 16,
            epsilon=payload.epsilon or 0.85,
            delta=payload.delta or 1e-6,
        )
        return {"status": "success", "validation": res}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/seal-enclave")
@limiter.limit("30/minute")
async def seal_enclave_endpoint(
    request: Request,
    payload: SealModelRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Issues cryptographic authorization seal for air-gapped enclave loading."""
    try:
        res = airgap_llm_guard_service.seal_and_authorize_enclave_load(payload.model_id)
        return {"status": "success", "seal": res}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves air-gapped sovereign model stats and differential privacy metrics."""
    return {
        "status": "success",
        "metrics": airgap_llm_guard_service.get_airgap_metrics(),
    }
