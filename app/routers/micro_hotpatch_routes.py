"""
FastAPI Router for Autonomous Kernel & Bytecode Micro-Hotpatching.
"""

from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.micro_hotpatch.micro_hotpatch_service import micro_hotpatch_service

router = APIRouter(
    prefix="/micro-hotpatch",
    tags=["Kernel & Bytecode Micro-Hotpatching"],
)


class GeneratePatchRequest(BaseModel):
    cve_id: str = Field(..., description="CVE identifier (e.g., CVE-2024-6387)")
    target_binary: str = Field(..., description="Path to binary or jar")
    target_function: str = Field(..., description="Target symbol/function to hook")
    patch_strategy: Optional[str] = "UPROBE_TRAMPOLINE"
    binary_type: Optional[str] = "ELF_C"
    severity: Optional[str] = "HIGH"
    memory_bounds: Optional[Dict[str, Any]] = None


class PatchActionRequest(BaseModel):
    patch_id: str


@router.get("/patches")
@limiter.limit("60/minute")
async def list_patches_endpoint(
    request: Request,
    status: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all registered micro-hotpatches."""
    return {"status": "success", "patches": micro_hotpatch_service.list_patches(status=status)}


@router.get("/patches/{patch_id}")
@limiter.limit("60/minute")
async def get_patch_details_endpoint(
    request: Request,
    patch_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves details of a specific micro-hotpatch."""
    patch = micro_hotpatch_service.get_patch_details(patch_id)
    if not patch:
        raise HTTPException(status_code=404, detail="Patch not found")
    return {"status": "success", "patch": patch}


@router.post("/generate")
@limiter.limit("30/minute")
async def generate_patch_endpoint(
    request: Request,
    payload: GeneratePatchRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Generates a verified assembly or bytecode hotpatch trampoline."""
    res = micro_hotpatch_service.generate_hotpatch(
        cve_id=payload.cve_id,
        target_binary=payload.target_binary,
        target_function=payload.target_function,
        patch_strategy=payload.patch_strategy or "UPROBE_TRAMPOLINE",
        memory_bounds=payload.memory_bounds,
        binary_type=payload.binary_type or "ELF_C",
        severity=payload.severity or "HIGH"
    )
    return {"status": "success", "patch": res}


@router.post("/inject")
@limiter.limit("30/minute")
async def inject_patch_endpoint(
    request: Request,
    payload: PatchActionRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Injects a verified hotpatch into live process memory with 0ms downtime."""
    try:
        res = micro_hotpatch_service.inject_hotpatch(payload.patch_id)
        return {"status": "success", "result": res}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/rollback")
@limiter.limit("30/minute")
async def rollback_patch_endpoint(
    request: Request,
    payload: PatchActionRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Restores original instructions and unhooks the trampoline."""
    try:
        res = micro_hotpatch_service.rollback_hotpatch(payload.patch_id)
        return {"status": "success", "result": res}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/verify")
@limiter.limit("30/minute")
async def verify_patch_endpoint(
    request: Request,
    payload: PatchActionRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Runs formal Z3 symbolic invariant analysis against the trampoline."""
    try:
        res = micro_hotpatch_service.verify_memory_invariants(payload.patch_id)
        return {"status": "success", "verification": res}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves micro-hotpatch execution telemetry and metrics."""
    return {"status": "success", "metrics": micro_hotpatch_service.get_metrics()}

