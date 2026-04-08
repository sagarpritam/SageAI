import json
import logging
from typing import Any, Dict, List

from pydantic import BaseModel, Field

from api.services.ai_service import call_llm

logger = logging.getLogger(__name__)

class Action(BaseModel):
    tool: str = Field(description="The scanning tool to run next (e.g., 'nuclei', 'nmap')")
    target: str = Field(description="The specific subdomain, IP, or URL to target")
    reason: str = Field(description="Why this step is necessary based on the previous findings")

class DecisionResponse(BaseModel):
    actions: List[Action] = Field(description="A list of 0-3 actions to execute next. Return an empty list if no further scanning is needed.")

def decide_next_steps(analyzed_findings: List[Dict[str, Any]], previous_targets: List[str]) -> List[Action]:
    """
    Acts as the 'Brain' of SageAI. Reviews the analyzed findings and decides if deeper scans are warranted.
    Avoids repeating scans on already investigated targets unless necessary.
    """
    logger.info("Starting AI Decision Engine...")

    if not analyzed_findings:
        logger.info("No findings provided to decision engine. Halting.")
        return []

    system_prompt = (
        "You are a Senior Penetration Tester and the autonomous decision engine for an AI security platform.\n"
        "Your job is to review the current vulnerabilities and strategically decide what to scan NEXT.\n"
        "Focus on exploitability and logical attack paths.\n"
        "Rules:\n"
        "- If you see a login panel, you might suggest a targeted directory brute force or specific template scan.\n"
        "- If you see a weird open port, you might suggest a deeper service scan.\n"
        "- Prioritize high-risk findings.\n"
        "- DO NOT suggest actions on targets that have already been fully scanned unless you have a specific new tool in mind.\n"
        "- KEEP IT FOCUSED. Return a maximum of 3 highly critical next steps, or an empty list if the attack loop should end."
    )

    user_prompt = (
        f"Analyzed Findings:\n{json.dumps(analyzed_findings, indent=2)}\n\n"
        f"Previously Scanned Targets:\n{json.dumps(previous_targets, indent=2)}\n\n"
        "What are the absolute next best actions to take?"
    )

    try:
        response: DecisionResponse = call_llm(
            prompt=user_prompt,
            system_prompt=system_prompt,
            response_model=DecisionResponse
        )
        logger.info(f"AI Decision Engine generated {len(response.actions)} follow-up actions.")
        return response.actions
    except Exception as e:
        logger.warning(f"Decision engine failed: {e}. Using fallback strategy.")

        # Fallback: if we haven't done nuclei or nmap yet, trigger default rule-based action
        actions: List[Action] = []
        # Basic heuristic
        if not any("nuclei" in t for t in previous_targets):
            actions.append(Action(tool="nuclei", target="All Discovered Services", reason="Fallback strategy: general vulnerability check"))

        return actions
