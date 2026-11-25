"""
FastAPI Routes for Kashiwara-Schapira Sheaves on Manifolds & Microlocal Defect Shield (Capability 191).
"""

from typing import Any, Dict
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.core.security import get_current_user
from app.services.kashiwara_schapira_microlocal_shield import (
    get_kashiwara_schapira_microlocal_shield_service,
)

router = APIRouter(
    prefix="/api/kashiwara-schapira-microlocal",
    tags=["Kashiwara-Schapira Microlocal Shield"],
)


class EvaluateMicrolocalSupportRequest(BaseModel):
    sheaf_id: str = Field("KS-COTANGENT-BUNDLE-01", description="Identifier of the microlocal sheaf configuration")
    cotangent_order: int = Field(4, ge=1, le=16, description="Cotangent bundle filtration order")
    contact_gain: float = Field(1.25, ge=0.1, le=10.0, description="Contact Hamiltonian magnification gain")
    phase_cutoff: float = Field(1e-4, ge=1e-8, le=1.0, description="Singular support phase-space cutoff")


@router.get("/sheaves", summary="List Kashiwara-Schapira Microlocal Sheaves")
async def list_sheaves(_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    svc = get_kashiwara_schapira_microlocal_shield_service()
    return {"sheaves": svc.get_sheaves()}


@router.post("/evaluate-microlocal-support", summary="Evaluate Microlocal Singular Support & Involutivity")
async def evaluate_microlocal_support(
    req: EvaluateMicrolocalSupportRequest,
    _user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    svc = get_kashiwara_schapira_microlocal_shield_service()
    return svc.evaluate_microlocal_support(
        sheaf_id=req.sheaf_id,
        cotangent_order=req.cotangent_order,
        contact_gain=req.contact_gain,
        phase_cutoff=req.phase_cutoff,
    )


@router.get("/metrics", summary="Get Kashiwara-Schapira Shield Telemetry Metrics")
async def get_metrics(_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    svc = get_kashiwara_schapira_microlocal_shield_service()
    return svc.get_metrics()
