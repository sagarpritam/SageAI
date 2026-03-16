from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.core.security import get_current_user
from app.services.redteam.nemo_auditor import nemo_auditor
import logging

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

@router.post("/targets")
async def create_audit_target(
    payload: TargetCreateRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Register a new LLM target for security auditing.
    """
    try:
        target = nemo_auditor.create_target(
            name=payload.name,
            model=payload.model,
            uri=payload.uri,
            target_type=payload.type,
            namespace=payload.namespace,
            options=payload.options
        )
        return {"status": "success", "target": target}
    except Exception as e:
        logger.error(f"Failed to create target: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/targets")
async def list_audit_targets(
    namespace: str = "default",
    current_user: dict = Depends(get_current_user)
):
    """
    List all configured audit targets.
    """
    try:
        targets = nemo_auditor.list_targets(namespace=namespace)
        return {"status": "success", "targets": targets}
    except Exception as e:
        logger.error(f"Failed to list targets: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/audit")
async def start_redteam_audit(
    payload: AuditJobRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Start an automated red team audit on the specified target.
    """
    try:
        job = nemo_auditor.start_audit(
            target_name=payload.target_name,
            namespace=payload.namespace,
            probes=payload.probes
        )
        return {"status": "success", "job": job}
    except Exception as e:
        logger.error(f"Failed to start audit job: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/results/{job_id}")
async def get_audit_results(
    job_id: str,
    namespace: str = "default",
    current_user: dict = Depends(get_current_user)
):
    """
    Retrieve the results of a red teaming audit job.
    """
    try:
        results = nemo_auditor.get_job_results(job_id=job_id, namespace=namespace)
        return {"status": "success", "results": results}
    except Exception as e:
        logger.error(f"Failed to get results: {e}")
        raise HTTPException(status_code=500, detail=str(e))
