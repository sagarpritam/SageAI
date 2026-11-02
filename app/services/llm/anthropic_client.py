"""Anthropic Claude LLM Client Implementation."""

import logging
from typing import Any, Dict, Optional

import httpx

from app.core.config import settings
from app.services.ai_resilience import CircuitBreaker

from .base import BaseLLM

logger = logging.getLogger("SageAI.llm.anthropic")
anthropic_breaker = CircuitBreaker(failure_threshold=3, reset_timeout=60)


class AnthropicClient(BaseLLM):
    """
    Anthropic Messages API Client.
    Specialized for static code reasoning, AST refactoring, and patch synthesis.
    """

    @property
    def provider(self) -> str:
        return "anthropic"

    @property
    def default_model(self) -> str:
        return "claude-3-7-sonnet-20250219"

    async def generate(
        self,
        prompt: str,
        system_message: str = "",
        model: Optional[str] = None,
        **kwargs,
    ) -> Dict[str, Any]:
        if anthropic_breaker.is_open():
            raise RuntimeError("Anthropic API is currently unavailable (Circuit Open)")

        api_key = settings.ANTHROPIC_API_KEY
        if not api_key:
            # Fallback for environments without live key
            logger.warning("ANTHROPIC_API_KEY is not set. Using diagnostic mode.")
            return {
                "content": f"[Anthropic Diagnostic] Claude simulated analysis for: {prompt[:80]}...",
                "usage": {"prompt_tokens": len(prompt) // 4, "completion_tokens": 50},
            }

        model_to_use = model or self.default_model

        payload: Dict[str, Any] = {
            "model": model_to_use,
            "max_tokens": kwargs.get("max_tokens", 2048),
            "messages": [{"role": "user", "content": prompt}],
        }
        if system_message:
            payload["system"] = system_message
        if "temperature" in kwargs:
            payload["temperature"] = kwargs["temperature"]

        headers = {
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }

        async with httpx.AsyncClient(timeout=kwargs.get("timeout", settings.LLM_TIMEOUT)) as client:
            try:
                response = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    json=payload,
                    headers=headers,
                )

                if response.status_code == 429:
                    anthropic_breaker.record_failure()
                    raise RuntimeError("Anthropic rate limit exceeded")

                response.raise_for_status()
                anthropic_breaker.record_success()

                data = response.json()
                content_blocks = data.get("content", [])
                text_content = "".join(b.get("text", "") for b in content_blocks if b.get("type") == "text")

                usage = data.get("usage", {})
                return {
                    "content": text_content,
                    "usage": {
                        "prompt_tokens": usage.get("input_tokens", 0),
                        "completion_tokens": usage.get("output_tokens", 0),
                    },
                }
            except httpx.RequestError as e:
                anthropic_breaker.record_failure()
                raise RuntimeError(f"Anthropic connection error: {str(e)}")
            except Exception:
                anthropic_breaker.record_failure()
                raise
