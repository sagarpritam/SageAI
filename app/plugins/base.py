"""
SageAI 2.0 — Plugin Base Class
All security plugins must inherit from SecurityPlugin.

A plugin is a self-contained, swappable security capability.
Plugins can be:
  - Core plugins (shipped with SageAI)
  - Community plugins (dropped into the plugins/ folder)
  - Enterprise plugins (licensed, loaded dynamically)
"""
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
import logging


class PluginMetadata:
    """Metadata for a SageAI security plugin."""

    def __init__(
        self,
        name: str,
        version: str,
        author: str,
        description: str,
        category: str,
        tags: List[str] = None,
        requires_tools: List[str] = None,
        min_plan: str = "free",  # free | pro | enterprise
    ):
        self.name = name
        self.version = version
        self.author = author
        self.description = description
        self.category = category
        self.tags = tags or []
        self.requires_tools = requires_tools or []
        self.min_plan = min_plan


class PluginResult:
    """Standardized result from any plugin run."""

    def __init__(
        self,
        plugin_name: str,
        target: str,
        findings: List[Dict[str, Any]],
        metadata: Dict[str, Any] = None,
        error: Optional[str] = None,
    ):
        self.plugin_name = plugin_name
        self.target = target
        self.findings = findings
        self.metadata = metadata or {}
        self.error = error
        self.ran_at = datetime.now(timezone.utc).isoformat()
        self.finding_count = len(findings)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "plugin": self.plugin_name,
            "target": self.target,
            "finding_count": self.finding_count,
            "findings": self.findings,
            "metadata": self.metadata,
            "error": self.error,
            "ran_at": self.ran_at,
        }


class SecurityPlugin(ABC):
    """
    Abstract base class for all SageAI security plugins.

    How to create a plugin:
    ```python
    class MyPlugin(SecurityPlugin):
        @property
        def meta(self) -> PluginMetadata:
            return PluginMetadata(
                name="my_plugin",
                version="1.0.0",
                author="Your Name",
                description="What this plugin does",
                category="web",
                tags=["http", "headers"],
            )

        async def run(self, target: str, **kwargs) -> PluginResult:
            # Your scanning logic here
            findings = [...]
            return PluginResult(self.meta.name, target, findings)
    ```
    """

    @property
    @abstractmethod
    def meta(self) -> PluginMetadata:
        """Plugin metadata — name, version, description, category."""
        pass

    @abstractmethod
    async def run(self, target: str, **kwargs) -> PluginResult:
        """
        Execute the plugin against the target.

        Args:
            target: Domain, IP, or URL to scan
            **kwargs: Plugin-specific options

        Returns:
            PluginResult with structured findings
        """
        pass

    @property
    def name(self) -> str:
        return self.meta.name

    @property
    def category(self) -> str:
        return self.meta.category

    def __repr__(self) -> str:
        return f"<Plugin:{self.meta.name} v{self.meta.version}>"
