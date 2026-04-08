"""AI Analyzer Agent — filters, prioritizes, and reasons about scan findings."""

import json
import logging
from typing import Any, Dict, List

from pydantic import BaseModel, Field

from app.services.ai_service import call_llm

logger = logging.getLogger(__name__)

# Maximum findings per LLM call to avoid token overflow
_BATCH_SIZE = 25


class AnalyzedFinding(BaseModel):
    index: int = Field(description="The exact integer index (0-based) of the finding from the input batch")
    name: str = Field(description="The name of the vulnerability")
    severity: str = Field(description="Severity level (Low, Medium, High, Critical)")
    priority: int = Field(description="Priority score 1-10 based on exploitability and impact")
    reason: str = Field(description="Reasoning on exploitability vs false positive")


class AnalyzerResponse(BaseModel):
    findings: List[AnalyzedFinding]


def _fallback_analysis(raw_findings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Generate a basic analysis when the LLM is unavailable."""
    severity_scores = {"critical": 9, "high": 7, "medium": 5, "low": 3, "info": 1}
    results = []
    for i, f in enumerate(raw_findings):
        name = f.get("name", f.get("type", "Unknown"))
        sev = f.get("severity", "info").lower()

        # Merge directly into a copy of the original finding
        merged = dict(f)
        merged.update({
            "priority": severity_scores.get(sev, 1),
            "reason": f"Auto-scored based on reported severity ({sev}). Manual review recommended.",
            "name": name,
            "severity": sev.capitalize()
        })
        results.append(merged)
    return results


def analyze_findings(raw_findings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Analyze raw vulnerability findings using AI.

    Batches large finding sets and falls back to rule-based scoring
    if the LLM is unavailable.
    """
    if not raw_findings:
        return []

    logger.info("Starting AI Analyzer Agent — %d finding(s) to process", len(raw_findings))

    system_prompt = (
        "You are an elite cybersecurity analyst and threat intelligence expert.\n"
        "Review automated vulnerability scan findings and determine actual risk.\n"
        "Filter out false positives. Prioritize by true severity and exploitability.\n"
        "Think like a hacker: 'Is this actually exploitable or just noise?'\n"
        "Provide a priority score (1-10) and clear reasoning."
    )

    all_analyzed: List[Dict[str, Any]] = []

    # Process in batches to avoid token limits
    for i in range(0, len(raw_findings), _BATCH_SIZE):
        batch = raw_findings[i : i + _BATCH_SIZE]

        # Inject index into batch
        indexed_batch = [{"index": idx, **f} for idx, f in enumerate(batch)]

        user_prompt = (
            f"Analyze these raw scan findings (batch {i // _BATCH_SIZE + 1}):\n\n"
            f"{json.dumps(indexed_batch, indent=2)}\n\n"
            "Return structured analysis. MUST include the EXACT 'index' provided for each finding."
        )

        try:
            response: AnalyzerResponse = call_llm(
                prompt=user_prompt,
                system_prompt=system_prompt,
                response_model=AnalyzerResponse,
            )
            # Merge LLM results back into the original batch items
            for analysis in response.findings:
                if 0 <= analysis.index < len(batch):
                    merged = dict(batch[analysis.index])
                    merged.update({
                        "priority": analysis.priority,
                        "reason": analysis.reason,
                        "severity": analysis.severity,
                        "name": analysis.name
                    })
                    all_analyzed.append(merged)

            logger.info(
                "AI Analyzer processed batch %d — %d finding(s)",
                i // _BATCH_SIZE + 1, len(response.findings),
            )
        except Exception as exc:
            logger.warning("Analyzer LLM failed on batch %d: %s — using fallback", i // _BATCH_SIZE + 1, exc)
            all_analyzed.extend(_fallback_analysis(batch))

    logger.info("AI Analyzer finished — %d total finding(s)", len(all_analyzed))
    return all_analyzed
