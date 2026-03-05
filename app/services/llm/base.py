"""Base interface for LLM clients."""

from abc import ABC, abstractmethod
from typing import Any, Dict


class BaseLLM(ABC):
    """
    Abstract base class for LLM providers (e.g., OpenAI, Anthropic, Local).
    Ensures uniform interface for generating completions.
    """
    
    @property
    @abstractmethod
    def provider(self) -> str:
        """Name of the provider (e.g., 'openai')."""
        pass
        
    @property
    @abstractmethod
    def default_model(self) -> str:
        """Default model string for this provider."""
        pass
        
    @abstractmethod
    async def generate(self, prompt: str, system_message: str = "", model: str = None, **kwargs) -> Dict[str, Any]:
        """
        Generate a text completion.
        
        Args:
            prompt: User input prompt
            system_message: System instructions for the LLM
            model: Specific model to use (overrides default)
            **kwargs: Provider-specific args (temperature, etc.)
            
        Returns:
            Dict containing:
            - "content": Generated text
            - "usage": {"prompt_tokens": int, "completion_tokens": int}
        """
        pass
