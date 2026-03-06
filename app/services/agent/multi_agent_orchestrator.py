"""
SageAI 2.0 — Multi-Agent Security Orchestrator

Replaces single-agent pipeline with a coordinated AI security team:

  ReconAgent     → Attack surface mapping
       ↓
  ScannerAgent   → Vulnerability scanning
       ↓
  ExploitAgent   → Exploitability verification
       ↓
  KnowledgeGraph → Attack path analysis
       ↓
  DeveloperAgent → Code remediation (optional, for SAST findings)
       ↓
  ReportAgent    → Final security report

Each agent is autonomous and communicates through structured data contracts.
The orchestrator manages the workflow, error recovery, and aggregation.
"""
import json
import logging
import asyncio
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from app.services.agent.recon_agent import ReconAgent
from app.services.agent.scanner_agent import ScannerAgent
from app.services.agent.exploit_agent import ExploitAgent
from app.services.agent.report_agent import ReportAgent

logger = logging.getLogger("SageAI.multi_agent")


class MultiAgentOrchestrator:
    """
    Coordinates the full AI security team workflow.
    Each agent receives the previous agent's output as context.
    """

    def __init__(self, org_id: str = "system"):
        self.org_id = org_id
        self.recon_agent = ReconAgent(org_id=org_id)
        self.scanner_agent = ScannerAgent(org_id=org_id)
        self.exploit_agent = ExploitAgent(org_id=org_id)
        self.report_agent = ReportAgent(org_id=org_id)

    async def run_full_assessment(
        self,
        target: str,
        scan_context: str = "full security assessment",
        knowledge_graph=None,  # Optional SecurityKnowledgeGraph instance
    ) -> Dict[str, Any]:
        """
        Run the complete 5-agent security assessment pipeline.
        
        Returns a comprehensive result dict with each agent's output
        plus a merged final report.
        """
        started_at = datetime.now(timezone.utc)
        logger.info(f"[MultiAgent] Starting full assessment: {target}")

        timeline = []

        # ── Phase 1: Reconnaissance ─────────────────────────────────
        t0 = datetime.now(timezone.utc)
        logger.info("[MultiAgent] Phase 1: ReconAgent starting")
        try:
            recon_result = await self.recon_agent.run(target)
        except Exception as e:
            logger.error(f"[MultiAgent] ReconAgent failed: {e}")
            recon_result = {"agent": "ReconAgent", "target": target, "subdomains": [target], "error": str(e), "ai_summary": {}}
        timeline.append({"phase": "recon", "duration_s": (datetime.now(timezone.utc) - t0).total_seconds()})
        logger.info(f"[MultiAgent] ReconAgent found {len(recon_result.get('subdomains', []))} hosts")

        # ── Phase 2: Scanning ────────────────────────────────────────
        t0 = datetime.now(timezone.utc)
        logger.info("[MultiAgent] Phase 2: ScannerAgent starting")
        # Scan the primary target + top interesting hosts from recon
        interesting = recon_result.get("ai_summary", {}).get("interesting_hosts", [])[:3]
        primary_targets = list(dict.fromkeys([target] + interesting))  # dedupe, preserve order

        scanner_results_list = []
        for scan_target in primary_targets[:3]:  # cap at 3 for performance
            try:
                res = await self.scanner_agent.run(scan_target, context=scan_context)
                scanner_results_list.append(res)
            except Exception as e:
                logger.warning(f"[MultiAgent] ScannerAgent failed for {scan_target}: {e}")

        # Merge scanner results
        all_findings = []
        all_tools_run = []
        for res in scanner_results_list:
            all_findings.extend(res.get("findings", []))
            all_tools_run.extend(res.get("tools_run", []))

        scanner_result = {
            "agent": "ScannerAgent",
            "targets": primary_targets[:3],
            "tools_run": list(set(all_tools_run)),
            "findings": all_findings,
            "scan_count": len(scanner_results_list),
        }
        timeline.append({"phase": "scan", "duration_s": (datetime.now(timezone.utc) - t0).total_seconds()})
        logger.info(f"[MultiAgent] ScannerAgent found {len(all_findings)} raw findings")

        # ── Phase 3: Exploit Verification ───────────────────────────
        t0 = datetime.now(timezone.utc)
        logger.info("[MultiAgent] Phase 3: ExploitAgent starting")
        try:
            exploit_result = await self.exploit_agent.run(target, all_findings)
        except Exception as e:
            logger.error(f"[MultiAgent] ExploitAgent failed: {e}")
            exploit_result = {
                "agent": "ExploitAgent", "target": target,
                "verified_findings": all_findings, "critical_confirmed": 0, "error": str(e)
            }
        timeline.append({"phase": "exploit", "duration_s": (datetime.now(timezone.utc) - t0).total_seconds()})
        logger.info(f"[MultiAgent] ExploitAgent confirmed {exploit_result.get('critical_confirmed', 0)} critical findings")

        # ── Phase 4: Knowledge Graph Attack Paths ───────────────────
        attack_paths = []
        if knowledge_graph is not None:
            t0 = datetime.now(timezone.utc)
            logger.info("[MultiAgent] Phase 4: Building attack paths")
            try:
                graph_data = await knowledge_graph.build_from_scan(
                    target=target,
                    assets=recon_result.get("subdomains", []),
                    findings=exploit_result.get("verified_findings", all_findings),
                )
                attack_paths = graph_data.get("attack_paths", [])
            except Exception as e:
                logger.warning(f"[MultiAgent] Knowledge graph failed: {e}")
            timeline.append({"phase": "graph", "duration_s": (datetime.now(timezone.utc) - t0).total_seconds()})

        # ── Phase 5: Report Generation ───────────────────────────────
        t0 = datetime.now(timezone.utc)
        logger.info("[MultiAgent] Phase 5: ReportAgent generating final report")
        try:
            report_result = await self.report_agent.run(
                target=target,
                recon_result=recon_result,
                scanner_result=scanner_result,
                exploit_result=exploit_result,
                knowledge_graph_paths=attack_paths,
            )
        except Exception as e:
            logger.error(f"[MultiAgent] ReportAgent failed: {e}")
            report_result = {
                "agent": "ReportAgent", "target": target,
                "risk_score": 0, "risk_level": "Unknown",
                "markdown_report": f"Report generation failed: {e}",
                "error": str(e),
            }
        timeline.append({"phase": "report", "duration_s": (datetime.now(timezone.utc) - t0).total_seconds()})

        total_duration = (datetime.now(timezone.utc) - started_at).total_seconds()

        return {
            "orchestrator": "MultiAgentOrchestrator",
            "version": "2.0",
            "target": target,
            "started_at": started_at.isoformat(),
            "total_duration_s": round(total_duration, 2),
            "pipeline": {
                "recon": recon_result,
                "scanner": scanner_result,
                "exploit": exploit_result,
                "report": report_result,
            },
            "attack_paths": attack_paths,
            "timeline": timeline,
            # Top-level convenience fields
            "risk_score": report_result.get("risk_score", 0),
            "risk_level": report_result.get("risk_level", "Unknown"),
            "finding_count": report_result.get("finding_count", len(all_findings)),
            "critical_confirmed": report_result.get("critical_confirmed", 0),
            "subdomains_found": len(recon_result.get("subdomains", [])),
            "executive_summary": report_result.get("markdown_report", ""),
            "verified_findings": exploit_result.get("verified_findings", all_findings),
        }

    async def run_targeted(
        self,
        target: str,
        mode: str = "quick",
    ) -> Dict[str, Any]:
        """
        Lighter-weight targeted scan.
        mode="quick"  → Scanner + Report only
        mode="recon"  → Recon + Scanner + Report
        """
        if mode == "quick":
            scanner_result = await self.scanner_agent.run(target, context="quick scan")
            exploit_result = await self.exploit_agent.run(target, scanner_result.get("findings", []))
            return await self.report_agent.run(
                target=target,
                recon_result={"ai_summary": {}, "subdomains": [target]},
                scanner_result=scanner_result,
                exploit_result=exploit_result,
            )
        else:
            return await self.run_full_assessment(target, scan_context=mode)
