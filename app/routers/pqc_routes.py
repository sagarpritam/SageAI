"""
FastAPI Router for Post-Quantum Cryptography (PQC) & Hybrid Migration Layer.
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.crypto.pqc_service import pqc_service

router = APIRouter(prefix="/pqc", tags=["Post-Quantum Cryptography & ML-KEM/ML-DSA"])


class EncapsulateRequest(BaseModel):
    classical_public_key: str = Field(..., description="Base64-encoded X25519 public key")
    ml_kem_public_key: str = Field(..., description="Base64-encoded ML-KEM-768 public key")


class EncryptPQCRequest(BaseModel):
    plaintext: str = Field(..., description="Sensitive data to encrypt with quantum-safe hybrid key")
    classical_public_key: str = Field(..., description="Base64-encoded X25519 public key")
    ml_kem_public_key: str = Field(..., description="Base64-encoded ML-KEM-768 public key")


class DecryptPQCRequest(BaseModel):
    envelope: Dict[str, Any] = Field(..., description="Quantum-safe encrypted envelope dictionary")
    classical_private_key: str = Field(..., description="Base64-encoded X25519 private key")
    ml_kem_public_key: str = Field(..., description="Base64-encoded ML-KEM-768 public key")


class ScanCiphersuitesRequest(BaseModel):
    ciphersuites: List[str] = Field(..., description="List of TLS ciphersuites to evaluate for HNDL risk")


@router.post("/generate-keys")
@limiter.limit("60/minute")
async def generate_hybrid_pqc_keys(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Generates a dual Classical (X25519) + Post-Quantum (ML-KEM-768) Hybrid Keypair.
    """
    return {
        "status": "success",
        "keypair": pqc_service.generate_hybrid_keypair(),
    }


@router.post("/encapsulate")
@limiter.limit("60/minute")
async def encapsulate_shared_secret(
    request: Request,
    payload: EncapsulateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Encapsulates a shared secret using Hybrid X25519 + ML-KEM-768.
    """
    try:
        result = pqc_service.encapsulate_secret(
            classical_public_key_b64=payload.classical_public_key,
            ml_kem_public_key_b64=payload.ml_kem_public_key,
        )
        return {
            "status": "success",
            "encapsulation": result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/encrypt")
@limiter.limit("60/minute")
async def encrypt_payload_quantum_safe(
    request: Request,
    payload: EncryptPQCRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Encrypts a payload using quantum-safe hybrid key encapsulation and AES-256-GCM.
    """
    try:
        envelope = pqc_service.encrypt_quantum_safe(
            plaintext=payload.plaintext,
            classical_public_key_b64=payload.classical_public_key,
            ml_kem_public_key_b64=payload.ml_kem_public_key,
        )
        return {
            "status": "success",
            "envelope": envelope,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/decrypt")
@limiter.limit("60/minute")
async def decrypt_payload_quantum_safe(
    request: Request,
    payload: DecryptPQCRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Decrypts a quantum-safe envelope using recipient hybrid private keys.
    """
    try:
        decrypted = pqc_service.decrypt_quantum_safe(
            envelope=payload.envelope,
            classical_private_key_b64=payload.classical_private_key,
            ml_kem_public_key_b64=payload.ml_kem_public_key,
        )
        return {
            "status": "success",
            "plaintext": decrypted,
        }
    except ValueError as ve:
        raise HTTPException(status_code=403, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/scan-risk")
@limiter.limit("30/minute")
async def scan_tls_quantum_risk(
    request: Request,
    payload: ScanCiphersuitesRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Audits TLS ciphersuites for Harvest-Now-Decrypt-Later (HNDL) exposure and quantum readiness.
    """
    org_id = str(current_user.get("org", "system"))
    user_id = str(current_user.get("sub", "PQC-Auditor"))

    result = pqc_service.scan_ciphersuite_quantum_risk(
        ciphersuites=payload.ciphersuites,
        actor=user_id,
        org_id=org_id,
    )
    return result

