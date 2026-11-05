"""
FastAPI Router for MITRE D3FEND Defensive Countermeasure Matrix & Graph Engine.
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.d3fend.d3fend_matrix_service import d3fend_matrix_service

router = APIRouter(prefix="/d3fend", tags=["MITRE D3FEND Defensive Matrix"])


class QueryCountermeasureRequest(BaseModel):
    attack_technique: str = Field(..., description="Offensive MITRE ATT&CK Technique ID or Name (e.g. T1059, PowerShell)")


@router.get("/matrix")
@limiter.limit("60/minute")
async def get_d3fend_matrix_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Returns the MITRE D3FEND countermeasure matrix and Defense Maturity Index (DMI)."""
    return {"status": "success", "matrix": d3fend_matrix_service.get_d3fend_matrix()}


@router.post("/query-countermeasure")
@limiter.limit("60/minute")
async def query_countermeasure_endpoint(
    request: Request,
    payload: QueryCountermeasureRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Queries defensive D3FEND countermeasures mapped to an offensive MITRE ATT&CK technique."""
    res = d3fend_matrix_service.get_countermeasure_for_attack(attack_technique=payload.attack_technique)
    return {"status": "success", "query_result": res}

