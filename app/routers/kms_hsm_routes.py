"""
FastAPI Router for Sovereign KMS HSM & Shamir's Secret Sharing Quorum.
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.kms_hsm.kms_hsm_service import kms_hsm_service

router = APIRouter(prefix="/kms-hsm", tags=["Sovereign KMS HSM & Shamir's Secret Sharing"])


class RotateKeyRequest(BaseModel):
    key_id: str = Field(..., description="Target HSM Key ID to rotate")


class ZeroizeKeyRequest(BaseModel):
    key_id: str = Field(..., description="Target HSM Key ID to zeroize")


class SplitSecretRequest(BaseModel):
    secret: str = Field(..., description="Sensitive secret string to split into threshold shares")
    n_shares: Optional[int] = Field(5, description="Total number of custodian shares to generate")
    k_threshold: Optional[int] = Field(3, description="Minimum number of shares required to reconstruct")
    custodians: Optional[List[str]] = Field(None, description="Custom custodian labels")


class ReconstructSecretRequest(BaseModel):
    shares: List[str] = Field(..., description="List of at least k threshold shares to reconstruct the secret")


@router.get("/keys")
@limiter.limit("60/minute")
async def list_keys_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Lists all managed HSM cryptographic keys and their lifecycle status."""
    return {"status": "success", "keys": kms_hsm_service.list_keys()}


@router.post("/rotate-key")
@limiter.limit("20/minute")
async def rotate_key_endpoint(
    request: Request,
    payload: RotateKeyRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Rotates an HSM cryptographic key and increments its version in hardware storage."""
    user_id = str(current_user.get("sub", "SecOpsDirector"))
    try:
        res = kms_hsm_service.rotate_key(key_id=payload.key_id, operator=user_id)
        return {"status": "success", "result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/zeroize-key")
@limiter.limit("10/minute")
async def zeroize_key_endpoint(
    request: Request,
    payload: ZeroizeKeyRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Cryptographically zeroizes (destroys) a sensitive key in the HSM enclave."""
    user_id = str(current_user.get("sub", "CISO-CryptographicOfficer"))
    try:
        res = kms_hsm_service.zeroize_key(key_id=payload.key_id, operator=user_id)
        return {"status": "success", "result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/split-secret")
@limiter.limit("30/minute")
async def split_secret_endpoint(
    request: Request,
    payload: SplitSecretRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Splits a sensitive secret into 'n' discrete shares requiring 'k' threshold quorum to reconstruct."""
    try:
        res = kms_hsm_service.split_secret(
            secret=payload.secret,
            n_shares=payload.n_shares or 5,
            k_threshold=payload.k_threshold or 3,
            custodians=payload.custodians,
        )
        return {"status": "success", "split_result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/reconstruct-secret")
@limiter.limit("30/minute")
async def reconstruct_secret_endpoint(
    request: Request,
    payload: ReconstructSecretRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Reconstructs the original secret from 'k' threshold custodian shares using Lagrange Interpolation."""
    try:
        res = kms_hsm_service.reconstruct_secret(shares=payload.shares)
        return {"status": "success", "reconstructed": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

