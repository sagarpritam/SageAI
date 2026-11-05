"""
FastAPI Router for Zero-Knowledge Proof (ZKP) Compliance Attestation Engine.
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.zkp.zkp_attestation_service import zkp_attestation_service

router = APIRouter(prefix="/zkp", tags=["Zero-Knowledge Proof (ZKP) Compliance Attestation"])


class GenerateProofRequest(BaseModel):
    framework: Optional[str] = Field("SOC 2 Type II + FedRAMP High", description="Compliance framework to prove")
    org_id: Optional[str] = Field("enterprise-sovereign", description="Organization ID")


class VerifyProofRequest(BaseModel):
    proof_id: str = Field(..., description="Unique proof identifier")
    zk_proof: Dict[str, Any] = Field(..., description="Groth16 zk-SNARK proof coordinates (pi_a, pi_b, pi_c)")
    public_signals: Dict[str, Any] = Field(..., description="Public compliance signals and assertions")


@router.get("/proof")
@limiter.limit("60/minute")
async def get_default_proof_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Generates an authentic Groth16 zk-SNARK compliance proof for the default sovereign framework."""
    attestation = zkp_attestation_service.generate_compliance_proof()
    return {"status": "success", "attestation": attestation}


@router.post("/generate-proof")
@limiter.limit("30/minute")
async def generate_proof_endpoint(
    request: Request,
    payload: GenerateProofRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Synthesizes a succinct zero-knowledge compliance proof for external auditors without revealing raw telemetry."""
    attestation = zkp_attestation_service.generate_compliance_proof(
        framework=payload.framework or "SOC 2 Type II + FedRAMP High",
        org_id=payload.org_id or "enterprise-sovereign",
    )
    return {"status": "success", "attestation": attestation}


@router.post("/verify-proof")
@limiter.limit("60/minute")
async def verify_proof_endpoint(
    request: Request,
    payload: VerifyProofRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Mathematically verifies an elliptic curve pairing check over an auditor-submitted zk-SNARK proof."""
    res = zkp_attestation_service.verify_compliance_proof(
        proof_id=payload.proof_id,
        zk_proof=payload.zk_proof,
        public_signals=payload.public_signals,
    )
    return {"status": "success", "verification": res}

