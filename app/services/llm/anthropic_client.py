"""Anthropic LLM Client Stub."""

from .base import BaseLLM

class AnthropicClient(BaseLLM):
    """Stub implementation showing how Anthropic Claude integrates."""
    
    @property
    def provider(self) -> str:
        return "anthropic"
        
    @property
    def default_model(self) -> str:
        return "claude-3-haiku-20240307"
        
    async def generate(self, prompt: str, system_message: str = "", model: str = None, **kwargs) -> dict:
        # In a real implementation, this would call api.anthropic.com
        return {
            "content": "[Anthropic Stub] Claude response here.",
            "usage": {"prompt_tokens": 10, "completion_tokens": 20}
        }
