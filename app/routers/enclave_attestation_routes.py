"""
FastAPI Router for Confidential Hardware Enclave Remote Attestation.
"""

from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.enclave_attestation.hardware_attestation_service import (
    hardware_attestation_service,
)

router = APIRouter(
    prefix="/enclave-attestation",
    tags=["Hardware Enclave Remote Attestation"],
)


class VerifyAttestationRequest(BaseModel):
    platform: str = Field(..., description="Platform: AWS_NITRO, AMD_SEV_SNP, or INTEL_SGX")
    attestation_doc_b64: Optional[str] = Field(None, description="Base64 encoded AWS Nitro attestation doc")
    report_hex: Optional[str] = Field(None, description="Hex encoded AMD SEV-SNP report")
    quote_hex: Optional[str] = Field(None, description="Hex encoded Intel SGX quote")
    expected_pcr0: Optional[str] = None


class UnsealSecretRequest(BaseModel):
    platform: str = Field(..., description="Platform: AWS_NITRO, AMD_SEV_SNP, or INTEL_SGX")
    secret_id: str = Field(..., description="ID of protected sovereign secret to unseal")
    attestation_doc_b64: Optional[str] = None
    report_hex: Optional[str] = None
    quote_hex: Optional[str] = None


class RegisterGoldenMeasurementRequest(BaseModel):
    platform: str
    measurement_key: str
    expected_hash: str


@router.get("/golden-measurements")
@limiter.limit("60/minute")
async def get_golden_measurements_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves active Golden Reference Measurements for verified enclaves."""
    return hardware_attestation_service.get_golden_measurements()


@router.post("/golden-measurements")
@limiter.limit("30/minute")
async def register_golden_measurement_endpoint(
    request: Request,
    payload: RegisterGoldenMeasurementRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Registers or updates a Golden Reference Measurement."""
    return hardware_attestation_service.register_golden_measurement(
        platform=payload.platform,
        measurement_key=payload.measurement_key,
        expected_hash=payload.expected_hash,
        operator=current_user.get("email", "SecOpsAdmin"),
    )


@router.post("/verify")
@limiter.limit("60/minute")
async def verify_attestation_endpoint(
    request: Request,
    payload: VerifyAttestationRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Verifies a hardware enclave attestation document or quote."""
    plat = payload.platform.upper()
    if plat == "AWS_NITRO":
        if not payload.attestation_doc_b64:
            raise HTTPException(status_code=400, detail="Missing attestation_doc_b64")
        return hardware_attestation_service.verify_nitro_attestation(
            attestation_doc_b64=payload.attestation_doc_b64,
            expected_pcr0=payload.expected_pcr0,
        )
    elif plat == "AMD_SEV_SNP":
        if not payload.report_hex:
            raise HTTPException(status_code=400, detail="Missing report_hex")
        return hardware_attestation_service.verify_amd_sev_snp(
            report_hex=payload.report_hex,
            expected_measurement=payload.expected_pcr0,
        )
    elif plat == "INTEL_SGX":
        if not payload.quote_hex:
            raise HTTPException(status_code=400, detail="Missing quote_hex")
        return hardware_attestation_service.verify_intel_sgx_quote(quote_hex=payload.quote_hex)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported platform: {payload.platform}")


@router.post("/unseal")
@limiter.limit("30/minute")
async def unseal_secret_endpoint(
    request: Request,
    payload: UnsealSecretRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Unseals a sovereign secret if and only if hardware enclave attestation succeeds."""
    attestation_payload = {
        "attestation_doc_b64": payload.attestation_doc_b64,
        "report_hex": payload.report_hex,
        "quote_hex": payload.quote_hex,
    }
    return hardware_attestation_service.unseal_secret_with_attestation(
        platform=payload.platform,
        attestation_payload=attestation_payload,
        secret_id=payload.secret_id,
        operator=current_user.get("email", "WorkloadIdentity"),
    )

