"""Google Gemini LLM Client Implementation."""

import logging
from typing import Any, Dict, Optional

import httpx

from app.core.config import settings
from app.services.ai_resilience import CircuitBreaker

from .base import BaseLLM

logger = logging.getLogger("SageAI.llm.gemini")
gemini_breaker = CircuitBreaker(failure_threshold=3, reset_timeout=60)


class GeminiClient(BaseLLM):
    """
    Google Gemini Client.
    Specialized for large context repo analysis, forensic logs, and real-time telemetry.
    """

    @property
    def provider(self) -> str:
        return "gemini"

    @property
    def default_model(self) -> str:
        return "gemini-2.0-flash"

    async def generate(
        self,
        prompt: str,
        system_message: str = "",
        model: Optional[str] = None,
        **kwargs,
    ) -> Dict[str, Any]:
        if gemini_breaker.is_open():
            raise RuntimeError("Gemini API is currently unavailable (Circuit Open)")

        api_key = settings.GEMINI_API_KEY
        if not api_key:
            logger.warning("GEMINI_API_KEY is not set. Using diagnostic mode.")
            return {
                "content": f"[Gemini Diagnostic] Large-context telemetry analysis for: {prompt[:80]}...",
                "usage": {"prompt_tokens": len(prompt) // 4, "completion_tokens": 50},
            }

        model_to_use = model or self.default_model
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_to_use}:generateContent?key={api_key}"

        contents = []
        if system_message:
            contents.append({"role": "user", "parts": [{"text": f"System Instructions: {system_message}"}]})
        contents.append({"role": "user", "parts": [{"text": prompt}]})

        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": kwargs.get("temperature", 0.2),
                "maxOutputTokens": kwargs.get("max_tokens", 2048),
            },
        }

        headers = {"Content-Type": "application/json"}

        async with httpx.AsyncClient(timeout=kwargs.get("timeout", settings.LLM_TIMEOUT)) as client:
            try:
                response = await client.post(url, json=payload, headers=headers)

                if response.status_code == 429:
                    gemini_breaker.record_failure()
                    raise RuntimeError("Gemini rate limit exceeded")

                response.raise_for_status()
                gemini_breaker.record_success()

                data = response.json()
                candidates = data.get("candidates", [])
                text_content = ""
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    text_content = "".join(p.get("text", "") for p in parts)

                usage_metadata = data.get("usageMetadata", {})
                return {
                    "content": text_content,
                    "usage": {
                        "prompt_tokens": usage_metadata.get("promptTokenCount", len(prompt) // 4),
                        "completion_tokens": usage_metadata.get("candidatesTokenCount", len(text_content) // 4),
                    },
                }
            except httpx.RequestError as e:
                gemini_breaker.record_failure()
                raise RuntimeError(f"Gemini connection error: {str(e)}")
            except Exception:
                gemini_breaker.record_failure()
                raise

