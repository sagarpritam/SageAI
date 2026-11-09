"""
FastAPI Router for Autonomous Cloud Security Posture Management (CSPM) & CIEM.
"""

from typing import Any, Dict, List

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.cloud_posture.cspm_service import cspm_service

router = APIRouter(prefix="/cspm", tags=["Cloud Security Posture Management & CIEM"])


class AuditCloudAssetsRequest(BaseModel):
    cloud_assets: List[Dict[str, Any]] = Field(
        ..., description="Cloud compute, storage, and IAM resources"
    )


class RemediationScriptRequest(BaseModel):
    finding_id: str = Field(..., description="Finding identifier")
    rule_id: str = Field(..., description="CIS Benchmark Rule identifier")


@router.post("/audit")
@limiter.limit("30/minute")
async def audit_cloud_posture(
    request: Request,
    payload: AuditCloudAssetsRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Audits cloud assets against CIS Benchmarks, detects toxic combinations and IAM escalation paths.
    """
    org_id = str(current_user.get("org", "system"))
    user_id = str(current_user.get("sub", "CSPM-Auditor"))

    result = cspm_service.evaluate_cis_benchmarks(
        cloud_assets=payload.cloud_assets,
        org_id=org_id,
        actor=user_id,
    )
    return result


@router.post("/remediation-script")
@limiter.limit("30/minute")
async def get_remediation_script(
    request: Request,
    payload: RemediationScriptRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Generates automated Terraform and AWS CLI / Boto3 remediation code."""
    script = cspm_service.generate_remediation_script(
        finding_id=payload.finding_id,
        rule_id=payload.rule_id,
    )
    return {
        "status": "success",
        "remediation": script,
    }
