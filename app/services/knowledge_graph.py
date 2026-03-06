"""
SageAI 2.0 — Security Knowledge Graph
AI-powered attack path analysis engine.

Uses PostgreSQL + JSON to store a graph of:
  Assets → Technologies → Vulnerabilities → CVEs → Exploit Paths

The LLM traverses this graph to answer:
  "What is the most critical attack path to the database?"
  "If Jenkins is compromised, what can an attacker reach next?"

No Neo4j required — PostgreSQL's JSONB gives us graph-like queries.
"""
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from sqlalchemy import Column, String, Text, DateTime, Float, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import Base
from app.services.llm.gateway import llm_gateway

logger = logging.getLogger("SageAI.knowledge_graph")


# ── DB Model ──────────────────────────────────────────────────────────
class GraphNode(Base):
    """Represents a node in the security knowledge graph."""
    __tablename__ = "kg_nodes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    org_id = Column(String, nullable=False)
    node_type = Column(String, nullable=False)   # asset | technology | vulnerability | cve | network_zone
    label = Column(String, nullable=False)        # human-readable name
    properties = Column(Text, default="{}")       # JSON blob
    risk_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class GraphEdge(Base):
    """Represents a directed edge between two graph nodes."""
    __tablename__ = "kg_edges"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    org_id = Column(String, nullable=False)
    source_id = Column(String, nullable=False)   # FK to kg_nodes.id
    target_id = Column(String, nullable=False)   # FK to kg_nodes.id
    edge_type = Column(String, nullable=False)   # HOSTS | RUNS | HAS_VULN | LEADS_TO | EXPOSES
    weight = Column(Float, default=1.0)          # higher = more dangerous path
    properties = Column(Text, default="{}")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


# ── Knowledge Graph Service ───────────────────────────────────────────

ATTACK_PATH_SYSTEM = """You are a security graph analyst for SageAI.
Given a list of assets and vulnerabilities, identify the most dangerous attack paths.
Think like a penetration tester: what chain of vulnerabilities leads to the highest impact?"""

ATTACK_PATH_PROMPT = """Analyze this security graph for: {target}

ASSETS:
{assets}

VULNERABILITIES:
{vulnerabilities}

TECHNOLOGY STACK (detected):
{technologies}

Identify the TOP 3 attack paths. For each, output a JSON object:
{{
  "path": "Internet → [host] → [tech] → [vuln] → [impact]",
  "risk_level": "Critical|High|Medium",
  "entry_point": "specific entry point",
  "pivot_points": ["intermediate hops"],
  "final_impact": "what the attacker achieves",
  "likelihood": "High|Medium|Low",
  "cvss_estimate": 0.0
}}

Return a JSON array of exactly 3 path objects (fewer if not enough data).
ONLY raw JSON array, no markdown."""


