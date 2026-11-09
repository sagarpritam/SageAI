"""
FastAPI Router for Autonomous Anti-Ransomware Defense & Canary Trap Engine.
"""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.ransomware.anti_ransomware_service import anti_ransomware_service

router = APIRouter(prefix="/ransomware", tags=["Anti-Ransomware Defense & Canary Traps"])


class DeployCanariesRequest(BaseModel):
    target_directories: Optional[List[str]] = Field(None, description="Directories to arm with canary trap files")


class AnalyzeFileStreamRequest(BaseModel):
    events: List[Dict[str, Any]] = Field(..., description="File modification and rename stream events")
    executed_commands: Optional[List[str]] = Field(None, description="Host process command lines to evaluate for VSS tampering")


@router.post("/deploy-canaries")
@limiter.limit("30/minute")
async def deploy_canaries_endpoint(
    request: Request,
    payload: DeployCanariesRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Deploys honeytoken canary traps across host directories.
    """
    try:
        deployed = anti_ransomware_service.deploy_canaries(payload.target_directories)
        return {
            "status": "success",
            "canaries_deployed": deployed,
            "armed_count": len(deployed),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-stream")
@limiter.limit("60/minute")
async def analyze_stream_endpoint(
    request: Request,
    payload: AnalyzeFileStreamRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Analyzes live file stream for high-entropy bursts, ransomware extensions, and canary tampering.
    """
    user_id = str(current_user.get("sub", "Anti-Ransomware-Officer"))
    org_id = str(current_user.get("org", "system"))

    try:
        verdict = anti_ransomware_service.analyze_file_stream(
            events=payload.events,
            executed_commands=payload.executed_commands,
            actor=user_id,
            org_id=org_id,
        )
        return {
            "status": "success",
            "analysis_result": verdict,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/simulate-attack")
@limiter.limit("30/minute")
async def simulate_ransomware_attack_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Simulates a non-destructive ransomware burst and canary tripwire activation.
    """
    user_id = str(current_user.get("sub", "Red-Team-Simulator"))
    org_id = str(current_user.get("org", "system"))

    try:
        result = anti_ransomware_service.simulate_attack(actor=user_id, org_id=org_id)
        return {
            "status": "success",
            "simulation_result": result,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

