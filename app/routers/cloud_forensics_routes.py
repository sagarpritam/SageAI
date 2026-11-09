"""
FastAPI Router for Cloud Forensic Snapshot & RFC 3161 Timestamp Vault.
"""

from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.cloud_forensics.cloud_forensics_service import cloud_forensics_service

router = APIRouter(
    prefix="/cloud-forensics",
    tags=["Cloud Forensic Snapshot & RFC 3161 Timestamp Vault"],
)


class CreateSnapshotRequest(BaseModel):
    cloud_provider: str = Field(..., description="AWS, AZURE, or GCP")
    resource_id: str = Field(..., description="Volume ID or instance identifier")
    incident_id: str = Field(..., description="Associated security incident ID")
    volume_size_gb: Optional[int] = 64
    memory_capture: Optional[bool] = True


class SnapshotActionRequest(BaseModel):
    snapshot_id: str


@router.get("/snapshots")
@limiter.limit("60/minute")
async def list_snapshots_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all vaulted forensic snapshots and legal chains of custody."""
    return {"status": "success", "snapshots": cloud_forensics_service.list_snapshots()}


@router.get("/snapshots/{snapshot_id}")
@limiter.limit("60/minute")
async def get_snapshot_endpoint(
    request: Request,
    snapshot_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves details of a specific forensic snapshot."""
    snap = cloud_forensics_service.get_snapshot(snapshot_id)
    if not snap:
        raise HTTPException(status_code=404, detail="Snapshot not found")
    return {"status": "success", "snapshot": snap}


@router.post("/create-snapshot")
@limiter.limit("20/minute")
async def create_snapshot_endpoint(
    request: Request,
    payload: CreateSnapshotRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Captures an immediate cloud volume snapshot and issues an RFC 3161 timestamp."""
    snap = cloud_forensics_service.create_incident_snapshot(
        cloud_provider=payload.cloud_provider,
        resource_id=payload.resource_id,
        incident_id=payload.incident_id,
        volume_size_gb=payload.volume_size_gb or 64,
        memory_capture=payload.memory_capture
        if payload.memory_capture is not None
        else True,
    )
    return {"status": "success", "snapshot": snap}


@router.post("/verify")
@limiter.limit("30/minute")
async def verify_snapshot_endpoint(
    request: Request,
    payload: SnapshotActionRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Verifies SHA-256/SHA-512 hashes and RFC 3161 cryptographic signatures."""
    try:
        res = cloud_forensics_service.verify_snapshot_integrity(payload.snapshot_id)
        return {"status": "success", "verification": res}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/export-manifest")
@limiter.limit("30/minute")
async def export_manifest_endpoint(
    request: Request,
    payload: SnapshotActionRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Generates a court-admissible manifest under Federal Rules of Evidence FRE 902."""
    try:
        res = cloud_forensics_service.export_court_manifest(payload.snapshot_id)
        return {"status": "success", "manifest": res}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves forensic vault metrics."""
    return {
        "status": "success",
        "metrics": cloud_forensics_service.get_forensics_metrics(),
    }
