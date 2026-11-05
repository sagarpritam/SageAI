"""
FastAPI Router for Dynamic Synthetic Honeytoken & Active Canary Fabric.
"""

from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.canary_fabric.canary_fabric_service import (
    canary_fabric_service,
)

router = APIRouter(
    prefix="/canary-fabric",
    tags=["Canary Fabric & Honeytokens"],
)


class DeployHoneytokenRequest(BaseModel):
    token_type: str = Field(..., description="CLOUD_IAM, GIT_REPO_SECRET, DATABASE_TABLE, or ACTIVE_DIRECTORY_SPN")
    deployment_target: str = Field(..., description="Target file, repo, table, or SPN path")
    memo: Optional[str] = None


class TriggerTripwireRequest(BaseModel):
    canary_id: str
    attacker_ip: Optional[str] = "198.51.100.74"
    user_agent: Optional[str] = "python-requests/2.31.0 (Scraper)"
    target_service: Optional[str] = "AWS STS GetCallerIdentity"
    auto_isolate_host: Optional[bool] = True


@router.get("/tokens")
@limiter.limit("60/minute")
async def list_tokens_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Lists all deployed active synthetic honeytokens."""
    return {"status": "success", "canaries": canary_fabric_service.list_deployed_canaries()}


@router.get("/tripwires")
@limiter.limit("60/minute")
async def list_tripwires_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Lists historical tripwire breach events."""
    return {"status": "success", "tripwire_events": canary_fabric_service.get_tripwire_history()}


@router.post("/deploy")
@limiter.limit("30/minute")
async def deploy_honeytoken_endpoint(
    request: Request,
    payload: DeployHoneytokenRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Synthesizes and deploys a dynamic honeytoken."""
    return canary_fabric_service.deploy_honeytoken(
        token_type=payload.token_type,
        deployment_target=payload.deployment_target,
        memo=payload.memo,
        operator=current_user.get("email", "SecOpsDeceptionLead"),
    )


@router.post("/tripwire")
@limiter.limit("30/minute")
async def trigger_tripwire_endpoint(
    request: Request,
    payload: TriggerTripwireRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Triggers an active canary tripwire alert with autonomous SDN isolation."""
    return canary_fabric_service.trigger_tripwire(
        canary_id=payload.canary_id,
        attacker_ip=payload.attacker_ip or "198.51.100.74",
        user_agent=payload.user_agent or "python-requests/2.31.0",
        target_service=payload.target_service or "AWS STS GetCallerIdentity",
        auto_isolate_host=payload.auto_isolate_host if payload.auto_isolate_host is not None else True,
    )

