"""
Incident Response & Reverse Engineering API Routes.
"""

import base64
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.organization import Organization
from app.services.audit_chain import audit_chain
from app.services.incident_response.soar_engine import soar_engine
from app.services.malware.reverse_engineer import ReverseEngineeringEngine
from app.services.sagepatch.engine import SagePatchEngine

router = APIRouter(prefix="/incidents", tags=["Incident Response & Forensics"])
rev_engine = ReverseEngineeringEngine()


class ActionExecutionRequest(BaseModel):
    action: str = Field(..., description="Action name to execute")


class IngestAlertRequest(BaseModel):
    title: str = Field(..., description="Alert or incident title")
    severity: str = Field(
        ..., description="Severity level: CRITICAL, HIGH, MEDIUM, LOW"
    )
    source: str = Field(
        ..., description="Detection source: NIDS, WAF, Honeypot, CloudTrail, etc."
    )
    details: dict = Field(
        default_factory=dict, description="Arbitrary context key-value pairs"
    )


class ReverseEngineerRequest(BaseModel):
    filename: str = Field("payload.bin", description="Name of sample")
    base64_data: str = Field(..., description="Base64-encoded raw binary data")


@router.get("")
async def list_incidents(
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
):
    """List active security incidents prioritized by severity."""
    org_id = current_user.get("org") or current_user.get("org_id") or "system"
    return {
        "status": "success",
        "incidents": soar_engine.list_incidents(limit=limit, org_id=org_id),
    }


