"""
FastAPI Router for Autonomous Atomic Red Team & Adversary Emulation Engine.
"""

from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.redteam.atomic_adversary_emulator import atomic_adversary_emulator

router = APIRouter(
    prefix="/atomic-redteam", tags=["Atomic Red Team & Adversary Emulation"]
)


class RunAtomicTestRequest(BaseModel):
    technique_id: str = Field(
        ..., description="MITRE ATT&CK Technique ID (e.g. T1059.001, T1003.001)"
    )
    target_host: Optional[str] = Field(
        "sandbox-runner-01", description="Designated execution target or sandbox"
    )
    dry_run: Optional[bool] = Field(
        True, description="Safe emulation mode inside unprivileged sandbox"
    )


class RunCampaignRequest(BaseModel):
    campaign_id: str = Field(
        ...,
        description="Adversary Campaign ID (e.g. APT29_COZY_BEAR, SCATTERED_SPIDER)",
    )
    target_network: Optional[str] = Field(
        "prod-vpc-us-east-1", description="Target cloud network or VPC"
    )


@router.get("/techniques")
@limiter.limit("60/minute")
async def get_techniques_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Lists all registered Atomic Red Team techniques."""
    return {"techniques": atomic_adversary_emulator.list_techniques()}


@router.get("/campaigns")
@limiter.limit("60/minute")
async def get_campaigns_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Lists all registered Caldera-style adversary campaigns."""
    return {"campaigns": atomic_adversary_emulator.list_campaigns()}


@router.post("/run-atomic")
@limiter.limit("30/minute")
async def run_atomic_test_endpoint(
    request: Request,
    payload: RunAtomicTestRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Executes a single atomic red team test in a safe zero-egress sandbox."""
    user_id = str(current_user.get("sub", "RedTeamDirector"))
    try:
        res = atomic_adversary_emulator.run_atomic_test(
            technique_id=payload.technique_id,
            target_host=payload.target_host or "sandbox-runner-01",
            operator=user_id,
            dry_run=payload.dry_run if payload.dry_run is not None else True,
        )
        return {"status": "success", "result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/run-campaign")
@limiter.limit("20/minute")
async def run_campaign_endpoint(
    request: Request,
    payload: RunCampaignRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Executes a multi-stage adversary campaign graph and reports Blue Team detection gaps."""
    user_id = str(current_user.get("sub", "RedTeamDirector"))
    try:
        res = atomic_adversary_emulator.execute_campaign(
            campaign_id=payload.campaign_id,
            target_network=payload.target_network or "prod-vpc-us-east-1",
            operator=user_id,
        )
        return {"status": "success", "campaign_report": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
