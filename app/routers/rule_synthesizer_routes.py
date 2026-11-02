"""
SageAI Autonomous Threat Pattern & Rule Synthesizer API Routes.

Fulfills Pillar IV of the Master Plan:
Provides endpoints to automatically generate YARA signatures, Sigma SIEM rules,
Nuclei YAML templates, and WAF Virtual Patches from emerging CVEs and threat intelligence.
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.threat_feed.pattern_synthesizer import threat_pattern_synthesizer

router = APIRouter(prefix="/rules", tags=["Threat Pattern & Rule Synthesizer"])


class CustomRuleSynthesizeRequest(BaseModel):
    cve_id: str = Field(..., description="CVE ID or vulnerability tag (e.g. CVE-2024-21887)")
    title: Optional[str] = Field(None, description="Vulnerability title")
    description: Optional[str] = Field(None, description="Detailed vulnerability description")
    severity: Optional[str] = Field("high", description="Severity: critical, high, medium, low")
    strings: Optional[List[str]] = Field(None, description="Extracted suspicious strings/IOCs")
    target_path: Optional[str] = Field("/api/v1/health", description="Target HTTP probe path for Nuclei")


class RuleValidationRequest(BaseModel):
    rule_type: str = Field(..., description="yara, sigma, or nuclei")
    content: str = Field(..., description="Raw rule content")


@router.get("/templates")
@limiter.limit("60/minute")
async def list_preloaded_rule_templates(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Returns curated high-impact CVE templates for instant rule synthesis.
    """
    return {
        "status": "success",
        "templates": threat_pattern_synthesizer.PRELOADED_TEMPLATES,
    }


@router.get("/cve/{cve_id}")
@limiter.limit("30/minute")
async def synthesize_rules_for_cve(
    cve_id: str,
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Synthesizes YARA, Sigma, Nuclei, and WAF rules for a specific CVE ID.
    """
    if not cve_id:
        raise HTTPException(status_code=400, detail="cve_id parameter is required")

    result = threat_pattern_synthesizer.synthesize_from_cve_id(cve_id)
    return {
        "status": "success",
        "rules": result,
    }


@router.post("/synthesize")
@limiter.limit("30/minute")
async def synthesize_custom_rules(
    request: Request,
    req: CustomRuleSynthesizeRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Generates defense rules (YARA, Sigma, Nuclei, WAF) from custom threat parameters.
    """
    item = {
        "cve_id": req.cve_id,
        "title": req.title or f"Custom Threat Rule {req.cve_id}",
        "description": req.description or f"Automated defense rule for {req.cve_id}",
        "severity": req.severity or "high",
        "strings": req.strings or [req.cve_id],
        "target_path": req.target_path or "/api/v1/health",
    }
    result = threat_pattern_synthesizer.process_threat_item(item)
    return {
        "status": "success",
        "rules": result,
    }


@router.post("/validate")
@limiter.limit("60/minute")
async def validate_rule_syntax(
    request: Request,
    req: RuleValidationRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Validates syntax structure of YARA, Sigma, or Nuclei rules.
    """
    validation = threat_pattern_synthesizer.validate_rule(req.rule_type, req.content)
    return {
        "status": "success",
        "validation": validation,
    }


@router.get("/bundle")
@limiter.limit("30/minute")
async def export_rule_bundle(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Exports a defense bundle containing synthesized rules for all preloaded and recent CVEs.
    """
    rules_bundle = []
    for tpl in threat_pattern_synthesizer.PRELOADED_TEMPLATES:
        rules_bundle.append(threat_pattern_synthesizer.process_threat_item(tpl))

    return {
        "status": "success",
        "total_rules": len(rules_bundle),
        "bundle": rules_bundle,
    }

