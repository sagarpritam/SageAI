"""
SageAI Deep Search Service — Recursive OSINT Pivoting Engine.

Module 10 // DEEP SEARCH: THE ABYSS — Autonomous multi-layer intelligence.

This service performs iterative, AI-driven OSINT research by:
1. Running all relevant intelligence modules against an initial target.
2. Using an LLM to extract new entities (emails, domains, IPs, usernames)
   from the findings — "pivots".
3. Recursively searching for each discovered pivot, up to a configurable
   depth limit, while avoiding duplicate work.
4. Building a discovery graph showing how entities are connected.
"""

import asyncio
import hashlib
import json
import logging
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable, Coroutine, Dict, List, Optional, Set

from app.services.llm.gateway import llm_gateway

logger = logging.getLogger("SageAI.deep_search")

# ── Constants ──────────────────────────────────────────────────────────────────

MAX_DEPTH_DEFAULT = 3
MAX_ENTITIES_DEFAULT = 25
CONCURRENCY_LIMIT = 5

ENTITY_EXTRACT_SYSTEM = """You are an elite OSINT analyst working inside SageAI.
Your job is to extract actionable intelligence pivots from raw OSINT findings.
A pivot is a NEW entity (email, domain, IP, username, phone) that was discovered
in the data and warrants further investigation.
Only extract entities that are genuinely interesting and not the original target."""

ENTITY_EXTRACT_PROMPT = """Analyze these OSINT findings for target: {target} ({target_type})

Findings summary (truncated):
{findings_summary}

Extract all NEW entities you can pivot to. Output ONLY valid JSON — no markdown:
{{
  "pivots": [
    {{"entity": "user@example.com", "entity_type": "email", "confidence": 0.9, "source": "which module found it", "reason": "why it's interesting"}},
    {{"entity": "sub.example.com", "entity_type": "domain", "confidence": 0.8, "source": "censys", "reason": "found in certificate SAN"}}
  ],
  "analysis": "2-3 sentence summary of what was found",
  "risk_indicators": ["list of concerning patterns"]
}}"""

BRIEFING_SYSTEM = """You are SageAI's intelligence analyst. Write a concise,
actionable intelligence briefing based on the deep search results."""

BRIEFING_PROMPT = """Write an intelligence briefing for deep search on: {target}

Search depth: {depth} levels
Total entities investigated: {total_entities}
Total findings: {total_findings}

Discovery chain:
{discovery_chain}

Key findings by entity:
{key_findings}

Write a structured intelligence briefing with:
1. Executive Summary (2-3 sentences)
2. Key Findings (bullet points)
3. Risk Assessment (Low/Medium/High/Critical with justification)
4. Attack Surface Observations
5. Recommended Actions

Keep it professional and actionable. Use markdown formatting."""


# ── Data Models ────────────────────────────────────────────────────────────────


class EntityType(str, Enum):
    DOMAIN = "domain"
    IP = "ip"
    EMAIL = "email"
    USERNAME = "username"
    PHONE = "phone"


@dataclass
class DiscoveredEntity:
    """An entity discovered during deep search."""

    entity: str
    entity_type: str
    confidence: float = 1.0
    source: str = "initial"
    reason: str = "initial target"
    discovered_from: Optional[str] = None  # parent entity
    depth: int = 0


@dataclass
class SearchNode:
    """A node in the discovery graph."""

    entity: str
    entity_type: str
    depth: int
    findings: List[Dict[str, Any]] = field(default_factory=list)
    pivots_found: List[str] = field(default_factory=list)
    status: str = "pending"  # pending | searching | complete | error
    error: Optional[str] = None
    duration_s: float = 0.0


@dataclass
class DeepSearchSession:
    """Tracks the full state of a deep search session."""

    session_id: str
    root_target: str
    root_type: str
    max_depth: int
    max_entities: int
    nodes: Dict[str, SearchNode] = field(default_factory=dict)
    edges: List[Dict[str, str]] = field(default_factory=list)
    visited: Set[str] = field(default_factory=set)
    timeline: List[Dict[str, Any]] = field(default_factory=list)
    status: str = "initializing"  # initializing | running | complete | error
    started_at: float = 0.0
    ai_briefing: str = ""


# ── Callback type for real-time updates ────────────────────────────────────────

ProgressCallback = Optional[Callable[[Dict[str, Any]], Coroutine]]


# ── Service ────────────────────────────────────────────────────────────────────


