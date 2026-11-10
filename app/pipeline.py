"""Autonomous Hacker Pipeline — orchestrates scan → parse → analyze → report.

Runs tool wrappers concurrently, feeds parsed findings through AI agents,
and produces a full security report with attack-graph visualization.
"""

import concurrent.futures
import enum
import json
import logging
import sys
import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional

from app.agents.analyzer import analyze_findings
from app.agents.decision_engine import decide_next_steps
from app.agents.planner import generate_plan
from app.agents.reporter import create_report
from app.parsers.nuclei_parser import parse_nuclei_findings
from app.tools.nmap_wrapper import run_nmap
from app.tools.nuclei_wrapper import run_nuclei
from app.tools.subfinder_wrapper import run_subfinder
from app.utils.graph_generator import generate_attack_graph

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


# ── Status Tracking ──────────────────────────────────────────────
class ScanStatus(str, enum.Enum):
    """Lifecycle states of a pipeline run."""

    QUEUED = "queued"
    PLANNING = "planning"
    ENUMERATING = "enumerating"
    SCANNING = "scanning"
    ANALYZING = "analyzing"
    REPORTING = "reporting"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class PipelineContext:
    """Tracks pipeline state — can be serialized for DB persistence."""

    scan_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    domain: str = ""
    status: ScanStatus = ScanStatus.QUEUED
    strategy: List[str] = field(default_factory=list)
    scanned_targets: List[str] = field(default_factory=list)
    iterations: List[Dict[str, Any]] = field(default_factory=list)
    analyzed_findings: List[Dict[str, Any]] = field(default_factory=list)
    report: Dict[str, Any] = field(default_factory=dict)
    attack_graph: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None
    started_at: float = field(default_factory=time.time)
    elapsed_seconds: float = 0.0

    def to_dict(self) -> dict:
        return {
            "scan_id": self.scan_id,
            "domain": self.domain,
            "status": self.status.value,
            "strategy": self.strategy,
            "scanned_targets": self.scanned_targets,
            "iterations": self.iterations,
            "analyzed_findings": self.analyzed_findings,
            "report": self.report,
            "attack_graph": self.attack_graph,
            "error": self.error,
            "elapsed_seconds": self.elapsed_seconds,
        }


# ── Progress Callback Type ───────────────────────────────────────
ProgressCallback = Optional[Callable[[ScanStatus, str, int], None]]


# ── Per-Target Scan ──────────────────────────────────────────────
def scan_target(target: str) -> dict:
    """Run nmap and nuclei concurrently for a single target."""
    logger.info("--- Scanning target %s ---", target)
    results: Dict[str, Any] = {"target": target, "nmap": {}, "nuclei": []}

    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        future_nmap = executor.submit(run_nmap, target, "top-100")
        future_nuclei = executor.submit(run_nuclei, target)

        # Nmap
        try:
            results["nmap"] = future_nmap.result()
            logger.info("[+] Nmap completed for %s", target)
        except Exception as exc:
            logger.error("[-] Nmap failed for %s: %s", target, exc)
            results["nmap"] = {"error": str(exc)}

        # Nuclei → parse + filter
        try:
            nuclei_raw = future_nuclei.result()
            parsed_nuclei = parse_nuclei_findings(nuclei_raw, min_severity="medium")
            results["nuclei"] = [f.model_dump() for f in parsed_nuclei]
            logger.info(
                "[+] Nuclei completed for %s — %d significant issue(s)",
                target,
                len(results["nuclei"]),
            )
        except Exception as exc:
            logger.error("[-] Nuclei failed for %s: %s", target, exc)
            results["nuclei"] = [{"error": str(exc)}]

    return results


