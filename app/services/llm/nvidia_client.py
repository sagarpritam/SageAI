"""NVIDIA Build LLM Client Implementation."""

import logging

import httpx

from app.core.config import settings
from app.services.ai_resilience import CircuitBreaker

from .base import BaseLLM

logger = logging.getLogger("SageAI.llm.nvidia")
nvidia_breaker = CircuitBreaker(failure_threshold=3, reset_timeout=60)


# Curated NVIDIA NIM Model Catalog for Cybersecurity & Agentic Workflows
NVIDIA_MODELS = {
    # Default flagship: Best-in-class open model for security analysis & CVE remediation
    "default": "meta/llama-3.3-70b-instruct",
    "reasoning": "meta/llama-3.3-70b-instruct",
    # NVIDIA Nemotron: Optimized for synthetic data, tool use, and complex agents
    "nemotron": "nvidia/llama-3.1-nemotron-70b-instruct",
    # Deep reasoning & mathematical vulnerability chaining
    "deep_reasoning": "deepseek-ai/deepseek-r1",
    # Low-latency model for quick inline classification and port banner parsing
    "fast": "meta/llama-3.1-8b-instruct",
    # AI Safety & Guardrails: Jailbreak, prompt injection & toxic output detection
    "guardrail": "meta/llama-guard-3-8b",
}


class NvidiaClient(BaseLLM):
    """
    NVIDIA Build API Client (OpenAI-compatible).
    Provides access to NVIDIA NIM models on build.nvidia.com:
    - Meta Llama 3.3 70B Instruct (default)
    - NVIDIA Llama 3.1 Nemotron 70B Instruct
    - DeepSeek R1 / V3
    - Meta Llama Guard 3 8B (Safety & Jailbreak detection)
    """

    @property
    def provider(self) -> str:
        return "nvidia"

    @property
    def default_model(self) -> str:
        return NVIDIA_MODELS["default"]

    def resolve_model(self, model: str | None) -> str:
        """Resolve model alias or return exact model identifier."""
        if not model:
            return self.default_model
        return NVIDIA_MODELS.get(model, model)

    async def generate(
        self, prompt: str, system_message: str = "", model: str | None = None, **kwargs
    ) -> dict:
        if nvidia_breaker.is_open():
            raise RuntimeError(
                "NVIDIA Build API is currently unavailable (Circuit Open)"
            )

        api_key = settings.NVIDIA_API_KEY
        if not api_key:
            raise ValueError("NVIDIA_API_KEY environment variable is not set")

        model_to_use = self.resolve_model(model)

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

    async def audit_safety(self, text: str) -> dict:
        """Evaluate text using Meta Llama Guard 3 on NVIDIA NIM to detect prompt injection, jailbreaks, or policy violations."""
        res = await self.generate(
            prompt=text,
            model="guardrail",
            temperature=0.0,
            max_tokens=100,
        )
        content = res.get("content", "").strip()
        is_safe = content.lower().startswith("safe")
        return {
            "safe": is_safe,
            "raw_output": content,
            "violation": None if is_safe else content.replace("unsafe", "").strip(),
        }
