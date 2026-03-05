"""Base Tool interface for SageAI Platform."""

from abc import ABC, abstractmethod
from typing import Any, Dict


class BaseTool(ABC):
    """
    Abstract base class for all AI-callable security tools.
    Every tool must define a name, description, and an async run method.
    """
    
    @property
    @abstractmethod
    def name(self) -> str:
        """The name of the tool (used by AI to select it)."""
        pass
        
    @property
    @abstractmethod
    def description(self) -> str:
        """A detailed description of what the tool does and when to use it."""
        pass
        
    @abstractmethod
    async def run(self, target: str, **kwargs) -> Dict[str, Any] | list[Dict[str, Any]] | None:
        """
        Execute the tool against the target.
        
        Args:
            target: The primary target (e.g., domain, IP, URL)
            **kwargs: Additional parameters specific to the tool
            
        Returns:
            A dictionary/list of findings or raw results.
        """
        pass
