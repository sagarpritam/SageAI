"""
FastAPI Router for UEFI Secure Boot & SPI Flash Hash Attestor.
"""

from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.firmware_attestation.firmware_integrity_guard import firmware_integrity_guard

router = APIRouter(
    prefix="/firmware-attestation",
    tags=["UEFI Secure Boot & SPI Flash Firmware Attestation"],
)


class AttestFirmwareRequest(BaseModel):
    device_id: str = Field(..., description="Target node identifier")
    pcr0_sha256: str = Field(..., description="TPM 2.0 PCR0 Core Root of Trust measurement")
    pcr2_sha256: str = Field(..., description="TPM 2.0 PCR2 Option ROM measurement")
    spi_flash_sha256: str = Field(..., description="Physical SPI Flash ROM image hash")
    secure_boot_enabled: Optional[bool] = True


class QuarantineRequest(BaseModel):
    device_id: str


@router.get("/devices")
@limiter.limit("60/minute")
async def list_devices_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all monitored hardware devices and firmware status."""
    return {"status": "success", "devices": firmware_integrity_guard.list_devices()}


@router.get("/devices/{device_id}")
@limiter.limit("60/minute")
async def get_device_endpoint(
    request: Request,
    device_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves details of a specific hardware node."""
    dev = firmware_integrity_guard.get_device(device_id)
    if not dev:
        raise HTTPException(status_code=404, detail="Device not found")
    return {"status": "success", "device": dev}


@router.post("/attest")
@limiter.limit("30/minute")
async def attest_firmware_endpoint(
    request: Request,
    payload: AttestFirmwareRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Attests TPM 2.0 PCRs and SPI flash against OEM golden baselines."""
    try:
        res = firmware_integrity_guard.attest_firmware(
            device_id=payload.device_id,
            pcr0_sha256=payload.pcr0_sha256,
            pcr2_sha256=payload.pcr2_sha256,
            spi_flash_sha256=payload.spi_flash_sha256,
            secure_boot_enabled=payload.secure_boot_enabled if payload.secure_boot_enabled is not None else True
        )
        return {"status": "success", "attestation": res}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/quarantine")
@limiter.limit("20/minute")
async def quarantine_endpoint(
    request: Request,
    payload: QuarantineRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Executes IPMI chassis power down and hardware port isolation for compromised bootkits."""
    try:
        res = firmware_integrity_guard.quarantine_device(payload.device_id)
        return {"status": "success", "result": res}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves firmware attestation fleet metrics."""
    return {"status": "success", "metrics": firmware_integrity_guard.get_metrics()}