class SecurityKnowledgeGraph:
    """
    Build and query the security knowledge graph.
    Uses PostgreSQL for storage and LLM for attack path reasoning.
    """

    def __init__(self, org_id: str, db: Optional[AsyncSession] = None):
        self.org_id = org_id
        self.db = db

    async def build_from_scan(
        self,
        target: str,
        assets: List[str],
        findings: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Build/update the knowledge graph from scan results.
        Returns attack paths computed by AI.
        """
        logger.info(f"[KnowledgeGraph] Building graph for {target} ({len(assets)} assets, {len(findings)} findings)")

        # Extract technologies from findings
        technologies = set()
        vulnerabilities = []
        for f in findings:
            evidence = f.get("evidence", "")
            vuln_type = f.get("type", "")
            sev = f.get("severity", "Info")

            # Extract tech hints from finding
            for tech_keyword in ["nginx", "apache", "wordpress", "jenkins", "react", "nodejs",
                                 "mysql", "postgresql", "redis", "mongodb", "elasticsearch",
                                 "php", "python", "java", "ruby", "docker", "kubernetes"]:
                if tech_keyword.lower() in (evidence + vuln_type).lower():
                    technologies.add(tech_keyword)

            vulnerabilities.append({
                "type": vuln_type,
                "severity": sev,
                "confirmed": f.get("confirmed", False),
                "host": target,
            })

        # Persist to DB if available
        if self.db:
            await self._persist_nodes(target, assets, findings, technologies)

        # AI attack path analysis
        attack_paths = await self._compute_attack_paths(target, assets, vulnerabilities, technologies)

        return {
            "target": target,
            "node_count": len(assets) + len(findings),
            "edge_count": len(findings),
            "technologies": list(technologies),
            "attack_paths": attack_paths,
        }

    async def _persist_nodes(
        self,
        target: str,
        assets: List[str],
        findings: List[Dict],
        technologies: set,
    ):
        """Upsert graph nodes and edges into PostgreSQL."""
        if not self.db:
            return

        try:
            # Create asset nodes
            for asset in assets[:20]:
                node = GraphNode(
                    org_id=self.org_id,
                    node_type="asset",
                    label=asset,
                    properties=json.dumps({"target": target}),
                    risk_score=0.0,
                )
                self.db.add(node)

            # Create vulnerability nodes
            for finding in findings:
                sev_score = {"Critical": 9.0, "High": 7.0, "Medium": 5.0, "Low": 2.0, "Info": 0.5}
                node = GraphNode(
                    org_id=self.org_id,
                    node_type="vulnerability",
                    label=finding.get("type", "unknown"),
                    properties=json.dumps(finding),
                    risk_score=sev_score.get(finding.get("severity", "Info"), 0.5),
                )
                self.db.add(node)

            await self.db.commit()
        except Exception as e:
            logger.warning(f"[KnowledgeGraph] DB persist failed: {e}")
            await self.db.rollback()

    async def _compute_attack_paths(
        self,
        target: str,
        assets: List[str],
        vulnerabilities: List[Dict],
        technologies: set,
    ) -> List[Dict]:
        """Use LLM to identify attack paths in the graph."""
        try:
            prompt = ATTACK_PATH_PROMPT.format(
                target=target,
                assets=json.dumps(assets[:15]),
                vulnerabilities=json.dumps(vulnerabilities[:10], indent=2),
                technologies=list(technologies),
            )
            response = await llm_gateway.generate(
                prompt, system_message=ATTACK_PATH_SYSTEM, org_id=self.org_id
            )
            cleaned = response.replace("```json", "").replace("```", "").strip()
            paths = json.loads(cleaned)
            if isinstance(paths, list):
                return paths
        except Exception as e:
            logger.warning(f"[KnowledgeGraph] Attack path analysis failed: {e}")

        # Fallback: construct heuristic paths
        return self._heuristic_paths(target, assets, vulnerabilities)

    def _heuristic_paths(
        self, target: str, assets: List[str], vulnerabilities: List[Dict]
    ) -> List[Dict]:
        """Simple heuristic attack path construction when AI is unavailable."""
        paths = []
        critical = [v for v in vulnerabilities if v.get("severity") == "Critical"]
        high = [v for v in vulnerabilities if v.get("severity") == "High"]

        if critical:
            paths.append({
                "path": f"Internet → {target} → {critical[0]['type']} → Full Compromise",
                "risk_level": "Critical",
                "entry_point": target,
                "pivot_points": [],
                "final_impact": "Full system compromise",
                "likelihood": "High",
                "cvss_estimate": 9.5,
            })

        if high:
            paths.append({
                "path": f"Internet → {target} → {high[0]['type']} → Data Exfiltration",
                "risk_level": "High",
                "entry_point": target,
                "pivot_points": [],
                "final_impact": "Data exfiltration or privilege escalation",
                "likelihood": "Medium",
                "cvss_estimate": 7.5,
            })

        if len(assets) > 3:
            paths.append({
                "path": f"Internet → {assets[0]} → Lateral Movement → {assets[-1]}",
                "risk_level": "Medium",
                "entry_point": assets[0],
                "pivot_points": assets[1:-1][:2],
                "final_impact": "Internal network lateral movement",
                "likelihood": "Medium",
                "cvss_estimate": 5.5,
            })

        return paths

    async def get_attack_paths(self) -> List[Dict]:
        """Retrieve stored attack paths for the org from DB."""
        if not self.db:
            return []
        try:
            result = await self.db.execute(
                select(GraphNode)
                .where(GraphNode.org_id == self.org_id, GraphNode.node_type == "vulnerability")
                .order_by(GraphNode.risk_score.desc())
                .limit(20)
            )
            nodes = result.scalars().all()
            return [
                {
                    "label": n.label,
                    "risk_score": n.risk_score,
                    "properties": json.loads(n.properties or "{}"),
                }
                for n in nodes
            ]
        except Exception as e:
            logger.error(f"[KnowledgeGraph] get_attack_paths failed: {e}")
            return []
