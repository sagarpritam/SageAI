"""
SageAI Enterprise Intrusion Detection & Defense Grid API Routes.

Fulfills Pillar VI of the Master Plan:
Provides endpoints for real-time WAF payload inspection, Network Intrusion Detection (NIDS),
Behavioral UEBA Anomaly evaluation, and Immutable Cryptographic Audit Chain verification.
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.audit_chain import audit_chain
from app.services.detection.attack_detector import AttackDetector
from app.services.detection.nids_monitor import NIDSMonitor
from app.services.detection.anomaly_engine import anomaly_engine
from app.services.incident_response.soar_engine import soar_engine

router = APIRouter(prefix="/intrusion", tags=["Enterprise Intrusion & Defense Grid"])

# Singletons for in-line detection
attack_detector = AttackDetector()
nids_monitor = NIDSMonitor()


class AnalyzeRequestPayload(BaseModel):
    path: str = Field(..., description="Target URL path")
    query_params: Optional[str] = Field(None, description="Raw query string")
    body: Optional[str] = Field(None, description="HTTP request body")
    source_ip: Optional[str] = Field("198.51.100.12", description="Client IP address")
    user_agent: Optional[str] = Field("Mozilla/5.0", description="Client user agent")


class NIDSProbePayload(BaseModel):
    source_ip: str = Field(..., description="Source IP address")
    destination_port: int = Field(..., description="Target port probed")
    destination_ip: Optional[str] = Field("internal_server", description="Destination IP")


class AnomalyCheckPayload(BaseModel):
    client_ip: str = Field(..., description="Client IP address")
    endpoint: str = Field(..., description="API endpoint")
    payload_bytes: Optional[int] = Field(0, description="Size of payload in bytes")


@router.post("/analyze-request")
@limiter.limit("60/minute")
async def analyze_http_request(
    request: Request,
    req: AnalyzeRequestPayload,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    In-line WAF inspection: checks payloads for SQLi, XSS, Command Injection, SSRF, and Path Traversal.
    """
    attacks = attack_detector.analyze_payload(
        target_path=req.path or "/",
        query_params=req.query_params or "",
        body=req.body or "",
        headers={"User-Agent": req.user_agent} if req.user_agent else None,
        source_ip=req.source_ip or "unknown",
    )

    is_blocked = len(attacks) > 0

    if is_blocked:
        audit_chain.record_action(
            actor="SageAI Ingress WAF",
            action="WAF_ATTACK_INTERCEPTED",
            details={"attacks": attacks, "source_ip": req.source_ip, "path": req.path},
            org_id=str(current_user.get("org", "system")),
        )

    return {
        "status": "success",
        "action": "BLOCK" if is_blocked else "ALLOW",
        "attacks_detected": attacks,
        "count": len(attacks),
    }


@router.post("/nids-probe")
@limiter.limit("60/minute")
async def probe_network_connection(
    request: Request,
    req: NIDSProbePayload,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    NIDS port sweep & aggressive reconnaissance detection.
    """
    alert = nids_monitor.record_connection_probe(
        source_ip=req.source_ip,
        destination_port=req.destination_port,
        destination_ip=req.destination_ip or "internal_server",
    )

    if alert:
        audit_chain.record_action(
            actor="SageAI NIDS Engine",
            action="NIDS_PORT_SCAN_FLAGGED",
            details=alert,
            org_id=str(current_user.get("org", "system")),
        )

    return {
        "status": "success",
        "alert": alert,
        "is_port_scan": alert is not None,
    }


@router.post("/anomaly-check")
@limiter.limit("60/minute")
async def check_behavioral_anomaly(
    request: Request,
    req: AnomalyCheckPayload,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    UEBA behavioral anomaly detection: tracks frequency and payload volume deviations (Z > 3.0).
    """
    alerts = anomaly_engine.track_request_frequency(
        client_ip=req.client_ip,
        endpoint=req.endpoint,
        payload_bytes=req.payload_bytes or 0,
    )

    return {
        "status": "success",
        "anomalies_detected": alerts,
        "has_anomaly": len(alerts) > 0,
    }


@router.get("/audit-chain")
@limiter.limit("30/minute")
async def get_audit_chain_and_verify(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Verifies cryptographic integrity of the immutable audit chain (SOC2 / ISO 27001 proof).
    """
    org_id = str(current_user.get("org", "system"))
    verification = audit_chain.verify_chain_integrity()
    ledger = audit_chain.get_ledger(limit=30, org_id=org_id)

    return {
        "status": "success",
        "verification": verification,
        "recent_ledger": ledger,
    }


@router.get("/stats")
@limiter.limit("60/minute")
async def get_defense_grid_stats(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Returns aggregated stats across all defense grid detection engines.
    """
    return {
        "status": "success",
        "anomaly_engine": anomaly_engine.get_baseline_stats(),
        "audit_chain": audit_chain.verify_chain_integrity(),
    }
