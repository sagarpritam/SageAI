"""
FastAPI Routes for Gromov-Eliashberg Symplectic Topology & Contact Non-Squeezing Firewall (Capability 193).
"""

from typing import Any, Dict
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.core.security import get_current_user
from app.services.gromov_eliashberg_symplectic_firewall import (
    get_gromov_eliashberg_symplectic_firewall_service,
)

router = APIRouter(
    prefix="/api/gromov-eliashberg-symplectic",
    tags=["Gromov-Eliashberg Symplectic Firewall"],
)


class EvaluateSymplecticCapacityRequest(BaseModel):
    manifold_id: str = Field("GROMOV-CYLINDER-PHASE-01", description="Identifier of the symplectic manifold / cylinder")
    ball_radius: float = Field(1.0, ge=0.1, le=10.0, description="Phase-space ball radius R")
    cylinder_radius: float = Field(1.0, ge=0.1, le=10.0, description="Phase-space cylinder radius r")
    firewall_gain: float = Field(1.25, ge=0.1, le=10.0, description="Symplectic capacity firewall gain")


@router.get("/manifolds", summary="List Gromov-Eliashberg Symplectic Manifolds")
async def list_manifolds(_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    svc = get_gromov_eliashberg_symplectic_firewall_service()
    return {"manifolds": svc.get_manifolds()}


@router.post("/evaluate-symplectic-capacity", summary="Evaluate Symplectic Capacity & Non-Squeezing Rigidity")
async def evaluate_symplectic_capacity(
    req: EvaluateSymplecticCapacityRequest,
    _user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    svc = get_gromov_eliashberg_symplectic_firewall_service()
    return svc.evaluate_symplectic_capacity(
        manifold_id=req.manifold_id,
        ball_radius=req.ball_radius,
        cylinder_radius=req.cylinder_radius,
        firewall_gain=req.firewall_gain,
    )


@router.get("/metrics", summary="Get Gromov-Eliashberg Firewall Telemetry Metrics")
async def get_metrics(_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    svc = get_gromov_eliashberg_symplectic_firewall_service()
    return svc.get_metrics()
