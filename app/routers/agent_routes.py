"""
SageAI 2.0 — Multi-Agent API Routes
Exposes the multi-agent security team via REST endpoints.
"""

import logging
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.models.user import User
from app.plugins.registry import get_marketplace_listing, run_all_plugins
from app.schemas.responses import (
    AgentListResponse,
    AsyncAssessmentResponse,
    AttackPathResponse,
    PluginListingResponse,
    PluginRunAllResponse,
)
from app.services.agent.multi_agent_orchestrator import MultiAgentOrchestrator
from app.services.knowledge_graph import SecurityKnowledgeGraph

router = APIRouter(prefix="/agents", tags=["Multi-Agent AI"])
logger = logging.getLogger("SageAI.agent_routes")


class AssessmentRequest(BaseModel):
    target: str
    mode: str = "full"  # full | quick | recon
    use_knowledge_graph: bool = True


@router.post("/assess", summary="Run Full Multi-Agent Security Assessment")
@limiter.limit("10/minute")
async def run_assessment(
    request: Request,
    req: AssessmentRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Triggers the full 5-agent security assessment:
    ReconAgent → ScannerAgent → ExploitAgent → KnowledgeGraph → ReportAgent

    For large targets use mode='quick' for a faster 2-agent run.
    """
    org_id = str(current_user["org"])
    target = req.target.replace("https://", "").replace("http://", "").split("/")[0]

    orchestrator = MultiAgentOrchestrator(org_id=org_id)
    kg = (
        SecurityKnowledgeGraph(org_id=org_id, db=db)
        if req.use_knowledge_graph
        else None
    )

    if req.mode == "quick":
        try:
            result = await orchestrator.run_targeted(target, mode="quick")
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    # Full assessment (can be slow for large targets)
    try:
        result = await orchestrator.run_full_assessment(
            target=target,
            scan_context=f"{req.mode} security assessment",
            knowledge_graph=kg,
        )
        return result
    except Exception as e:
        logger.error(f"Multi-agent assessment failed for {target}: {e}")
        raise HTTPException(status_code=500, detail=f"Assessment failed: {str(e)}")


@router.post("/assess/async", summary="Start Async Assessment (Background)", response_model=AsyncAssessmentResponse)
@limiter.limit("10/minute")
async def run_assessment_async(
    request: Request,
    req: AssessmentRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Starts multi-agent assessment in background. Poll scan results for status."""
    org_id = str(current_user["org"])
    target = req.target.replace("https://", "").replace("http://", "").split("/")[0]

    async def _run():
        orchestrator = MultiAgentOrchestrator(org_id=org_id)
        await orchestrator.run_full_assessment(target=target)

    background_tasks.add_task(_run)
    return {
        "status": "started",
        "target": target,
        "message": "Multi-agent assessment running in background.",
    }


@router.get("/status", summary="List Available Agents", response_model=AgentListResponse)
@limiter.limit("60/minute")
async def list_agents(request: Request, current_user: User = Depends(get_current_user)):
    """Returns the list of AI agents available in the system."""
    return {
        "agents": [
            {
                "name": "ReconAgent",
                "role": "Attack surface discovery — subdomains, DNS, Shodan",
                "status": "online",
            },
            {
                "name": "ScannerAgent",
                "role": "Vulnerability scanning — ports, SSL, HTTP, OSINT",
                "status": "online",
            },
            {
                "name": "ExploitAgent",
                "role": "Exploitability verification — safe HTTP probes + AI analysis",
                "status": "online",
            },
            {
                "name": "DeveloperAgent",
                "role": "Code remediation — SAST patching + GitHub PRs",
                "status": "online",
            },
            {
                "name": "ReportAgent",
                "role": "Report generation — Executive summary + HackerOne format",
                "status": "online",
            },
        ],
        "orchestrator": "MultiAgentOrchestrator v2.0",
    }


# ── Knowledge Graph Routes ─────────────────────────────────────────


@router.get("/graph/paths", summary="Get Attack Paths from Knowledge Graph", response_model=AttackPathResponse)
@limiter.limit("30/minute")
async def get_attack_paths(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve stored attack paths from the Security Knowledge Graph."""
    org_id = str(current_user["org"])
    kg = SecurityKnowledgeGraph(org_id=org_id, db=db)
    paths = await kg.get_attack_paths()
    return {"org_id": org_id, "attack_paths": paths, "count": len(paths)}


# ── Plugin Marketplace Routes ──────────────────────────────────────


@router.get("/plugins", summary="Plugin Marketplace Listing", response_model=PluginListingResponse)
@limiter.limit("60/minute")
async def list_plugins(request: Request, current_user: User = Depends(get_current_user)):
    """Lists all available security plugins with metadata."""
    plugins = get_marketplace_listing()
    return {
        "total": len(plugins),
        "plugins": plugins,
        "categories": list({p["category"] for p in plugins}),
    }


class PluginRunRequest(BaseModel):
    target: str
    plugin_name: str


@router.post("/plugins/run", summary="Run a Specific Plugin")
@limiter.limit("20/minute")
async def run_plugin_endpoint(
    request: Request,
    req: PluginRunRequest,
    current_user: User = Depends(get_current_user),
):
    """Run a named security plugin against a target."""
    from app.plugins.registry import run_plugin

    result = await run_plugin(req.plugin_name, req.target)
    if result is None:
        raise HTTPException(
            status_code=404, detail=f"Plugin '{req.plugin_name}' not found"
        )
    return result.to_dict()


@router.post("/plugins/run-all", summary="Run All Plugins Against a Target", response_model=PluginRunAllResponse)
@limiter.limit("5/minute")
async def run_all_plugins_endpoint(
    request: Request,
    target: str,
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    """Run all applicable plugins against a target (or filter by category)."""
    plan = "pro"  # TODO: pull from user's plan
    results = await run_all_plugins(target, category=category, plan=plan)
    return {
        "target": target,
        "plugins_run": len(results),
        "results": [r.to_dict() for r in results],
    }