class DeepSearchService:
    """Autonomous recursive OSINT pivoting engine."""

    def __init__(self, org_id: str = "system"):
        self.org_id = org_id

    async def execute(
        self,
        target: str,
        target_type: str = "domain",
        max_depth: int = MAX_DEPTH_DEFAULT,
        max_entities: int = MAX_ENTITIES_DEFAULT,
        on_progress: ProgressCallback = None,
    ) -> Dict[str, Any]:
        """
        Execute a full deep search session.

        Parameters
        ----------
        target : str
            The initial target to investigate.
        target_type : str
            One of: domain, ip, email, username, phone.
        max_depth : int
            Maximum recursion depth (default 3).
        max_entities : int
            Maximum total entities to investigate (safety cap).
        on_progress : ProgressCallback
            Optional async callback for real-time updates.

        Returns
        -------
        dict with full session results, discovery graph, and AI briefing.
        """
        session_id = hashlib.md5(
            f"{target}:{target_type}:{time.time()}".encode()
        ).hexdigest()[:12]

        session = DeepSearchSession(
            session_id=session_id,
            root_target=target,
            root_type=target_type,
            max_depth=max_depth,
            max_entities=max_entities,
            started_at=time.time(),
        )

        logger.info(
            f"[DeepSearch] Session {session_id}: Starting for {target} "
            f"(type={target_type}, depth={max_depth}, max={max_entities})"
        )

        await self._emit(on_progress, {
            "event": "session_started",
            "session_id": session_id,
            "target": target,
            "target_type": target_type,
            "max_depth": max_depth,
        })

        # Seed the initial entity
        initial = DiscoveredEntity(
            entity=target,
            entity_type=target_type,
            source="user_input",
            reason="Initial target provided by user",
            depth=0,
        )

        session.status = "running"

        # Run the recursive search
        try:
            await self._search_entity(session, initial, on_progress)
        except Exception as e:
            logger.error(f"[DeepSearch] Session {session_id} failed: {e}")
            session.status = "error"

        # Generate AI briefing
        session.status = "generating_briefing"
        await self._emit(on_progress, {
            "event": "generating_briefing",
            "session_id": session_id,
        })

        try:
            session.ai_briefing = await self._generate_briefing(session)
        except Exception as e:
            logger.warning(f"[DeepSearch] Briefing generation failed: {e}")
            session.ai_briefing = f"Briefing generation failed: {e}"

        session.status = "complete"
        total_duration = time.time() - session.started_at

        result = self._build_result(session, total_duration)

        await self._emit(on_progress, {
            "event": "session_complete",
            "session_id": session_id,
            "total_entities": len(session.nodes),
            "total_findings": result["stats"]["total_findings"],
            "duration_s": round(total_duration, 2),
        })

        logger.info(
            f"[DeepSearch] Session {session_id} complete: "
            f"{len(session.nodes)} entities, "
            f"{result['stats']['total_findings']} findings, "
            f"{total_duration:.1f}s"
        )

        return result

    # ── Core recursive search ──────────────────────────────────────────────

    async def _search_entity(
        self,
        session: DeepSearchSession,
        entity: DiscoveredEntity,
        on_progress: ProgressCallback,
    ):
        """Search a single entity and recursively pivot on discoveries."""
        entity_key = f"{entity.entity_type}:{entity.entity}"

        # Guard: already visited or cap reached
        if entity_key in session.visited:
            return
        if len(session.visited) >= session.max_entities:
            logger.info("[DeepSearch] Entity cap reached, stopping expansion")
            return
        if entity.depth > session.max_depth:
            return

        session.visited.add(entity_key)

        # Create graph node
        node = SearchNode(
            entity=entity.entity,
            entity_type=entity.entity_type,
            depth=entity.depth,
            status="searching",
        )
        session.nodes[entity_key] = node

        # Add edge from parent
        if entity.discovered_from:
            parent_key = entity.discovered_from
            session.edges.append({
                "from": parent_key,
                "to": entity_key,
                "source": entity.source,
                "reason": entity.reason,
            })

        await self._emit(on_progress, {
            "event": "entity_search_started",
            "entity": entity.entity,
            "entity_type": entity.entity_type,
            "depth": entity.depth,
            "total_searched": len(session.visited),
        })

        # Run OSINT modules
        t0 = time.time()
        try:
            findings = await self._run_modules(entity.entity, entity.entity_type)
            node.findings = findings
            node.status = "complete"
            node.duration_s = time.time() - t0
        except Exception as e:
            logger.warning(f"[DeepSearch] Module scan failed for {entity.entity}: {e}")
            node.status = "error"
            node.error = str(e)
            node.duration_s = time.time() - t0
            return

        session.timeline.append({
            "entity": entity.entity,
            "entity_type": entity.entity_type,
            "depth": entity.depth,
            "findings_count": len(findings),
            "duration_s": round(node.duration_s, 2),
        })

        await self._emit(on_progress, {
            "event": "entity_search_complete",
            "entity": entity.entity,
            "entity_type": entity.entity_type,
            "depth": entity.depth,
            "findings_count": len(findings),
            "duration_s": round(node.duration_s, 2),
        })

        # If we haven't hit max depth, extract pivots and recurse
        if entity.depth < session.max_depth and len(session.visited) < session.max_entities:
            pivots = await self._extract_pivots(
                entity.entity, entity.entity_type, findings
            )

            node.pivots_found = [f"{p.entity_type}:{p.entity}" for p in pivots]

            await self._emit(on_progress, {
                "event": "pivots_discovered",
                "parent": entity.entity,
                "pivots": [
                    {"entity": p.entity, "type": p.entity_type, "confidence": p.confidence}
                    for p in pivots
                ],
            })

            # Search pivots concurrently with a semaphore
            sem = asyncio.Semaphore(CONCURRENCY_LIMIT)

            async def bounded_search(pivot: DiscoveredEntity):
                async with sem:
                    await self._search_entity(session, pivot, on_progress)

            tasks = []
            for pivot in pivots:
                if len(session.visited) >= session.max_entities:
                    break
                pivot_key = f"{pivot.entity_type}:{pivot.entity}"
                if pivot_key not in session.visited:
                    pivot.discovered_from = entity_key
                    pivot.depth = entity.depth + 1
                    tasks.append(bounded_search(pivot))

            if tasks:
                await asyncio.gather(*tasks, return_exceptions=True)

    # ── Module runner ──────────────────────────────────────────────────────

    async def _run_modules(self, target: str, target_type: str) -> List[Dict[str, Any]]:
        """Run applicable OSINT modules for an entity."""
        from app.services.intelligence.censys_intel import censys_scan
        from app.services.intelligence.darkweb_intel import darkweb_search
        from app.services.intelligence.identity_intel import identity_resolve
        from app.services.intelligence.intelx_intel import intelx_search
        from app.services.intelligence.osint_industries_intel import osint_industries_lookup
        from app.services.intelligence.phishstats_intel import phishstats_scan
        from app.services.intelligence.recon_ng_intel import recon_ng_scan
        from app.services.intelligence.shodan_intel import shodan_scan
        from app.services.intelligence.spiderfoot_intel import spiderfoot_scan
        from app.services.intelligence.urlhaus_intel import urlhaus_scan

        all_findings = []

        if target_type in ("domain", "ip"):
            results = await asyncio.gather(
                shodan_scan(target),
                censys_scan(target),
                recon_ng_scan(target),
                spiderfoot_scan(target),
                phishstats_scan(target),
                urlhaus_scan(target),
                return_exceptions=True,
            )
            for r in results:
                if isinstance(r, list):
                    all_findings.extend(r)

        if target_type in ("email", "phone"):
            try:
                r = await osint_industries_lookup(target, target_type)
                if isinstance(r, list):
                    all_findings.extend(r)
            except Exception:
                pass

        if target_type in ("domain", "email", "username"):
            results = await asyncio.gather(
                intelx_search(target),
                darkweb_search(target),
                return_exceptions=True,
            )
            for r in results:
                if isinstance(r, list):
                    all_findings.extend(r)

        if target_type in ("username", "email"):
            try:
                r = await identity_resolve(target, target_type)
                if isinstance(r, list):
                    all_findings.extend(r)
            except Exception:
                pass

        return all_findings

    # ── AI Pivot extraction ────────────────────────────────────────────────

    async def _extract_pivots(
        self, target: str, target_type: str, findings: List[Dict[str, Any]]
    ) -> List[DiscoveredEntity]:
        """Use LLM to extract new entities from findings."""
        if not findings:
            return []

        # Truncate findings to avoid token overflow
        findings_summary = json.dumps(findings[:30], default=str)[:4000]

        try:
            prompt = ENTITY_EXTRACT_PROMPT.format(
                target=target,
                target_type=target_type,
                findings_summary=findings_summary,
            )
            response = await llm_gateway.generate(
                prompt,
                system_message=ENTITY_EXTRACT_SYSTEM,
                org_id=self.org_id,
            )

            cleaned = response.replace("```json", "").replace("```", "").strip()
            data = json.loads(cleaned)

            pivots = []
            for p in data.get("pivots", []):
                # Skip the original target
                if p.get("entity", "").lower() == target.lower():
                    continue
                # Validate entity type
                if p.get("entity_type") not in ("domain", "ip", "email", "username", "phone"):
                    continue
                # Confidence filter
                if p.get("confidence", 0) < 0.5:
                    continue

                pivots.append(DiscoveredEntity(
                    entity=p["entity"],
                    entity_type=p["entity_type"],
                    confidence=p.get("confidence", 0.7),
                    source=p.get("source", "ai_extraction"),
                    reason=p.get("reason", "Discovered in findings"),
                ))

            logger.info(f"[DeepSearch] Extracted {len(pivots)} pivots from {target}")
            return pivots[:8]  # Cap pivots per entity

        except Exception as e:
            logger.warning(f"[DeepSearch] Pivot extraction failed for {target}: {e}")
            return []

    # ── AI Briefing ────────────────────────────────────────────────────────

    async def _generate_briefing(self, session: DeepSearchSession) -> str:
        """Generate an AI intelligence briefing from the session."""
        discovery_chain = []
        for edge in session.edges[:20]:
            discovery_chain.append(
                f"  {edge['from']} → {edge['to']} (via {edge['source']}: {edge['reason']})"
            )

        key_findings = []
        for key, node in list(session.nodes.items())[:15]:
            if node.findings:
                key_findings.append(
                    f"  [{node.entity_type}] {node.entity}: "
                    f"{len(node.findings)} findings"
                )

        total_findings = sum(len(n.findings) for n in session.nodes.values())

        prompt = BRIEFING_PROMPT.format(
            target=session.root_target,
            depth=session.max_depth,
            total_entities=len(session.nodes),
            total_findings=total_findings,
            discovery_chain="\n".join(discovery_chain) or "  (no pivots discovered)",
            key_findings="\n".join(key_findings) or "  (no findings)",
        )

        return await llm_gateway.generate(
            prompt,
            system_message=BRIEFING_SYSTEM,
            org_id=self.org_id,
        )

    # ── Result builder ─────────────────────────────────────────────────────

    def _build_result(self, session: DeepSearchSession, total_duration: float) -> Dict[str, Any]:
        """Build the final result dictionary."""
        total_findings = sum(len(n.findings) for n in session.nodes.values())
        max_depth_reached = max(
            (n.depth for n in session.nodes.values()), default=0
        )

        # Build graph for visualization
        graph_nodes = []
        for key, node in session.nodes.items():
            graph_nodes.append({
                "id": key,
                "label": node.entity,
                "type": node.entity_type,
                "depth": node.depth,
                "findings_count": len(node.findings),
                "status": node.status,
            })

        graph_edges = []
        for edge in session.edges:
            graph_edges.append({
                "source": edge["from"],
                "target": edge["to"],
                "label": edge["source"],
                "reason": edge["reason"],
            })

        return {
            "session_id": session.session_id,
            "status": session.status,
            "target": session.root_target,
            "target_type": session.root_type,
            "stats": {
                "total_entities": len(session.nodes),
                "total_findings": total_findings,
                "max_depth_reached": max_depth_reached,
                "max_depth_configured": session.max_depth,
                "duration_s": round(total_duration, 2),
            },
            "graph": {
                "nodes": graph_nodes,
                "edges": graph_edges,
            },
            "timeline": session.timeline,
            "briefing": session.ai_briefing,
            "entities": {
                key: {
                    "entity": node.entity,
                    "entity_type": node.entity_type,
                    "depth": node.depth,
                    "findings_count": len(node.findings),
                    "findings": node.findings[:10],  # truncate per entity
                    "pivots_found": node.pivots_found,
                    "status": node.status,
                    "duration_s": node.duration_s,
                }
                for key, node in session.nodes.items()
            },
        }

    # ── Progress emitter ───────────────────────────────────────────────────

    @staticmethod
    async def _emit(callback: ProgressCallback, data: Dict[str, Any]):
        """Emit a progress event if callback is registered."""
        if callback:
            try:
                await callback(data)
            except Exception as e:
                logger.warning(f"[DeepSearch] Progress callback error: {e}")
