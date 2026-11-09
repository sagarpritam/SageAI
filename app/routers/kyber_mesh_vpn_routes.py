"""
FastAPI Router for PQC Kyber/Dilithium Encrypted Mesh VPN Gateway.
"""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.kyber_mesh_vpn.kyber_mesh_vpn_service import kyber_mesh_vpn_service

router = APIRouter(
    prefix="/kyber-mesh-vpn",
    tags=["PQC Kyber/Dilithium Encrypted Mesh VPN Gateway"],
)


class RegisterPeerRequest(BaseModel):
    node_name: str = Field(..., description="Peer node hostname or label")
    endpoint: str = Field(..., description="IP:Port WAN endpoint")
    overlay_ip: str = Field(..., description="Overlay mesh IP (e.g. 10.220.0.5/32)")
    allowed_ips: Optional[List[str]] = None


class HandshakeRequest(BaseModel):
    peer_id: str


@router.get("/peers")
@limiter.limit("60/minute")
async def list_peers_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves all registered post-quantum encrypted mesh VPN peers."""
    return {"status": "success", "peers": kyber_mesh_vpn_service.list_peers()}


@router.get("/peers/{peer_id}")
@limiter.limit("60/minute")
async def get_peer_endpoint(
    request: Request,
    peer_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves details of a specific post-quantum VPN peer."""
    peer = kyber_mesh_vpn_service.get_peer(peer_id)
    if not peer:
        raise HTTPException(status_code=404, detail="Peer not found")
    return {"status": "success", "peer": peer}


@router.post("/register-peer")
@limiter.limit("30/minute")
async def register_peer_endpoint(
    request: Request,
    payload: RegisterPeerRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Registers a new peer node with ML-KEM-768 and ML-DSA-65 keys."""
    peer = kyber_mesh_vpn_service.register_peer(
        node_name=payload.node_name,
        endpoint=payload.endpoint,
        overlay_ip=payload.overlay_ip,
        allowed_ips=payload.allowed_ips
    )
    return {"status": "success", "peer": peer}


@router.post("/handshake")
@limiter.limit("30/minute")
async def handshake_endpoint(
    request: Request,
    payload: HandshakeRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Initiates an ephemeral ML-KEM-768 key encapsulation handshake."""
    try:
        res = kyber_mesh_vpn_service.initiate_pqc_handshake(payload.peer_id)
        return {"status": "success", "handshake": res}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/wireguard-config/{peer_id}")
@limiter.limit("30/minute")
async def get_wireguard_config_endpoint(
    request: Request,
    peer_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Generates a hardened quantum-safe WireGuard configuration file."""
    try:
        conf = kyber_mesh_vpn_service.generate_wireguard_conf(peer_id)
        return {"status": "success", "config": conf}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
@limiter.limit("60/minute")
async def get_metrics_endpoint(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieves post-quantum mesh telemetry and tunnel throughput."""
    return {"status": "success", "metrics": kyber_mesh_vpn_service.get_mesh_metrics()}

