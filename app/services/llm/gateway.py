"""LLM Gateway Layer — Multi-AI Orchestration Engine."""

import logging
from typing import Any, Dict, Optional

from app.services.ai_resilience import token_tracker

from .anthropic_client import AnthropicClient
from .base import BaseLLM
from .deepseek_client import DeepSeekClient
from .gemini_client import GeminiClient
from .nvidia_client import NvidiaClient
from .openai_client import OpenAIClient
from .vercel_client import VercelGatewayClient

logger = logging.getLogger("SageAI.llm")

# Initialize registered providers
PROVIDERS = {
    "openai": OpenAIClient(),
    "anthropic": AnthropicClient(),
    "nvidia": NvidiaClient(),
    "gemini": GeminiClient(),
    "deepseek": DeepSeekClient(),
    "vercel": VercelGatewayClient(),
}

TASK_SPECIALIZATION_ROUTING = {
    "code_audit": "anthropic",
    "patch_generation": "anthropic",
    "exploit_reasoning": "deepseek",
    "attack_chain": "deepseek",
    "forensics_logs": "gemini",
    "large_context": "gemini",
    "red_team": "nvidia",
    "payload_mutation": "nvidia",
    "general": "openai",
}


class LLMGateway:
    """
    Central multi-model gateway for interacting with LLM models.
    Handles specialized task routing, multi-provider failover, and token tracking.
    """

    def __init__(self, default_provider: str = "openai"):
        self.default_provider = default_provider
        self.failover_chain = [
            "openai",
            "anthropic",
            "nvidia",
            "gemini",
            "deepseek",
            "vercel",
        ]
        self.max_retries_per_provider = 2
        self.error_counts = dict.fromkeys(self.failover_chain, 0)
        self.circuit_open = dict.fromkeys(self.failover_chain, False)

    def get_client(self, provider_name: str) -> BaseLLM:
        client = PROVIDERS.get(provider_name)
        if not client:
            raise ValueError(f"Unknown LLM provider: {provider_name}")
        return client

    def reset_circuit(self, provider_name: str):
        """Reset the error count and close the circuit for a provider."""
        self.error_counts[provider_name] = 0
        self.circuit_open[provider_name] = False

    def route_task(self, task_type: str) -> str:
        """Determines the optimal LLM provider based on task requirements."""
        return TASK_SPECIALIZATION_ROUTING.get(task_type.lower(), self.default_provider)

    async def generate(
        self,
        prompt: str,
        system_message: str = "",
        provider: Optional[str] = None,
        model: Optional[str] = None,
        org_id: str = "system",
        track_tokens: bool = True,
        task_type: Optional[str] = None,
        **kwargs,
    ) -> str:
        """
        Generate completion across unified interface with circuit breaking and fallback.
        """
        if task_type and not provider:
            initial_provider = self.route_task(task_type)
        else:
            initial_provider = provider or self.default_provider

        # Determine the order of providers to try
        try_order = [initial_provider]
        for p in self.failover_chain:
            if p != initial_provider:
                try_order.append(p)

        last_error = None

        for current_provider in try_order:
            if self.circuit_open.get(current_provider, False):
                logger.warning(f"Circuit open for {current_provider}, skipping...")
                continue

            client = self.get_client(current_provider)

            for attempt in range(self.max_retries_per_provider):
                try:
                    result = await client.generate(
                        prompt, system_message, model, **kwargs
                    )
                    content = result.get("content", "")
                    usage = result.get("usage", {})

                    # Global token tracking
                    if track_tokens and org_id:
                        token_tracker.record_usage(
                            org_id=org_id,
                            prompt_tokens=usage.get("prompt_tokens", 0),
                            completion_tokens=usage.get("completion_tokens", 0),
                        )

                    # Reset circuit breaker on success
                    self.reset_circuit(current_provider)
                    return content

                except Exception as e:
                    last_error = e
                    logger.warning(
                        f"LLM {client.provider} attempt {attempt + 1} failed: {str(e)}"
                    )

            # If all attempts for this provider fail, open the circuit
            logger.error(
                f"Provider {current_provider} failed {self.max_retries_per_provider} times. Opening circuit."
            )
            self.error_counts[current_provider] = self.max_retries_per_provider
            self.circuit_open[current_provider] = True

        logger.error("All LLM providers in failover chain failed.")
        raise last_error or Exception("LLM Generation failed across all providers")

    async def generate_consensus(
        self,
        vulnerability_title: str,
        target: str,
        evidence: str,
        context: Optional[str] = None,
        org_id: str = "system",
    ) -> Dict[str, Any]:
        """
        Runs the 3-model Red-vs-Blue consensus engine.
        """
        from .consensus_engine import consensus_engine
        return await consensus_engine.evaluate_vulnerability(
            vulnerability_title=vulnerability_title,
            target=target,
            evidence=evidence,
            context=context,
            org_id=org_id,
        )


# Global singleton
llm_gateway = LLMGateway()
