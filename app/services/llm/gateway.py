"""LLM Gateway Layer."""

import logging

from app.services.ai_resilience import token_tracker

from .anthropic_client import AnthropicClient
from .base import BaseLLM
from .nvidia_client import NvidiaClient
from .openai_client import OpenAIClient

logger = logging.getLogger("SageAI.llm")

# Initialize registered providers
PROVIDERS = {
    "openai": OpenAIClient(),
    "anthropic": AnthropicClient(),
    "nvidia": NvidiaClient(),
}


class LLMGateway:
    """
    Central gateway for interacting with LLM models.
    Handles routing, fallbacks, and token tracking execution.
    """

    def __init__(self, default_provider: str = "openai"):
        self.default_provider = default_provider
        # Circuit breaker state
        self.failover_chain = ["openai", "anthropic", "nvidia"]
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

    async def generate(
        self,
        prompt: str,
        system_message: str = "",
        provider: str = None,
        model: str = None,
        org_id: str = "system",
        track_tokens: bool = True,
        **kwargs,
    ) -> str:
        """
        Generate completion across unified interface.
        Tracks token usage automatically if org_id is provided.
        Includes circuit breaker and failover logic.
        """
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


# Global singleton
llm_gateway = LLMGateway()
