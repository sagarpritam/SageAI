"""
SageAI Multi-Region Zero Data Egress & Sovereign Enclave API Router.

Provides endpoints for:
1. Querying active regional sovereign enclaves (US, EU, APAC).
2. Client-side envelope encryption and decryption with AES-256-GCM.
3. Zero-egress sanitization and secret tokenization.
4. Autonomous multi-region sovereignty verification drills anchored to the Merkle audit chain.
"""

from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.enclave.zero_egress_service import (
    REGIONAL_ENCLAVES,
    zero_egress_service,
)

router = APIRouter(prefix="/enclave", tags=["Zero Egress & Sovereign Enclave"])


class EncryptPayloadRequest(BaseModel):
    plaintext: str = Field(
        ..., description="Sensitive data to encrypt inside regional enclave"
    )
    enclave_key: str = Field(..., description="Client enclave passphrase (min 8 chars)")
    region: Optional[str] = Field("eu-central-1", description="Target sovereign region")


class DecryptPayloadRequest(BaseModel):
    envelope: Dict[str, Any] = Field(..., description="AES-256-GCM envelope dictionary")
    enclave_key: str = Field(..., description="Client enclave passphrase")


class SanitizeEgressRequest(BaseModel):
    text: str = Field(
        ..., description="Payload, logs, or prompt to scrub for zero-egress compliance"
    )


@router.get("/regions")
@limiter.limit("60/minute")
async def list_sovereign_regions(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Returns list of active regional sovereign enclaves and compliance certifications.
    """
    return {
        "status": "success",
        "total_enclaves": len(REGIONAL_ENCLAVES),
        "enclaves": zero_egress_service.get_enclave_regions(),
    }


@router.post("/encrypt")
@limiter.limit("60/minute")
async def encrypt_enclave_data(
    request: Request,
    payload: EncryptPayloadRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Encrypts a payload using AES-256-GCM envelope encryption bounded to the selected sovereign region.
    """
    try:
        envelope = zero_egress_service.encrypt_payload(
            plaintext=payload.plaintext,
            enclave_key=payload.enclave_key,
            region=payload.region or "eu-central-1",
        )
        return {
            "status": "success",
            "envelope": envelope,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/decrypt")
@limiter.limit("60/minute")
async def decrypt_enclave_data(
    request: Request,
    payload: DecryptPayloadRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Decrypts an envelope inside the ephemeral enclave boundary.
    """
    try:
        decrypted = zero_egress_service.decrypt_payload(
            envelope=payload.envelope,
            enclave_key=payload.enclave_key,
        )
        return {
            "status": "success",
            "plaintext": decrypted,
        }
    except ValueError as ve:
        raise HTTPException(status_code=403, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/sanitize-egress")
@limiter.limit("60/minute")
async def sanitize_payload_for_egress(
    request: Request,
    payload: SanitizeEgressRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Sanitizes raw logs or prompts before cross-regional or external egress.
    Replaces credentials with zero-leakage enclave tokens.
    """
    return zero_egress_service.sanitize_and_tokenize(payload.text)


@router.post("/verify-sovereignty")
@limiter.limit("10/minute")
async def verify_sovereignty_drill(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Executes a multi-region sovereignty verification drill across all regional boundaries.
    Anchors proof into the cryptographic Merkle audit ledger.
    """
    org_id = str(current_user.get("org", "system"))
    user_id = str(current_user.get("sub", "EnclaveAuditor"))

    result = await zero_egress_service.verify_regional_sovereignty(
        org_id=org_id,
        actor=user_id,
    )
    return result
