"""
FastAPI Router for Autonomous Self-Evolving Defensive AI Immune System with Dynamic Neural Mutation.
"""

from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.ai_immune_defense.ai_immune_mutation_guard import ai_immune_mutation_guard

router = APIRouter(
    prefix="/ai-immune",
    tags=["Self-Evolving AI Immune System & Neural Mutation"],
)


class EvaluatePromptRequest(BaseModel):
    model_id: str = Field(..., description="Target model identifier")
    prompt: str = Field(..., description="Prompt payload for latent immune evaluation")


class SynthesizeAntibodyRequest(BaseModel):
    model_id: str = Field(..., description="Target model identifier")
    attack_signature: str = Field(..., description="Adversarial pattern or signature")
    attack_type: Optional[str] = Field("LATENT_ADVERSARIAL_PERTURBATION", description="Attack classification")


@router.get("/models")
@limiter.limit("60/minute")
async def list_models_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all AI models protected under the AI Immune System."""
    return {"status": "success", "models": ai_immune_mutation_guard.list_models()}


@router.get("/models/{model_id}")
@limiter.limit("60/minute")
async def get_model_endpoint(
    request: Request,
    model_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves defense state and parameters of a specific AI model."""
    model = ai_immune_mutation_guard.get_model(model_id)
    if not model:
        raise HTTPException(status_code=404, detail="AI Model not found")
    return {"status": "success", "model": model}


@router.post("/evaluate-prompt")
@limiter.limit("60/minute")
async def evaluate_prompt_endpoint(
    request: Request,
    body: EvaluatePromptRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Evaluates prompt against latent space antibodies and applies dynamic neural micro-mutation."""
    try:
        res = ai_immune_mutation_guard.evaluate_prompt_immune_response(body.model_id, body.prompt)
        return {"status": "success", "evaluation": res}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/synthesize-antibody")
@limiter.limit("30/minute")
async def synthesize_antibody_endpoint(
    request: Request,
    body: SynthesizeAntibodyRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Synthesizes a digital lymphocyte antibody to permanently inoculate an AI model."""
    try:
        res = ai_immune_mutation_guard.synthesize_antibody(
            model_id=body.model_id,
            attack_signature=body.attack_signature,
            attack_type=body.attack_type or "LATENT_ADVERSARIAL_PERTURBATION",
        )
        return {"status": "success", "antibody": res}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_immune_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Returns fleet metrics for the self-evolving AI Immune System."""
    return {"status": "success", "metrics": ai_immune_mutation_guard.get_immune_metrics()}

