"""
SageAI Deep Emerging Attack Analysis API Routes.

Fulfills Pillar II of the Master Plan:
Audits next-generation attack vectors that evade traditional port scanners:
1. Cloud Metadata & IMDSv1/v2 SSRF (AWS, Azure, GCP, Kubernetes)
2. Advanced Authentication, OAuth Hijacking & JWT Algorithm Confusion
3. Web Infrastructure Flaws (HTTP Request Smuggling, CDN Cache Poisoning & Deception)
4. AI / LLM Security (OWASP Top 10 for LLMs: Prompt Injection, Prompt Leakage, Insecure Output)
5. Concurrency & Race Conditions (TOCTOU double-spend & missing idempotency locks)
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.agent.deep_analysis_agent import deep_analysis_agent

router = APIRouter(prefix="/deep-analysis", tags=["Deep Attack Analysis"])


class DeepAuditRequest(BaseModel):
    target: str = Field(..., description="Target domain, IP, or URL")
    vectors: Optional[List[str]] = Field(None, description="List of attack vectors to evaluate")
    code_snippet: Optional[str] = Field(None, description="Optional code snippet for deterministic AST taint analysis")


class SingleVectorProbeRequest(BaseModel):
    target: str = Field(..., description="Target domain, IP, or URL")
    vector: str = Field(..., description="Specific vector to probe")
    code_snippet: Optional[str] = Field(None, description="Optional code snippet")


@router.get("/vectors")
@limiter.limit("60/minute")
async def list_attack_vectors(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Returns supported modern emerging attack vectors with MITRE ATT&CK & OWASP coverage.
    """
    return {
        "status": "success",
        "vectors": [
            {
                "id": "cloud_imds_ssrf",
                "name": "Cloud Metadata & IMDSv1/v2 SSRF",
                "description": "Examines external fetch endpoints for AWS IMDSv1/v2 token bypass, GCP metadata, Azure instance data, and K8s tokens.",
                "mitre_attack": "T1552.005 (Cloud Instance Metadata API)",
                "owasp_category": "OWASP-A10:2021-SSRF",
                "cwe": "CWE-918",
                "severity": "CRITICAL",
            },
            {
                "id": "oauth_jwt_auth",
                "name": "OAuth 2.0 Hijacking & JWT Confusion",
                "description": "Probes redirect_uri path traversal, wildcard domain bypasses, 'none' algorithm acceptance, and RS256/HS256 public key confusion.",
                "mitre_attack": "T1078 (Valid Accounts / Token Hijack)",
                "owasp_category": "OWASP-A07:2021-Identification & Auth",
                "cwe": "CWE-345 / CWE-601",
                "severity": "CRITICAL",
            },
            {
                "id": "cache_smuggling",
                "name": "HTTP Request Smuggling & Cache Poisoning",
                "description": "Tests for CL.TE/TE.CL request desynchronization, unkeyed header injection (X-Forwarded-Host), and static Web Cache Deception.",
                "mitre_attack": "T1190 (Exploit Public-Facing Application)",
                "owasp_category": "OWASP-A05:2021-Security Misconfiguration",
                "cwe": "CWE-444 / CWE-524",
                "severity": "HIGH",
            },
            {
                "id": "llm_top10",
                "name": "Generative AI & LLM Security (OWASP Top 10)",
                "description": "Probes LLM endpoints for prompt injection overrides, initialization prompt leakage, indirect markdown data exfiltration, and unsafe output.",
                "mitre_attack": "T1059 (Command & Scripting Interpreter)",
                "owasp_category": "OWASP-LLM01 / LLM06 / LLM02",
                "cwe": "CWE-1384",
                "severity": "CRITICAL",
            },
            {
                "id": "concurrency_toctou",
                "name": "Concurrency & TOCTOU Race Conditions",
                "description": "Conducts parallel non-destructive bursts against transactional endpoints to identify missing idempotency locks and double-spend hazards.",
                "mitre_attack": "T1499 (Endpoint Denial / State Corruption)",
                "owasp_category": "OWASP-A04:2021-Insecure Design",
                "cwe": "CWE-367 (Time-of-check Time-of-use)",
                "severity": "HIGH",
            },
        ],
    }


@router.post("/audit")
@limiter.limit("30/minute")
async def run_deep_audit(
    request: Request,
    req: DeepAuditRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Executes deep multi-vector emerging threat audit against a target perimeter or source code snippet.
    """
    context = {}
    if req.code_snippet:
        context["code_snippet"] = req.code_snippet

    result = await deep_analysis_agent.run(
        target=req.target,
        context=context,
        vectors=req.vectors,
    )

    return {
        "status": "success",
        "audit": result,
    }


@router.post("/probe")
@limiter.limit("30/minute")
async def probe_single_vector(
    request: Request,
    req: SingleVectorProbeRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Executes a targeted assessment for a single emerging attack vector.
    """
    context = {}
    if req.code_snippet:
        context["code_snippet"] = req.code_snippet

    result = await deep_analysis_agent.run(
        target=req.target,
        context=context,
        vectors=[req.vector],
    )

    return {
        "status": "success",
        "vector": req.vector,
        "audit": result,
    }

