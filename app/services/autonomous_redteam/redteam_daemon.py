"""
Option B: Autonomous Continuous Red-Team Swarm Background Daemon.

Provides a persistent background scheduler running periodic, non-deterministic
adversarial stress tests across all 79 defense capabilities, maintaining a live buffer
of deflection results, mitigation latencies, and resilience indices.
"""

import threading
import time
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, List, Optional

from app.services.autonomous_redteam.autonomous_redteam_engine import (
    autonomous_redteam_cluster,
)


@dataclass
class DaemonExecutionTick:
    tick_id: int
    campaign_id: str
    timestamp: str
    attack_vectors: int
    deflection_pct: float
    mitigation_latency_ms: float
    resilience_score: float
    verdict: str


class AutonomousRedTeamDaemon:
    """
    Continuous background daemon for autonomous red-teaming and resilience auditing.
    """

    def __init__(self):
        self.is_running: bool = False
        self.cycle_interval_seconds: float = 10.0
        self.total_ticks: int = 0
        self.recent_ticks: List[DaemonExecutionTick] = []
        self._thread: Optional[threading.Thread] = None
        self._lock = threading.Lock()

    def start_daemon(self, cycle_interval_seconds: float = 10.0) -> Dict[str, Any]:
        with self._lock:
            if self.is_running:
                return {
                    "daemon_state": "ALREADY_RUNNING",
                    "cycle_interval_seconds": self.cycle_interval_seconds,
                    "total_ticks": self.total_ticks,
                }

            self.cycle_interval_seconds = max(2.0, cycle_interval_seconds)
            self.is_running = True
            self._thread = threading.Thread(target=self._daemon_loop, daemon=True)
            self._thread.start()

            # Execute an immediate first tick
            self._execute_single_tick()

            return {
                "daemon_state": "STARTED_ACTIVE",
                "cycle_interval_seconds": self.cycle_interval_seconds,
                "total_ticks": self.total_ticks,
                "message": "Continuous Red-Team swarm daemon launched in background.",
            }

    def stop_daemon(self) -> Dict[str, Any]:
        with self._lock:
            if not self.is_running:
                return {"daemon_state": "ALREADY_STOPPED", "total_ticks": self.total_ticks}

            self.is_running = False
            return {
                "daemon_state": "STOPPED",
                "total_ticks": self.total_ticks,
                "message": "Continuous Red-Team swarm daemon gracefully stopped.",
            }

    def _execute_single_tick(self):
        res = autonomous_redteam_cluster.launch_adversarial_campaign(
            target_domains=[
                "ORBITAL_PNT",
                "QUANTUM_NETWORK",
                "DEEP_SPACE_RELAY",
                "SUBTERRANEAN_SEISMIC",
                "PLASMA_SHIELD",
                "SOLAR_SAIL_PROPULSION",
                "HEMP_DYNAMO_DECOUPLER",
                "MANTLE_GEONEUTRINO",
            ],
            intensity=0.92,
            target_capabilities_count=79,
        )
        self.total_ticks += 1
        tick = DaemonExecutionTick(
            tick_id=self.total_ticks,
            campaign_id=res["campaign_id"],
            timestamp=datetime.utcnow().isoformat(),
            attack_vectors=res["simulated_attack_vectors"],
            deflection_pct=res["deflection_success_pct"],
            mitigation_latency_ms=res["mean_mitigation_latency_ms"],
            resilience_score=res["systemic_resilience_score"],
            verdict=res["verdict"],
        )
        self.recent_ticks.insert(0, tick)
        if len(self.recent_ticks) > 25:
            self.recent_ticks.pop()

    def _daemon_loop(self):
        while self.is_running:
            time.sleep(self.cycle_interval_seconds)
            if not self.is_running:
                break
            try:
                self._execute_single_tick()
            except Exception:
                pass

    def get_status(self) -> Dict[str, Any]:
        return {
            "daemon_active": self.is_running,
            "cycle_interval_seconds": self.cycle_interval_seconds,
            "total_ticks": self.total_ticks,
            "recent_ticks": [
                {
                    "tick_id": t.tick_id,
                    "campaign_id": t.campaign_id,
                    "timestamp": t.timestamp,
                    "attack_vectors": t.attack_vectors,
                    "deflection_pct": t.deflection_pct,
                    "mitigation_latency_ms": t.mitigation_latency_ms,
                    "resilience_score": t.resilience_score,
                    "verdict": t.verdict,
                }
                for t in self.recent_ticks[:10]
            ],
            "status": "CONTINUOUS_MONITORING" if self.is_running else "STANDBY",
        }


autonomous_redteam_daemon = AutonomousRedTeamDaemon()

