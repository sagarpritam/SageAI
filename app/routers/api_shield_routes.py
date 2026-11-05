"""
FastAPI Router for API Security & Microservices Boundary Shield (BOLA/BFLA Engine).
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.api_security.api_shield_service import api_shield_service

router = APIRouter(prefix="/api-shield", tags=["API Security & Microservices Boundary Shield"])


class AuditEndpointsRequest(BaseModel):
    endpoints: Optional[List[Dict[str, Any]]] = Field(None, description="Custom microservices endpoints catalog to audit")


@router.get("/audit")
@limiter.limit("60/minute")
async def get_api_audit_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Audits default microservices API endpoints for BOLA, BFLA, and Mass Assignment vulnerabilities."""
    report = api_shield_service.audit_api_endpoints()
    return {"status": "success", "api_audit_report": report}


@router.post("/audit")
@limiter.limit("60/minute")
async def post_api_audit_endpoint(
    request: Request,
    payload: AuditEndpointsRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Audits custom microservices API endpoints against the OWASP API Security Top 10."""
    report = api_shield_service.audit_api_endpoints(endpoints=payload.endpoints)
    return {"status": "success", "api_audit_report": report}


@router.get("/opa-rego")
@limiter.limit("60/minute")
async def get_opa_rego_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Synthesizes an Open Policy Agent (OPA) Rego policy to enforce zero-trust API boundaries."""
    policy = api_shield_service.generate_opa_rego_policy()
    return {"status": "success", "opa_policy": policy}
