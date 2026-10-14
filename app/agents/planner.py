"""AI Planner Agent — generates initial scan strategy."""

import logging
from typing import List

from pydantic import BaseModel, Field

from app.services.ai_service import call_llm

logger = logging.getLogger(__name__)


class ScanPlan(BaseModel):
    steps: List[str] = Field(
        description="Sequential list of scanning tools and targets to execute."
    )


def generate_plan(target: str) -> ScanPlan:
    """Generate an AI-driven initial attack strategy for a given root domain.

    Falls back to a sensible default plan if the LLM is unavailable.
    """
    logger.info("Starting AI Planner Agent for target: %s", target)

    system_prompt = (
        "You are an elite automated penetration testing planner.\n"
        "Design the exact initial reconnaissance and scanning steps for a given target.\n"
        "Keep the plan concise, focused, and ordered logically.\n"
        "Do not suggest destructive tests."
    )

    user_prompt = f"Create an initial scan plan for the target: {target}"

    try:
        response: ScanPlan = call_llm(
            prompt=user_prompt,
            system_prompt=system_prompt,
            response_model=ScanPlan,
        )
        logger.info("AI Planner generated %d step(s).", len(response.steps))
        return response
    except Exception as exc:
        logger.warning("Planner LLM failed: %s — using default plan", exc)
        return ScanPlan(
            steps=[
                f"Run subfinder for subdomain enumeration on {target}",
                f"Run nmap top-100 port scan on {target} and discovered subdomains",
                "Run nuclei vulnerability scan (medium/high/critical) on all targets",
                "Analyze and correlate findings across all targets",
                "Generate executive report with risk scoring",
            ]
        )