# ── Main Pipeline ────────────────────────────────────────────────
def run_pipeline(
    domain: str,
    max_iterations: int = 2,
    on_progress: ProgressCallback = None,
) -> dict:
    """Autonomous Hacker Pipeline.

    1. AI Planner outlines strategy
    2. Subdomain enumeration
    3. Iterative scan loop with AI Decision Engine
    4. Final analysis, attack graph, and executive report
    """
    ctx = PipelineContext(domain=domain)

    def _emit(status: ScanStatus, detail: str = "", pct: int = 0):
        ctx.status = status
        if on_progress:
            try:
                on_progress(status, detail, pct)
            except Exception:
                pass

    try:
        logger.info(
            "🚀 Starting Autonomous AI Pipeline for %s (ID: %s)", domain, ctx.scan_id
        )

        # ── 1. Planning ──────────────────────────
        _emit(ScanStatus.PLANNING, "AI Planner generating strategy", 5)
        scan_plan = generate_plan(domain)
        ctx.strategy = scan_plan.steps
        logger.info("Strategic Plan: %s", ctx.strategy)

        # ── 2. Subdomain Enumeration ─────────────
        _emit(ScanStatus.ENUMERATING, "Running subfinder", 15)
        subfinder_result = run_subfinder(domain)
        discovered_subdomains: List[str] = (
            subfinder_result
            if isinstance(subfinder_result, list)
            else subfinder_result.subdomains
        )

        scanned_targets: set = set()
        all_raw_nuclei: List[Dict[str, Any]] = []

        # Initial targets: domain + up to 2 subdomains
        current_targets = [domain]
        for sub in discovered_subdomains:
            if sub != domain and len(current_targets) < 3:
                current_targets.append(sub)

        # ── 3. Autonomous Scan Loop ──────────────
        for iteration in range(1, max_iterations + 1):
            if not current_targets:
                logger.info("No targets left. Breaking loop.")
                break

            pct = 20 + int(60 * ((iteration - 1) / max_iterations))
            _emit(ScanStatus.SCANNING, f"Iteration {iteration}/{max_iterations}", pct)
            logger.info("⚡ --- ITERATION %d / %d ---", iteration, max_iterations)

            iteration_results: Dict[str, Any] = {
                "iteration": iteration,
                "targets_scanned": list(current_targets),
                "actions_taken": [],
                "results": [],
            }

            with concurrent.futures.ThreadPoolExecutor(
                max_workers=min(len(current_targets), 5)
            ) as executor:
                future_map = {
                    executor.submit(scan_target, t): t for t in current_targets
                }
                for future in concurrent.futures.as_completed(future_map):
                    target_name = future_map[future]
                    try:
                        target_result = future.result()
                        iteration_results["results"].append(target_result)
                        scanned_targets.add(target_result["target"])

                        for finding in target_result.get("nuclei", []):
                            if "error" not in finding:
                                finding["discovered_on_target"] = target_result[
                                    "target"
                                ]
                                all_raw_nuclei.append(finding)
                    except Exception as exc:
                        logger.error("Target %s raised: %s", target_name, exc)

            ctx.scanned_targets = list(scanned_targets)
            ctx.iterations.append(iteration_results)

            # AI Decision Engine (skip on final iteration)
            if iteration < max_iterations and all_raw_nuclei:
                _emit(
                    ScanStatus.ANALYZING,
                    "AI Decision Engine deciding next steps",
                    pct + 5,
                )
                analyzed_batch = analyze_findings(all_raw_nuclei)
                decisions = decide_next_steps(analyzed_batch, ctx.scanned_targets)

                next_targets: List[str] = []
                for action in decisions:
                    t = action.target
                    if t not in scanned_targets and t not in next_targets:
                        logger.warning(
                            "💡 AI Pivot: %s → %s (%s)", action.reason, t, action.tool
                        )
                        next_targets.append(t)
                        iteration_results["actions_taken"].append(action.model_dump())

                current_targets = next_targets
            else:
                current_targets = []

        # ── 4. Final Reporting ───────────────────
        _emit(ScanStatus.REPORTING, "AI generating executive report", 90)
        ctx.analyzed_findings = analyze_findings(all_raw_nuclei)
        ctx.attack_graph = generate_attack_graph(all_raw_nuclei)
        ctx.report = create_report(ctx.analyzed_findings)

        ctx.elapsed_seconds = round(time.time() - ctx.started_at, 2)
        _emit(ScanStatus.COMPLETED, "Pipeline finished", 100)
        logger.info(
            "🚀 Pipeline completed for ID: %s (%.2fs)", ctx.scan_id, ctx.elapsed_seconds
        )

    except Exception as exc:
        ctx.error = str(exc)
        ctx.elapsed_seconds = round(time.time() - ctx.started_at, 2)
        _emit(ScanStatus.FAILED, str(exc), 0)
        logger.error("Pipeline failed for %s: %s", domain, exc, exc_info=True)

    return ctx.to_dict()


# ── CLI Entry Point ──────────────────────────────────────────────
if __name__ == "__main__":
    target_domain = sys.argv[1] if len(sys.argv) > 1 else "example.com"
    results = run_pipeline(target_domain)
    print("\n--- Final Autonomous Output ---")
    print(json.dumps(results, indent=2))
