"""
FastAPI Router for Autonomous Cloud IaC Drift Reconciliation & PR Generator Engine.
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.cloud_posture.iac_drift_engine import iac_drift_engine

router = APIRouter(prefix="/iac-drift", tags=["Cloud IaC Drift & Remediation"])


class ScanDriftRequest(BaseModel):
    declared_resources: Optional[List[Dict[str, Any]]] = Field(None, description="Custom declared IaC resources")
    live_resources: Optional[List[Dict[str, Any]]] = Field(None, description="Custom live cloud runtime assets")


class GeneratePRRequest(BaseModel):
    drift_ids: List[str] = Field(..., description="List of drift IDs to include in remediation PR")
    branch_name: Optional[str] = Field("sageai/iac-auto-remediation", description="Target Git branch name")


@router.get("/scan")
@limiter.limit("60/minute")
async def get_iac_drift_scan_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Scans and compares declared IaC against live cloud runtime infrastructure."""
    report = iac_drift_engine.scan_drift()
    return {"status": "success", "drift_report": report}


@router.post("/scan")
@limiter.limit("60/minute")
async def post_iac_drift_scan_endpoint(
    request: Request,
    payload: ScanDriftRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Executes IaC drift analysis against custom declared manifests and runtime assets."""
    report = iac_drift_engine.scan_drift(
        declared_resources=payload.declared_resources,
        live_resources=payload.live_resources,
    )
    return {"status": "success", "drift_report": report}


@router.post("/generate-pr")
@limiter.limit("30/minute")
async def generate_pr_endpoint(
    request: Request,
    payload: GeneratePRRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Generates an automated Git PR payload with Terraform HCL / Helm reconciliation patches."""
    try:
        pr_result = iac_drift_engine.generate_git_pr(
            drift_ids=payload.drift_ids,
            branch_name=payload.branch_name or "sageai/iac-auto-remediation",
        )
        return {"status": "success", "pull_request": pr_result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

