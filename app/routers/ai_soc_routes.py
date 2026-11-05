"""
FastAPI Router for Autonomous AI SOC & Neural Alert Triage Engine.
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.ai_soc.neural_triage_engine import ai_soc_engine

router = APIRouter(prefix="/ai-soc", tags=["Autonomous AI SOC & Neural Alert Triage"])


class TriageAlertsRequest(BaseModel):
    raw_alerts: List[Dict[str, Any]] = Field(..., description="Batch of raw security alerts to correlate and triage")


class ExecutiveBriefingRequest(BaseModel):
    triage_report: Dict[str, Any] = Field(..., description="Completed alert triage report")
    ciso_name: Optional[str] = Field("Chief Information Security Officer", description="CISO recipient name")


@router.post("/triage")
@limiter.limit("60/minute")
async def triage_alerts_endpoint(
    request: Request,
    payload: TriageAlertsRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Correlates and triages raw security alerts, reducing alert noise by 90%+ and assigning investigation tiers.
    """
    user_id = str(current_user.get("sub", "AI-SOC-Operator"))
    org_id = str(current_user.get("org", "system"))

    try:
        report = ai_soc_engine.triage_alerts(
            raw_alerts=payload.raw_alerts,
            actor=user_id,
            org_id=org_id,
        )
        return {
            "status": "success",
            "triage_report": report,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/briefing")
@limiter.limit("30/minute")
async def generate_briefing_endpoint(
    request: Request,
    payload: ExecutiveBriefingRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Generates an executive CISO briefing and autonomous containment playbook from a triage report.
    """
    try:
        briefing = ai_soc_engine.generate_executive_briefing(
            triage_report=payload.triage_report,
            ciso_name=payload.ciso_name or "Chief Information Security Officer",
        )
        return {
            "status": "success",
            "executive_briefing": briefing,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

