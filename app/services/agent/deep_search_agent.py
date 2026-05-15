"""
SageAI 2.0 — DeepSearchAgent

Module 10 // DEEP SEARCH: THE ABYSS

An autonomous AI agent that drives recursive OSINT intelligence gathering.
Unlike a simple sweep, the DeepSearchAgent reasons about findings,
decides which pivots are worth investigating, and builds a comprehensive
intelligence picture of a target's digital footprint.

Pipeline:
  User Input → DeepSearchService (recursive) → AI Pivot Extraction →
  Discovery Graph → Intelligence Briefing → Structured Report
"""

import logging
import time
from typing import Any, Callable, Coroutine, Dict, Optional

from app.services.intelligence.deep_search_service import DeepSearchService

logger = logging.getLogger("SageAI.deep_search_agent")


class DeepSearchAgent:
    """
    Autonomous deep search agent.
    Wraps DeepSearchService with agent-level controls, logging,
    and structured output compatible with the multi-agent orchestrator.
    """

    def __init__(self, org_id: str = "system"):
        self.org_id = org_id
        self.service = DeepSearchService(org_id=org_id)

    async def run(
        self,
        target: str,
        target_type: str = "domain",
        max_depth: int = 3,
        max_entities: int = 25,
        on_progress: Optional[Callable[[Dict[str, Any]], Coroutine]] = None,
    ) -> Dict[str, Any]:
        """
        Execute a deep search and return structured agent output.

        Parameters
        ----------
        target : str
            Domain, IP, email, username, or phone.
        target_type : str
            One of: domain, ip, email, username, phone.
        max_depth : int
            Maximum recursion depth.
        max_entities : int
            Maximum total entities to investigate.
        on_progress : callable
            Optional async callback for real-time updates.

        Returns
        -------
        dict with agent name, results, graph, briefing, and metadata.
        """
        logger.info(
            f"[DeepSearchAgent] Starting autonomous deep search: "
            f"{target} ({target_type}), depth={max_depth}"
        )

        t0 = time.time()

        try:
            result = await self.service.execute(
                target=target,
                target_type=target_type,
                max_depth=max_depth,
                max_entities=max_entities,
                on_progress=on_progress,
            )

            duration = time.time() - t0

            return {
                "agent": "DeepSearchAgent",
                "module": "deep_search",
                "codename": "THE ABYSS",
                "target": target,
                "target_type": target_type,
                "status": result.get("status", "complete"),
                "session_id": result.get("session_id"),
                "stats": result.get("stats", {}),
                "graph": result.get("graph", {}),
                "timeline": result.get("timeline", []),
                "briefing": result.get("briefing", ""),
                "entities": result.get("entities", {}),
                "duration_s": round(duration, 2),
            }

        except Exception as e:
            duration = time.time() - t0
            logger.error(f"[DeepSearchAgent] Failed: {e}")
            return {
                "agent": "DeepSearchAgent",
                "module": "deep_search",
                "codename": "THE ABYSS",
                "target": target,
                "target_type": target_type,
                "status": "error",
                "error": str(e),
                "duration_s": round(duration, 2),
                "stats": {},
                "graph": {"nodes": [], "edges": []},
                "timeline": [],
                "briefing": "",
                "entities": {},
            }
