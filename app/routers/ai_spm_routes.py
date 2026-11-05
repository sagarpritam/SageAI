"""
FastAPI Router for AI Security Posture Management (AI-SPM) & LLM Defense.
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.ai_spm.ai_spm_service import ai_spm_service

router = APIRouter(prefix="/ai-spm", tags=["AI Security Posture Management (AI-SPM)"])


class InspectPromptRequest(BaseModel):
    prompt: str = Field(..., description="Raw prompt to inspect for injection, jailbreak, or sensitive data")


class AuditRAGRequest(BaseModel):
    documents: Optional[List[Dict[str, Any]]] = Field(None, description="Custom RAG chunks to scan for poisoning")


class AuditPipelineRequest(BaseModel):
    pipeline_name: Optional[str] = Field("Enterprise-Agent-Pipeline", description="Target agent pipeline name")
    tools_enabled: Optional[List[str]] = Field(None, description="List of tool names enabled in agentic loop")


@router.post("/inspect-prompt")
@limiter.limit("60/minute")
async def inspect_prompt_endpoint(
    request: Request,
    payload: InspectPromptRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Inspects an incoming prompt in real-time for prompt injection, jailbreaking, and secret leakage."""
    res = ai_spm_service.inspect_prompt(prompt=payload.prompt)
    return {"status": "success", "inspection": res}


@router.post("/scan-rag")
@limiter.limit("30/minute")
async def scan_rag_endpoint(
    request: Request,
    payload: AuditRAGRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Scans RAG vector store documents for data poisoning and indirect prompt injection."""
    res = ai_spm_service.scan_rag_knowledge_base(documents=payload.documents)
    return {"status": "success", "rag_report": res}


@router.post("/audit-pipeline")
@limiter.limit("30/minute")
async def audit_pipeline_endpoint(
    request: Request,
    payload: AuditPipelineRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Audits agentic LLM pipelines for excessive agency and unconstrained tool usage."""
    res = ai_spm_service.audit_agentic_pipeline(
        pipeline_name=payload.pipeline_name or "Enterprise-Agent-Pipeline",
        tools_enabled=payload.tools_enabled,
    )
    return {"status": "success", "pipeline_audit": res}
