"""AI Agent Command endpoint (NLP -> Tool Execution)."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Any, Dict
import logging

from app.core.security import get_current_user
from app.models.user import User
from app.services.agent.orchestrator import AgentOrchestrator

logger = logging.getLogger("SageAI.command")

router = APIRouter(prefix="/ai", tags=["AI Commands"])

class CommandRequest(BaseModel):
    command: str
    target: str

@router.post("/command", response_model=Dict[str, Any])
async def execute_ai_command(payload: CommandRequest, current_user: User = Depends(get_current_user)):
    """
    Translates a natural language command into specific security tool operations,
    executes them concurrently, analyzes the results, and returns an executive summary.
    
    Example Command: "Scan for XSS and check SSL"
    Example Target: "https://example.com"
    """
    cmd = payload.command.strip()
    target = payload.target.strip()
    
    if not cmd or not target:
        raise HTTPException(status_code=400, detail="Command and target are required")
        
    try:
        org_id = current_user.memberships[0].organization_id if current_user.memberships else "system"
        orchestrator = AgentOrchestrator(org_id=str(org_id))
        
        # This runs Planner -> Executor -> Analyzer -> Reporter
        result = await orchestrator.execute_task(user_prompt=cmd, target=target)
        return result
        
    except Exception as e:
        logger.error(f"Command execution error: {e}")
        raise HTTPException(status_code=500, detail="Failed to execute AI command.")
