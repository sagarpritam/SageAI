"""LLM Gateway Layer."""

import logging
from .base import BaseLLM
from .openai_client import OpenAIClient
from .anthropic_client import AnthropicClient

from app.services.ai_resilience import token_tracker

logger = logging.getLogger("SageAI.llm")

# Initialize registered providers
PROVIDERS = {
    "openai": OpenAIClient(),
    "anthropic": AnthropicClient()
}

class LLMGateway:
    """
    Central gateway for interacting with LLM models.
    Handles routing, fallbacks, and token tracking execution.
    """
    
    def __init__(self, default_provider: str = "openai"):
        self.default_provider = default_provider
        
    def get_client(self, provider_name: str) -> BaseLLM:
        client = PROVIDERS.get(provider_name)
        if not client:
            raise ValueError(f"Unknown LLM provider: {provider_name}")
        return client
        
    async def generate(self, prompt: str, system_message: str = "", provider: str = None, model: str = None, org_id: str = "system", track_tokens: bool = True, **kwargs) -> str:
        """
        Generate completion across unified interface.
        Tracks token usage automatically if org_id is provided.
        Returns the content directly.
        """
        client = self.get_client(provider or self.default_provider)
        
        try:
            result = await client.generate(prompt, system_message, model, **kwargs)
            content = result.get("content", "")
            usage = result.get("usage", {})
            
            # Global token tracking
            if track_tokens and org_id:
                token_tracker.record_usage(
                    org_id=org_id,
                    prompt_tokens=usage.get("prompt_tokens", 0),
                    completion_tokens=usage.get("completion_tokens", 0)
                )
                
            return content
            
        except Exception as e:
            logger.error(f"LLM {client.provider} failed: {str(e)}")
            # Real fallback logic would go here (e.g. try another provider)
            raise

# Global singleton
llm_gateway = LLMGateway()
