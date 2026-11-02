"""Vercel AI Gateway LLM Client Implementation."""

import logging
from typing import Any, Dict, Optional

import httpx

from app.core.config import settings
from app.services.ai_resilience import CircuitBreaker

from .base import BaseLLM

logger = logging.getLogger("SageAI.llm.vercel")
vercel_breaker = CircuitBreaker(failure_threshold=3, reset_timeout=60)


class VercelGatewayClient(BaseLLM):
    """
    Vercel AI Gateway Client.
    Routes requests through Vercel's unified model gateway with model routing
    e.g. 'anthropic/claude-3-7-sonnet', 'openai/gpt-4o'.
    """

    @property
    def provider(self) -> str:
        return "vercel"

    @property
    def default_model(self) -> str:
        return "anthropic/claude-3-7-sonnet"

    async def generate(
        self,
        prompt: str,
        system_message: str = "",
        model: Optional[str] = None,
        **kwargs,
    ) -> Dict[str, Any]:
        if vercel_breaker.is_open():
            raise RuntimeError("Vercel AI Gateway is currently unavailable (Circuit Open)")

        api_key = settings.AI_GATEWAY_API_KEY
        if not api_key:
            logger.warning("AI_GATEWAY_API_KEY is not set. Using diagnostic mode.")
            return {
                "content": f"[Vercel Gateway Diagnostic] Model gateway response for: {prompt[:80]}...",
                "usage": {"prompt_tokens": len(prompt) // 4, "completion_tokens": 50},
            }

        model_to_use = model or self.default_model

        messages = []
        if system_message:
            messages.append({"role": "system", "content": system_message})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": model_to_use,
            "messages": messages,
            "temperature": kwargs.get("temperature", 0.3),
            "max_tokens": kwargs.get("max_tokens", 2048),
        }

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

        gateway_url = f"{settings.AI_GATEWAY_URL}/chat/completions"

        async with httpx.AsyncClient(timeout=kwargs.get("timeout", settings.LLM_TIMEOUT)) as client:
            try:
                response = await client.post(gateway_url, json=payload, headers=headers)

                if response.status_code == 429:
                    vercel_breaker.record_failure()
                    raise RuntimeError("Vercel AI Gateway rate limit exceeded")

                response.raise_for_status()
                vercel_breaker.record_success()

                data = response.json()
                content = data["choices"][0]["message"]["content"]
                usage = data.get("usage", {})

                return {
                    "content": content,
                    "usage": {
                        "prompt_tokens": usage.get("prompt_tokens", len(prompt) // 4),
                        "completion_tokens": usage.get("completion_tokens", len(content) // 4),
                    },
                }
            except httpx.RequestError as e:
                vercel_breaker.record_failure()
                raise RuntimeError(f"Vercel Gateway connection error: {str(e)}")
            except Exception:
                vercel_breaker.record_failure()
                raise
