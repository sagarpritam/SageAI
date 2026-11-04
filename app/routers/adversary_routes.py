"""
FastAPI Router for Autonomous Adversary Emulation & MITRE ATT&CK Matrix.
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.adversary.mitre_emulator import mitre_emulator

router = APIRouter(prefix="/adversary", tags=["Adversary Emulation & MITRE ATT&CK"])


class RunAdversaryDrillRequest(BaseModel):
    actor_id: str = Field("APT29", description="Threat actor ID (APT29, FIN7, VOLT_TYPHOON)")


@router.get("/matrix")
@limiter.limit("60/minute")
async def get_mitre_attack_matrix(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Returns the complete 14-tactic MITRE ATT&CK Enterprise Matrix and coverage."""
    return mitre_emulator.get_mitre_matrix()


@router.post("/run-drill")
@limiter.limit("20/minute")
async def execute_apt_emulation_drill(
    request: Request,
    payload: RunAdversaryDrillRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Executes a breach-and-attack simulation (BAS) drill against the full defense grid.
    """
    org_id = str(current_user.get("org", "system"))
    user_id = str(current_user.get("sub", "RedTeamDirector"))

    result = mitre_emulator.execute_apt_emulation_drill(
        actor_id=payload.actor_id,
        org_id=org_id,
        operator=user_id,
    )
    return result

