"""OpenAI LLM Client Implementation."""

import httpx
from .base import BaseLLM
from app.core.config import settings
from app.services.ai_resilience import CircuitBreaker

# Reuse the existing circuit breaker
openai_breaker = CircuitBreaker(failure_threshold=3, reset_timeout=60)

class OpenAIClient(BaseLLM):
    @property
    def provider(self) -> str:
        return "openai"
        
    @property
    def default_model(self) -> str:
        return "gpt-4o-mini"
        
    async def generate(self, prompt: str, system_message: str = "", model: str = None, **kwargs) -> dict:
        if openai_breaker.is_open():
            raise RuntimeError("OpenAI API is currently unavailable (Circuit Open)")
            
        api_key = settings.OPENAI_API_KEY
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")
            
        model_to_use = model or self.default_model
        
        messages = []
        if system_message:
            messages.append({"role": "system", "content": system_message})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": model_to_use,
            "messages": messages,
            "temperature": kwargs.get("temperature", 0.3),
            "max_tokens": kwargs.get("max_tokens", 1500)
        }

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        async with httpx.AsyncClient(timeout=30) as client:
            try:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    json=payload,
                    headers=headers
                )
                
                if response.status_code == 429:
                    openai_breaker.record_failure()
                    raise RuntimeError("Rate limit exceeded")
                    
                response.raise_for_status()
                openai_breaker.record_success()
                
                data = response.json()
                return {
                    "content": data["choices"][0]["message"]["content"],
                    "usage": {
                        "prompt_tokens": data["usage"].get("prompt_tokens", 0),
                        "completion_tokens": data["usage"].get("completion_tokens", 0)
                    }
                }
            except httpx.RequestError as e:
                openai_breaker.record_failure()
                raise RuntimeError(f"OpenAI connection error: {str(e)}")
            except Exception as e:
                openai_breaker.record_failure()
                raise
