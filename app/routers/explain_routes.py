from fastapi import APIRouter

from app.services.ai_explainer import explain_finding

router = APIRouter(prefix="/explain", tags=["AI Explainer"])


@router.get("/{finding_type}")
async def get_explanation(finding_type: str):
    """Get an AI-powered explanation for a vulnerability type.

    Examples: `Missing Security Headers`, `Reflected XSS`, `SQL Injection`
    """
    return explain_finding(finding_type)
