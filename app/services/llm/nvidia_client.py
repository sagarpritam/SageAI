"""NVIDIA Build LLM Client Implementation."""

import httpx
import logging
from .base import BaseLLM
from app.core.config import settings
from app.services.ai_resilience import CircuitBreaker

logger = logging.getLogger("SageAI.llm.nvidia")
nvidia_breaker = CircuitBreaker(failure_threshold=3, reset_timeout=60)

class NvidiaClient(BaseLLM):
    """
    NVIDIA Build API Client (OpenAI-compatible).
    Supports models like Mistral-8x7B, Llama-3-70B, etc.
    """

    @property
    def provider(self) -> str:
        return "nvidia"

    @property
    def default_model(self) -> str:
        # Defaulting to Mixtral-8x7B (often referred to as 'autogen87' contextually)
        return "mistralai/mixtral-8x7b-instruct-v0.1"

    async def generate(
        self, prompt: str, system_message: str = "", model: str = None, **kwargs
    ) -> dict:
        if nvidia_breaker.is_open():
            raise RuntimeError("NVIDIA Build API is currently unavailable (Circuit Open)")

        api_key = settings.NVIDIA_API_KEY
        if not api_key:
            raise ValueError("NVIDIA_API_KEY environment variable is not set")

        model_to_use = model or self.default_model

        messages = []
        if system_message:
            messages.append({"role": "system", "content": system_message})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": model_to_use,
            "messages": messages,
            "temperature": kwargs.get("temperature", 0.3),
            "max_tokens": kwargs.get("max_tokens", 1024),
            "top_p": kwargs.get("top_p", 1),
        }

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=30) as client:
            try:
                # NVIDIA Build uses an OpenAI-compatible endpoint
                response = await client.post(
                    "https://integrate.api.nvidia.com/v1/chat/completions",
                    json=payload,
                    headers=headers,
                )

                if response.status_code == 429:
                    nvidia_breaker.record_failure()
                    raise RuntimeError("NVIDIA Build rate limit exceeded")

                response.raise_for_status()
                nvidia_breaker.record_success()

                data = response.json()
                return {
                    "content": data["choices"][0]["message"]["content"],
                    "usage": {
                        "prompt_tokens": data["usage"].get("prompt_tokens", 0),
                        "completion_tokens": data["usage"].get("completion_tokens", 0),
                    },
                }
            except httpx.RequestError as e:
                nvidia_breaker.record_failure()
                raise RuntimeError(f"NVIDIA Build connection error: {str(e)}")
            except Exception as e:
                nvidia_breaker.record_failure()
                logger.error(f"NVIDIA completion failed: {e}")
                raise
