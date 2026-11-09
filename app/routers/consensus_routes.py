"""
Multi-AI Consensus & Red-vs-Blue Debate API Routes.
"""

from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.core.security import get_current_user
from app.services.llm.council_telemetry import council_telemetry
from app.services.llm.gateway import llm_gateway

router = APIRouter(prefix="/consensus", tags=["Multi-AI Consensus & Red-vs-Blue"])


class ConsensusEvaluationRequest(BaseModel):
    vulnerability_title: str = Field(
        ...,
        description="Name of vulnerability (e.g. Remote Code Execution via Deserialization)",
    )
    target: str = Field(..., description="Target domain, IP, or application endpoint")
    evidence: str = Field(
        ..., description="Technical evidence, HTTP request/response, or code snippet"
    )
    context: Optional[str] = Field(
        None, description="Additional environment or framework details"
    )


@router.post("/evaluate")
async def evaluate_vulnerability_consensus(
    request: ConsensusEvaluationRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Execute a 3-model Red-vs-Blue debate to evaluate exploitability with zero hallucinations:
    - Offense Model (DeepSeek R1 / OpenAI o1): Formulates exploit chain.
    - Defense Skeptic Model (Claude 3.7 Sonnet): Attempts to disprove or find mitigating sanitization.
    - Arbiter Model (Gemini 2.5 / Nemotron): Evaluates arguments and issues final consensus verdict with confidence score.
    """
    org_id = current_user.get("org_id", "system")

    result = await llm_gateway.generate_consensus(
        vulnerability_title=request.vulnerability_title,
        target=request.target,
        evidence=request.evidence,
        context=request.context,
        org_id=org_id,
    )

    return {
        "status": "success",
        "evaluation": result,
    }


@router.get("/council-health")
async def get_ai_council_health(
    current_user: dict = Depends(get_current_user),
):
    """
    Returns real-time health scorecard for the SageAI Multi-AI Council:
    - Live latency (avg and p95 ms)
    - Uptime and circuit breaker status
    - Specialized domain roles
    - Token consumption and pricing per 1M tokens
    """
    return {
        "status": "success",
        "matrix": council_telemetry.get_full_council_matrix(),
    }
