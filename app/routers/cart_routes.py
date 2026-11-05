"""
FastAPI Router for Continuous Attack Path & Graph Choke-Point Analysis (CART).
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.cart.cart_engine import cart_engine

router = APIRouter(prefix="/cart", tags=["Continuous Attack Path & Graph Choke-Point Analysis (CART)"])


class SeverChokePointRequest(BaseModel):
    node_id: Optional[str] = Field("node-bastion", description="Choke-point node ID to isolate and sever")


@router.get("/topology")
@limiter.limit("60/minute")
async def get_cart_topology_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Returns the complete enterprise asset, identity, and vulnerability attack graph topology."""
    return {"status": "success", "topology": cart_engine.get_topology()}


@router.get("/attack-paths")
@limiter.limit("60/minute")
async def get_cart_attack_paths_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Discovers all lethal attack paths to Crown Jewels, identifies the primary choke point,
    and computes dynamic blast radius metrics.
    """
    paths_analysis = cart_engine.discover_attack_paths()
    return {"status": "success", "analysis": paths_analysis}


@router.post("/sever-choke-point")
@limiter.limit("30/minute")
async def sever_choke_point_endpoint(
    request: Request,
    payload: SeverChokePointRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Executes automated choke-point severance playbook to collapse multi-vector attack chains."""
    user_id = str(current_user.get("sub", "CART-Director"))
    try:
        res = cart_engine.execute_choke_point_severance(
            node_id=payload.node_id or "node-bastion",
            operator=user_id,
        )
        return {"status": "success", "severance_result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
