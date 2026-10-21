import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.security import get_current_user
from app.services.redteam.nemo_auditor import nemo_auditor

logger = logging.getLogger("SageAI.redteam")

router = APIRouter(prefix="/redteam", tags=["AI Red Teaming"])


class TargetCreateRequest(BaseModel):
    name: str
    model: str
    uri: str
    type: str = "openai.OpenAIGenerator"
    namespace: str = "default"
    options: Optional[Dict[str, Any]] = None


class AuditJobRequest(BaseModel):
    target_name: str
    namespace: str = "default"
    probes: List[str] = ["jailbreak"]


def _resolve_tenant_namespace(user: dict, requested_namespace: str = "default") -> str:
    """Enforce tenant isolation. User can never cross into another organization's namespace."""
    org = user.get("org") or "default"
    if (
        requested_namespace
        and requested_namespace != "default"
        and requested_namespace != org
    ):
        return f"{org}_{requested_namespace}"
    return org


@router.post("/targets")
async def create_audit_target(
    payload: TargetCreateRequest, current_user: dict = Depends(get_current_user)
):
    """
    Register a new LLM target for security auditing.
    """
    try:
        tenant_namespace = _resolve_tenant_namespace(current_user, payload.namespace)
        target = nemo_auditor.create_target(
            name=payload.name,
            model=payload.model,
            uri=payload.uri,
            target_type=payload.type,
            namespace=tenant_namespace,
            options=payload.options,
        )
        return {"status": "success", "target": target}
    except Exception as e:
        logger.error(f"Failed to create target: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/targets")
async def list_audit_targets(
    namespace: str = "default", current_user: dict = Depends(get_current_user)
):
    """
    List all configured audit targets for the organization.
    """
    try:
        tenant_namespace = _resolve_tenant_namespace(current_user, namespace)
        targets = nemo_auditor.list_targets(namespace=tenant_namespace)
        return {"status": "success", "targets": targets}
    except Exception as e:
        logger.error(f"Failed to list targets: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/audit")
async def start_redteam_audit(
    payload: AuditJobRequest, current_user: dict = Depends(get_current_user)
):
    """
    Start an automated red team audit on the specified target.
    """
    try:
        tenant_namespace = _resolve_tenant_namespace(current_user, payload.namespace)
        job = nemo_auditor.start_audit(
            target_name=payload.target_name,
            namespace=tenant_namespace,
            probes=payload.probes,
        )
        return {"status": "success", "job": job}
    except Exception as e:
        logger.error(f"Failed to start audit job: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/results/{job_id}")
async def get_audit_results(
    job_id: str,
    namespace: str = "default",
    current_user: dict = Depends(get_current_user),
):
    """
    Retrieve the results of a red teaming audit job.
    """
    try:
        tenant_namespace = _resolve_tenant_namespace(current_user, namespace)
        results = nemo_auditor.get_job_results(
            job_id=job_id, namespace=tenant_namespace
        )
        return {"status": "success", "results": results}
    except Exception as e:
        logger.error(f"Failed to get results: {e}")
        raise HTTPException(status_code=500, detail=str(e))