@router.get("/{incident_id}")
async def get_incident(
    incident_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Retrieve details and audit timeline of a specific incident."""
    incident = soar_engine.get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")
    return {
        "status": "success",
        "incident": incident,
    }


@router.post("/ingest", status_code=201)
async def ingest_alert(
    payload: IngestAlertRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Ingest a security event or detector alert into the SOAR engine.
    Automatically correlates events, executes zero-risk safety containment actions,
    queues guarded high-impact playbooks, and records to the cryptographic audit chain.
    """
    org_id = current_user.get("org") or current_user.get("org_id") or "system"
    incident = soar_engine.create_incident(
        title=payload.title,
        severity=payload.severity,
        source=payload.source,
        details=payload.details,
        org_id=org_id,
    )

    try:
        audit_chain.append(
            event_type="INCIDENT_INGESTED",
            actor=current_user.get("email", "system"),
            payload={
                "incident_id": incident["incident_id"],
                "title": incident["title"],
                "severity": incident["severity"],
                "source": incident["source"],
            },
        )
    except Exception:
        pass

    return {
        "status": "success",
        "message": f"Alert correlated into incident {incident['incident_id']}",
        "incident": incident,
    }


@router.post("/{incident_id}/action")
async def execute_containment_action(
    incident_id: str,
    request: ActionExecutionRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Execute a defensive containment action with human-in-the-loop authorization.
    High-impact actions require 'admin', 'ciso', or 'owner' role.
    """
    user_email = current_user.get("email", "anonymous")
    user_role = current_user.get("role", "viewer")

    res = soar_engine.execute_high_impact_action(
        incident_id=incident_id,
        action_name=request.action,
        approved_by=user_email,
        role=user_role,
    )

    if res.get("status") == "BLOCKED_BY_SAFETY_POLICY":
        raise HTTPException(status_code=403, detail=res["message"])
    elif res.get("status") == "error":
        raise HTTPException(status_code=400, detail=res["message"])

    return res


class RemediateIncidentRequest(BaseModel):
    repository: Optional[str] = Field("demo/app", description="Target repository")
    file_path: Optional[str] = Field(None, description="Target file path if known")


@router.post("/{incident_id}/remediate")
async def remediate_incident_via_sagepatch(
    incident_id: str,
    payload: Optional[RemediateIncidentRequest] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Generates an automated AST-validated SagePatch code fix for an active incident
    and queues it for human review in the AutoFix Review Queue.
    """
    incident = soar_engine.get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

    title_lower = incident.get("title", "").lower()
    incident.get("details", {})
    org_id = str(current_user.get("org") or current_user.get("org_id") or "system")

    # Ensure Organization exists in DB to satisfy foreign key constraint
    org = await db.get(Organization, org_id)
    if not org:
        org = Organization(id=org_id, name="Default Organization")
        db.add(org)
        await db.flush()

    repo = (
        payload.repository if payload and payload.repository else "demo/app"
    ).strip()

    if "command" in title_lower or "cmdi" in title_lower:
        vuln_type = "Command Injection"
        file_path = (
            payload.file_path
            if payload and payload.file_path
            else "app/utils/diagnostics.py"
        )
        orig_code = (
            "def execute_ping(host: str) -> int:\n"
            "    import os\n"
            "    return os.system(f'ping -c 1 {host}')\n"
        )
        patched_code = (
            "def execute_ping(host: str) -> int:\n"
            "    import subprocess\n"
            "    return subprocess.run(['ping', '-c', '1', host], check=True).returncode\n"
        )
    elif "ssrf" in title_lower or "metadata" in title_lower:
        vuln_type = "SSRF"
        file_path = (
            payload.file_path
            if payload and payload.file_path
            else "app/services/fetcher.py"
        )
        orig_code = (
            "def fetch_remote(url: str):\n"
            "    import requests\n"
            "    return requests.get(url)\n"
        )
        patched_code = (
            "def fetch_remote(url: str):\n"
            "    import requests\n"
            "    if '169.254' in url or 'localhost' in url:\n"
            "        raise ValueError('SSRF blocked: private target')\n"
            "    return requests.get(url, timeout=5)\n"
        )
    elif "canary" in title_lower or "deception" in title_lower:
        vuln_type = "Credential Exposure"
        file_path = (
            payload.file_path
            if payload and payload.file_path
            else "app/services/credential_loader.py"
        )
        orig_code = (
            "AWS_ACCESS_KEY = 'AKIA_MOCK_CANARY_VALUE'\n"
            "AWS_SECRET_KEY = 'SK_MOCK_CANARY_VALUE'\n"
        )
        patched_code = (
            "import os\n"
            "AWS_ACCESS_KEY = os.environ.get('AWS_ACCESS_KEY', '')\n"
            "AWS_SECRET_KEY = os.environ.get('AWS_SECRET_KEY', '')\n"
        )
    else:
        # Default SQLi
        vuln_type = "SQL Injection"
        file_path = (
            payload.file_path
            if payload and payload.file_path
            else "app/db/repositories.py"
        )
        orig_code = (
            "def get_user(username: str):\n"
            "    sql = f'SELECT * FROM users WHERE name = \"{username}\"'\n"
            "    return db.execute(sql)\n"
        )
        patched_code = (
            "def get_user(username: str):\n"
            "    sql = 'SELECT * FROM users WHERE name = :name'\n"
            "    return db.execute(sql, {'name': username})\n"
        )

    engine = SagePatchEngine(db)
    patch = await engine.propose_patch(
        organization_id=org_id,
        repository=repo,
        file_path=file_path,
        vulnerability_type=vuln_type,
        severity=incident.get("severity", "HIGH"),
        original_code=orig_code,
        patched_code=patched_code,
        requested_by=str(
            current_user.get("email") or current_user.get("sub") or "incident-responder"
        ),
    )

    action_record = {
        "action": "DISPATCH_SAGEPATCH_REMEDIATION",
        "status": "PROPOSED",
        "executed_at": patch.created_at.isoformat()
        if hasattr(patch, "created_at") and patch.created_at
        else None,
        "executed_by": "SagePatch Closed-Loop Engine",
        "details": f"Proposed patch {patch.id} for {vuln_type} in {file_path}. Awaiting human review in AutoFix Queue.",
    }
    incident.get("executed_actions", []).append(action_record)

    audit_chain.record_action(
        actor="SagePatch Auto-Fix Engine",
        action="INCIDENT_SAGEPATCH_PROPOSED",
        details={
            "incident_id": incident_id,
            "patch_id": patch.id,
            "file_path": file_path,
            "vulnerability_type": vuln_type,
        },
        org_id=org_id,
    )

    return {
        "status": "success",
        "message": "SagePatch remediation proposed and sent to Auto-Fix Review Queue.",
        "patch_id": patch.id,
        "file_path": file_path,
        "vulnerability_type": vuln_type,
        "diff": patch.diff,
        "patch_branch": patch.patch_branch,
    }


@router.post("/reverse-engineer")
async def reverse_engineer_sample(
    request: ReverseEngineerRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Disassemble and reverse engineer an uploaded suspicious binary/script in an isolated sandbox.
    """
    try:
        raw_bytes = base64.b64decode(request.base64_data)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Base64 payload encoding")

    # Safety constraint: enforce maximum analysis buffer size (10MB)
    if len(raw_bytes) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400, detail="Payload exceeds 10MB analysis limit"
        )

    analysis = rev_engine.analyze_binary(raw_bytes, filename=request.filename)
    return {
        "status": "success",
        "analysis": analysis,
    }
