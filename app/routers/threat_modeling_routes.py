"""
FastAPI Router for Automated Threat Modeling Engine (STRIDE + DREAD).
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.threat_modeling.threat_modeler import (
    threat_modeling_engine,
)

router = APIRouter(prefix="/threat-modeling", tags=["Threat Modeling & STRIDE Engine"])


class AnalyzeArchitectureRequest(BaseModel):
    components: List[Dict[str, Any]] = Field(..., description="System components, gateways, and data stores")
    data_flows: Optional[List[Dict[str, Any]]] = Field(None, description="Data flows and protocols")
    trust_boundaries: Optional[List[Dict[str, Any]]] = Field(None, description="Trust boundary definitions")


class ParseOpenAPIRequest(BaseModel):
    spec_text: str = Field(..., description="OpenAPI / Swagger JSON or YAML specification text")


class ParseIaCRequest(BaseModel):
    manifest_text: str = Field(..., description="Terraform HCL or Kubernetes YAML manifest text")


@router.get("/templates")
@limiter.limit("60/minute")
async def get_threat_model_templates(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Returns pre-packaged cloud and microservices architecture templates."""
    return {
        "status": "success",
        "templates": threat_modeling_engine.get_architecture_templates(),
    }


@router.post("/analyze")
@limiter.limit("30/minute")
async def analyze_system_threat_model(
    request: Request,
    payload: AnalyzeArchitectureRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Executes automated STRIDE + DREAD threat analysis.
    Generates prioritized remediation tickets and anchors into Merkle audit chain.
    """
    org_id = str(current_user.get("org", "system"))
    user_id = str(current_user.get("sub", "ThreatModeler"))

    result = threat_modeling_engine.analyze_architecture(
        components=payload.components,
        data_flows=payload.data_flows,
        trust_boundaries=payload.trust_boundaries,
        org_id=org_id,
        actor=user_id,
    )
    return result


@router.post("/parse-openapi")
@limiter.limit("30/minute")
async def parse_openapi_spec_endpoint(
    request: Request,
    payload: ParseOpenAPIRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Parses OpenAPI specification into architectural components for threat modeling."""
    return threat_modeling_engine.parse_openapi_spec(payload.spec_text)


@router.post("/parse-iac")
@limiter.limit("30/minute")
async def parse_iac_manifest_endpoint(
    request: Request,
    payload: ParseIaCRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Parses Terraform or Kubernetes manifest into architectural components for threat modeling."""
    return threat_modeling_engine.parse_iac_manifest(payload.manifest_text)

