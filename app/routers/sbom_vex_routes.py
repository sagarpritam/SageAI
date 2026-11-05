"""
FastAPI Router for SBOM & OpenVEX Attestation Engine.
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.supply_chain.sbom_vex_engine import sbom_vex_engine

router = APIRouter(prefix="/sbom-vex", tags=["SBOM & OpenVEX Attestation"])


class CustomVexRequest(BaseModel):
    vulnerabilities: Optional[List[str]] = Field(None, description="CVE IDs to evaluate in OpenVEX document")


class CustomSLSARequest(BaseModel):
    artifact_name: Optional[str] = Field("sageai-core.tar.gz", description="Target build artifact name")


@router.get("/cyclonedx")
@limiter.limit("60/minute")
async def get_cyclonedx_sbom_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Generates CycloneDX 1.5 JSON Software Bill of Materials."""
    return sbom_vex_engine.generate_cyclonedx_sbom()


@router.get("/spdx")
@limiter.limit("60/minute")
async def get_spdx_sbom_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Generates SPDX 2.3 JSON Software Bill of Materials."""
    return sbom_vex_engine.generate_spdx_sbom()


@router.get("/openvex")
@limiter.limit("60/minute")
async def get_openvex_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Generates OpenVEX v0.2.0 Exploitability Attestation document."""
    return sbom_vex_engine.generate_openvex()


@router.post("/openvex")
@limiter.limit("60/minute")
async def post_custom_openvex_endpoint(
    request: Request,
    payload: CustomVexRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Generates an OpenVEX document for specified CVE vulnerabilities."""
    return sbom_vex_engine.generate_openvex(vulnerabilities=payload.vulnerabilities)


@router.get("/slsa")
@limiter.limit("60/minute")
async def get_slsa_provenance_endpoint(
    request: Request,
    artifact_name: Optional[str] = "sageai-core.tar.gz",
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Generates SLSA Level 3 Cryptographic Build Provenance."""
    return sbom_vex_engine.generate_slsa_provenance(artifact_name=artifact_name or "sageai-core.tar.gz")

