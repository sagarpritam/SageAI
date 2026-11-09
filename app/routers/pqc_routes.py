"""
FastAPI Router for Post-Quantum Cryptography (PQC) & Hybrid Migration Layer.
"""

from typing import Any, Dict, List

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


class SignPayloadRequest(BaseModel):
    message: str = Field(..., description="Message or payload to digitally sign")
    classical_private_key: str = Field(..., description="Base64-encoded Ed25519 private key")
    ml_dsa_private_key: str = Field(..., description="Base64-encoded ML-DSA-65 private key")
    ml_dsa_public_key: str = Field(..., description="Base64-encoded ML-DSA-65 public key")


class VerifySignatureRequest(BaseModel):
    message: str = Field(..., description="Original message or payload")
    hybrid_signature: Dict[str, Any] = Field(..., description="Hybrid signature payload object")
    classical_public_key: str = Field(..., description="Base64-encoded Ed25519 public key")
    ml_dsa_public_key: str = Field(..., description="Base64-encoded ML-DSA-65 public key")


class SealZeroEgressRequest(BaseModel):
    plaintext: str = Field(..., description="Raw sensitive payload to sanitize, encapsulate, and seal")
    destination_region: str = Field("eu-central-1", description="Destination sovereign enclave region")
    sender_classical_signing_priv: str = Field(..., description="Base64-encoded Ed25519 signing private key")
    sender_ml_dsa_priv: str = Field(..., description="Base64-encoded ML-DSA-65 private key")
    sender_ml_dsa_pub: str = Field(..., description="Base64-encoded ML-DSA-65 public key")
    recipient_classical_pub: str = Field(..., description="Base64-encoded X25519 public key of recipient")
    recipient_ml_kem_pub: str = Field(..., description="Base64-encoded ML-KEM-768 public key of recipient")


class UnsealZeroEgressRequest(BaseModel):
    pqc_envelope: Dict[str, Any] = Field(..., description="Quantum-safe sealed zero-egress envelope")
    recipient_classical_priv: str = Field(..., description="Base64-encoded X25519 private key of recipient")
    recipient_ml_kem_pub: str = Field(..., description="Base64-encoded ML-KEM-768 public key of recipient")
    sender_classical_pub: str = Field(..., description="Base64-encoded Ed25519 public key of sender")
    sender_ml_dsa_pub: str = Field(..., description="Base64-encoded ML-DSA-65 public key of sender")
    current_region: str = Field("eu-central-1", description="Current regional enclave boundary")


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


@router.post("/generate-signing-keys")
@limiter.limit("60/minute")
async def generate_hybrid_signing_keys(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Generates a dual Classical (Ed25519) + Post-Quantum (ML-DSA-65 / Dilithium-3) Hybrid Signing Keypair.
    """
    return {
        "status": "success",
        "keypair": pqc_service.generate_hybrid_signing_keypair(),
    }


@router.post("/sign")
@limiter.limit("60/minute")
async def sign_hybrid_payload_route(
    request: Request,
    payload: SignPayloadRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Digitally signs a message using dual Classical Ed25519 and Post-Quantum ML-DSA-65 (Dilithium-3).
    """
    try:
        signature = pqc_service.sign_hybrid_payload(
            message=payload.message,
            classical_private_key_b64=payload.classical_private_key,
            ml_dsa_private_key_b64=payload.ml_dsa_private_key,
            ml_dsa_public_key_b64=payload.ml_dsa_public_key,
        )
        return {
            "status": "success",
            "signature": signature,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/verify-signature")
@limiter.limit("60/minute")
async def verify_hybrid_signature_route(
    request: Request,
    payload: VerifySignatureRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Cryptographically verifies both the Ed25519 and ML-DSA-65 signatures.
    """
    try:
        is_valid = pqc_service.verify_hybrid_signature(
            message=payload.message,
            hybrid_signature=payload.hybrid_signature,
            classical_public_key_b64=payload.classical_public_key,
            ml_dsa_public_key_b64=payload.ml_dsa_public_key,
        )
        return {
            "status": "success",
            "valid": is_valid,
            "details": "Dual Ed25519 and NIST FIPS 204 ML-DSA-65 signatures verified" if is_valid else "Signature rejected",
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/zero-egress/seal")
@limiter.limit("30/minute")
async def seal_zero_egress_pqc_route(
    request: Request,
    payload: SealZeroEgressRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Sanitizes, hybrid encapsulates (ML-KEM-768), and digitally signs (ML-DSA-65) a zero-egress payload.
    """
    user_id = str(current_user.get("sub", "PQC-Enclave-Officer"))
    org_id = str(current_user.get("org", "system"))

    try:
        sealed = pqc_service.seal_zero_egress_pqc_payload(
            plaintext=payload.plaintext,
            destination_region=payload.destination_region,
            sender_classical_signing_priv_b64=payload.sender_classical_signing_priv,
            sender_ml_dsa_priv_b64=payload.sender_ml_dsa_priv,
            sender_ml_dsa_pub_b64=payload.sender_ml_dsa_pub,
            recipient_classical_pub_b64=payload.recipient_classical_pub,
            recipient_ml_kem_pub_b64=payload.recipient_ml_kem_pub,
            actor=user_id,
            org_id=org_id,
        )
        return {
            "status": "success",
            "sealed_envelope": sealed,
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/zero-egress/unseal")
@limiter.limit("30/minute")
async def unseal_zero_egress_pqc_route(
    request: Request,
    payload: UnsealZeroEgressRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Unseals, verifies ML-DSA-65 signature, and decrypts zero-egress payload inside target enclave.
    """
    user_id = str(current_user.get("sub", "PQC-Enclave-Officer"))
    org_id = str(current_user.get("org", "system"))

    try:
        unsealed = pqc_service.unseal_zero_egress_pqc_payload(
            pqc_envelope=payload.pqc_envelope,
            recipient_classical_priv_b64=payload.recipient_classical_priv,
            recipient_ml_kem_pub_b64=payload.recipient_ml_kem_pub,
            sender_classical_pub_b64=payload.sender_classical_pub,
            sender_ml_dsa_pub_b64=payload.sender_ml_dsa_pub,
            current_region=payload.current_region,
            actor=user_id,
            org_id=org_id,
        )
        return {
            "status": "success",
            "unsealed_result": unsealed,
        }
    except ValueError as ve:
        raise HTTPException(status_code=403, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

