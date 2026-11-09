"""
SageAI Council Telemetry & Model Health Matrix.

Monitors real-time latency, request throughput, error rates, token cost,
and circuit breaker availability across all AI Council frontier models.
"""

import logging
import statistics
from collections import deque
from datetime import datetime, timezone
from typing import Any, Dict

logger = logging.getLogger("SageAI.llm.telemetry")


class CouncilModelTelemetry:
    """
    Live telemetry tracker for all models in the SageAI Council.
    """

    COUNCIL_MODELS = {
        "anthropic": {
            "name": "Claude 3.7 Sonnet",
            "provider": "Anthropic",
            "role": "AST Code Reasoning & Defense Skeptic",
            "input_cost_per_1m": 3.00,
            "output_cost_per_1m": 15.00,
            "context_window": "200k",
        },
        "deepseek": {
            "name": "DeepSeek R1 Reasoner",
            "provider": "DeepSeek",
            "role": "Complex Attack Chains & Offense Lead",
            "input_cost_per_1m": 0.55,
            "output_cost_per_1m": 2.19,
            "context_window": "64k",
        },
        "gemini": {
            "name": "Gemini 2.5 Pro",
            "provider": "Google DeepMind",
            "role": "Supreme Arbiter & Massive Context Forensics",
            "input_cost_per_1m": 1.25,
            "output_cost_per_1m": 5.00,
            "context_window": "1M+",
        },
        "nvidia": {
            "name": "Llama 3.1 Nemotron 70B",
            "provider": "NVIDIA NIM",
            "role": "Adversarial Fuzzing & Red-Teaming",
            "input_cost_per_1m": 0.70,
            "output_cost_per_1m": 0.90,
            "context_window": "128k",
        },
        "openai": {
            "name": "GPT-4o / o1",
            "provider": "OpenAI",
            "role": "General Classification & Reporting",
            "input_cost_per_1m": 2.50,
            "output_cost_per_1m": 10.00,
            "context_window": "128k",
        },
        "vercel": {
            "name": "Vercel AI Model Gateway",
            "provider": "Vercel",
            "role": "Edge Gateway & Dynamic Failover",
            "input_cost_per_1m": 2.00,
            "output_cost_per_1m": 8.00,
            "context_window": "Variable",
        },
    }

    def __init__(self):
        # provider -> deque of recent latencies in ms (last 50 requests)
        self._latencies: Dict[str, deque] = {p: deque(maxlen=50) for p in self.COUNCIL_MODELS}
        self._success_counts: Dict[str, int] = dict.fromkeys(self.COUNCIL_MODELS, 0)
        self._failure_counts: Dict[str, int] = dict.fromkeys(self.COUNCIL_MODELS, 0)
        self._total_tokens: Dict[str, int] = dict.fromkeys(self.COUNCIL_MODELS, 0)

    def record_call(
        self,
        provider: str,
        latency_ms: float,
        success: bool = True,
        tokens_used: int = 0,
    ):
        """Record the outcome of a provider request."""
        clean_provider = provider.lower()
        if clean_provider not in self._latencies:
            self._latencies[clean_provider] = deque(maxlen=50)
            self._success_counts[clean_provider] = 0
            self._failure_counts[clean_provider] = 0
            self._total_tokens[clean_provider] = 0

        self._latencies[clean_provider].append(latency_ms)
        self._total_tokens[clean_provider] += tokens_used

        if success:
            self._success_counts[clean_provider] += 1
        else:
            self._failure_counts[clean_provider] += 1

    def get_provider_health(self, provider: str) -> Dict[str, Any]:
        """Calculates real-time health metrics for a provider."""
        clean_p = provider.lower()
        meta = self.COUNCIL_MODELS.get(clean_p, {
            "name": clean_p.capitalize(),
            "provider": clean_p.capitalize(),
            "role": "General LLM",
            "input_cost_per_1m": 1.0,
            "output_cost_per_1m": 2.0,
            "context_window": "128k",
        })

        latencies = list(self._latencies.get(clean_p, []))
        avg_latency = round(statistics.mean(latencies), 1) if latencies else 180.0
        p95_latency = round(statistics.quantiles(latencies, n=20)[-1], 1) if len(latencies) >= 20 else avg_latency

        successes = self._success_counts.get(clean_p, 0)
        failures = self._failure_counts.get(clean_p, 0)
        total = successes + failures
        uptime_pct = round((successes / total) * 100, 1) if total > 0 else 100.0

        health_status = "HEALTHY"
        if uptime_pct < 80.0 or avg_latency > 3000.0:
            health_status = "DEGRADED"
        if uptime_pct < 50.0:
            health_status = "CRITICAL"

        return {
            "provider_key": clean_p,
            "model_name": meta["name"],
            "vendor": meta["provider"],
            "council_role": meta["role"],
            "status": health_status,
            "avg_latency_ms": avg_latency,
            "p95_latency_ms": p95_latency,
            "uptime_pct": uptime_pct,
            "total_requests": total,
            "tokens_consumed": self._total_tokens.get(clean_p, 0),
            "pricing_per_1m_tokens": f"${meta['input_cost_per_1m']} in / ${meta['output_cost_per_1m']} out",
            "context_window": meta["context_window"],
        }

    def get_full_council_matrix(self) -> Dict[str, Any]:
        """Returns the complete health and performance scorecard of the AI Council."""
        matrix = [self.get_provider_health(p) for p in self.COUNCIL_MODELS]
        return {
            "council_status": "ONLINE",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "total_models": len(matrix),
            "active_models": sum(1 for m in matrix if m["status"] == "HEALTHY"),
            "models": matrix,
        }


# Global council telemetry singleton
council_telemetry = CouncilModelTelemetry()

