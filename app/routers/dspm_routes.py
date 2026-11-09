"""
FastAPI Router for Autonomous Cloud Data Security Posture Management (DSPM).
"""

from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.dspm.dspm_service import dspm_service

router = APIRouter(prefix="/dspm", tags=["Data Security Posture Management (DSPM)"])


class ScanDataStoreRequest(BaseModel):
    store_id: str = Field(
        ..., description="Bucket or database identifier (e.g. s3-prod-customer-data)"
    )
    cloud_provider: str = Field("AWS", description="AWS, GCP, Azure, or Self-Hosted")
    store_type: str = Field(
        "OBJECT_STORAGE", description="OBJECT_STORAGE, RDS_DATABASE, BLOB_STORAGE"
    )
    sample_records: List[str] = Field(
        ..., description="Sample data objects or rows to inspect and classify"
    )
    is_public: bool = Field(
        False, description="Whether data store allows public read access"
    )
    encryption_enabled: bool = Field(
        False, description="Whether encryption at rest with KMS is enabled"
    )
    region: str = Field("us-east-1", description="Cloud region of storage asset")


class RemediationPlanRequest(BaseModel):
    scan_result: Dict[str, Any] = Field(..., description="Completed DSPM scan result")


@router.post("/scan")
@limiter.limit("60/minute")
async def scan_data_store_endpoint(
    request: Request,
    payload: ScanDataStoreRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Scans a cloud storage asset or database for PII, PCI-DSS, HIPAA, and credential exposure.
    """
    user_id = str(current_user.get("sub", "DSPM-Auditor"))
    org_id = str(current_user.get("org", "system"))

    try:
        report = dspm_service.scan_data_store(
            store_id=payload.store_id,
            cloud_provider=payload.cloud_provider,
            store_type=payload.store_type,
            sample_records=payload.sample_records,
            is_public=payload.is_public,
            encryption_enabled=payload.encryption_enabled,
            region=payload.region,
            actor=user_id,
            org_id=org_id,
        )
        return {
            "status": "success",
            "dspm_report": report,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/lineage")
@limiter.limit("60/minute")
async def get_data_lineage_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Returns data lineage and cross-boundary egress flow graph.
    """
    return {
        "status": "success",
        "lineage": dspm_service.get_data_lineage_graph(),
    }


@router.post("/remediation-plan")
@limiter.limit("60/minute")
async def generate_remediation_plan_endpoint(
    request: Request,
    payload: RemediationPlanRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Generates automated Terraform HCL and CLI commands for data store remediation.
    """
    try:
        plan = dspm_service.generate_remediation_plan(payload.scan_result)
        return {
            "status": "success",
            "remediation_plan": plan,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
