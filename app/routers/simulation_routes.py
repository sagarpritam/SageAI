"""
SageAI Cyber Range & Automated Threat Simulation Router.

Provides endpoints to trigger full-spectrum automated red-vs-blue attack drills,
demonstrating autonomous defense across all 10 platform capabilities.
"""

from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.simulation.cyber_range_simulator import cyber_range_simulator

router = APIRouter(prefix="/simulation", tags=["Autonomous Cyber Range"])


class RunDrillPayload(BaseModel):
    scenario_name: Optional[str] = Field(
        "APT-29 Supply Chain & Ingress Breach Drill",
        description="Name of attack scenario",
    )
    attacker_ip: Optional[str] = Field(
        "198.51.100.99", description="Simulated adversary IP"
    )


@router.get("/scenarios")
@limiter.limit("60/minute")
async def list_available_scenarios(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Returns pre-configured APT and adversary simulation templates.
    """
    return {
        "status": "success",
        "scenarios": [
            {
                "id": "apt-29-supply-chain",
                "name": "APT-29 Supply Chain & Ingress Breach Drill",
                "description": "Simulates multi-stage reconnaissance, Canary token theft, SQLi/SSRF ingress exploits, weaponized trojan dropper, and UEBA volume deviation.",
                "complexity": "ADVANCED",
                "stages": 6,
                "mitre_ttps": ["T1595", "T1078", "T1190", "T1059", "T1027", "T1071"],
            },
            {
                "id": "ransomware-blast",
                "name": "LockBit 3.0 Ransomware Dropper & VSS Invalidation Drill",
                "description": "Detonates high-entropy dropper, attempts shadow copy deletion, and verifies autonomous virtual WAF patch deployment.",
                "complexity": "HIGH",
                "stages": 4,
                "mitre_ttps": ["T1486", "T1490", "T1027", "T1003"],
            },
            {
                "id": "cloud-imds-pivot",
                "name": "Cloud IMDSv1 SSRF & AWS Token Exfiltration Drill",
                "description": "Simulates blind SSRF pivot against cloud metadata endpoint (169.254.169.254) and honeytoken trigger.",
                "complexity": "MEDIUM",
                "stages": 3,
                "mitre_ttps": ["T1552", "T1078", "T1190"],
            },
        ],
    }


@router.post("/run-apt-drill")
@limiter.limit("10/minute")
async def run_apt_drill(
    request: Request,
    payload: RunDrillPayload,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Executes a live automated Red-vs-Blue drill scenario across all 6 defense stages.
    """
    org_id = str(current_user.get("org", "system"))
    result = await cyber_range_simulator.execute_apt_scenario(
        scenario_name=payload.scenario_name
        or "APT-29 Supply Chain & Ingress Breach Drill",
        attacker_ip=payload.attacker_ip or "198.51.100.99",
        org_id=org_id,
    )
    return result
