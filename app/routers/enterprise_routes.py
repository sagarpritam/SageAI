"""
SageAI Enterprise Security Grid & 10-Capability Orchestration Router.

Provides unified endpoints to:
1. Inspect live operational status across all 10 platform cybersecurity capabilities.
2. Trigger full 10-stage automated end-to-end security drills with zero human intervention.
3. Download executive SOC2 / ISO 27001 / FedRAMP compliance reports with cryptographic Merkle proof seals.
"""

import logging
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.orchestrator.enterprise_orchestrator import (
    enterprise_orchestrator,
)

logger = logging.getLogger("SageAI.enterprise_routes")

router = APIRouter(prefix="/security", tags=["Enterprise Security Orchestrator"])


class RunEnterpriseDrillPayload(BaseModel):
    scenario_name: Optional[str] = Field(
        "Enterprise Sovereign Defense & Offense Grid Drill",
        description="Name of full-spectrum enterprise attack and defense drill",
    )
    attacker_ip: Optional[str] = Field(
        "198.51.100.99", description="Simulated adversary IP address"
    )


@router.get("/enterprise-capabilities")
@limiter.limit("60/minute")
async def get_enterprise_capabilities(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Returns live operational status, health, and real-time telemetry across all 10 capabilities.
    """
    capabilities = enterprise_orchestrator.get_capabilities_status()
    all_healthy = all(c.get("status") == "ONLINE" for c in capabilities)

    return {
        "status": "healthy" if all_healthy else "degraded",
        "total_capabilities": len(capabilities),
        "online_count": sum(1 for c in capabilities if c.get("status") == "ONLINE"),
        "platform_version": "2.5.0",
        "compliance_rating": "AAA (Sovereign Defense Grid)",
        "capabilities": capabilities,
    }


@router.post("/enterprise-audit-drill")
@limiter.limit("10/minute")
async def run_enterprise_audit_drill(
    request: Request,
    payload: Optional[RunEnterpriseDrillPayload] = None,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Executes a comprehensive 10-stage end-to-end security drill exercising every single platform capability:
    Binary Disassembly, Deception Honeypots, WAF Ingress, NIDS & C2, Threat Intel, UEBA Analytics,
    SOAR Containment, AI Red-Team Guardrails, Cyber Range APT Detonation, and Merkle Ledger Anchoring.
    """
    scenario = (
        payload.scenario_name
        if payload and payload.scenario_name
        else "Enterprise Sovereign Defense & Offense Grid Drill"
    )
    attacker_ip = (
        payload.attacker_ip if payload and payload.attacker_ip else "198.51.100.99"
    )

    org_id = str(current_user.get("org", "system"))
    user_id = str(
        current_user.get("sub", current_user.get("user_id", "SecOps-Director"))
    )

    try:
        drill_result = (
            await enterprise_orchestrator.execute_full_enterprise_drill(
                scenario_name=scenario,
                attacker_ip=attacker_ip,
                org_id=org_id,
                actor=user_id,
            )
        )
        return drill_result
    except Exception as e:
        logger.error(f"Enterprise Security Drill execution failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Enterprise Security Drill execution failed: {str(e)}",
        )


@router.get("/enterprise-report")
@limiter.limit("30/minute")
async def get_enterprise_compliance_report(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Generates an executive SOC2 / ISO 27001 / FedRAMP compliance audit report
    anchored to the latest cryptographic Merkle hash chain state.
    """
    org_id = str(current_user.get("org", "system"))
    user_id = str(
        current_user.get("sub", current_user.get("user_id", "Auditor-Lead"))
    )

    drill_result = await enterprise_orchestrator.execute_full_enterprise_drill(
        scenario_name="Automated Executive Compliance Audit Drill",
        attacker_ip="198.51.100.99",
        org_id=org_id,
        actor=user_id,
    )
    markdown_report = enterprise_orchestrator.generate_compliance_report(
        drill_result
    )

    return {
        "status": "success",
        "drill_id": drill_result["drill_id"],
        "compliance_rating": drill_result["compliance_rating"],
        "merkle_seal": drill_result["merkle_seal"],
        "markdown_report": markdown_report,
    }

