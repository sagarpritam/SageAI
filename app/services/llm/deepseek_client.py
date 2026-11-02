"""DeepSeek Reasoning LLM Client Implementation."""

import logging
from typing import Any, Dict, Optional

import httpx

from app.core.config import settings
from app.services.ai_resilience import CircuitBreaker

from .base import BaseLLM

logger = logging.getLogger("SageAI.llm.deepseek")
deepseek_breaker = CircuitBreaker(failure_threshold=3, reset_timeout=60)


class DeepSeekClient(BaseLLM):
    """
    DeepSeek Client.
    Specialized for deep non-linear reasoning, exploit chains, and multi-step attack planning.
    """

    @property
    def provider(self) -> str:
        return "deepseek"

    @property
    def default_model(self) -> str:
        return "deepseek-reasoner"

    async def generate(
        self,
        prompt: str,
        system_message: str = "",
        model: Optional[str] = None,
        **kwargs,
    ) -> Dict[str, Any]:
        if deepseek_breaker.is_open():
            raise RuntimeError("DeepSeek API is currently unavailable (Circuit Open)")

        api_key = settings.DEEPSEEK_API_KEY
        if not api_key:
            logger.warning("DEEPSEEK_API_KEY is not set. Using diagnostic mode.")
            return {
                "content": f"[DeepSeek R1 Diagnostic] Attack chain reasoning for: {prompt[:80]}...",
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
            "temperature": kwargs.get("temperature", 0.0),
            "max_tokens": kwargs.get("max_tokens", 2048),
        }

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=kwargs.get("timeout", settings.LLM_TIMEOUT)) as client:
            try:
                response = await client.post(
                    "https://api.deepseek.com/chat/completions",
                    json=payload,
                    headers=headers,
                )

                if response.status_code == 429:
                    deepseek_breaker.record_failure()
                    raise RuntimeError("DeepSeek rate limit exceeded")

                response.raise_for_status()
                deepseek_breaker.record_success()

                data = response.json()
                choices = data.get("choices", [])
                content = choices[0].get("message", {}).get("content", "") if choices else ""
                usage = data.get("usage", {})

                return {
                    "content": content,
                    "usage": {
                        "prompt_tokens": usage.get("prompt_tokens", len(prompt) // 4),
                        "completion_tokens": usage.get("completion_tokens", len(content) // 4),
                    },
                }
            except httpx.RequestError as e:
                deepseek_breaker.record_failure()
                raise RuntimeError(f"DeepSeek connection error: {str(e)}")
            except Exception:
                deepseek_breaker.record_failure()
                raise

