"""
SageAI 2.0 — Plugin Registry & Marketplace
Dynamically discovers, loads, and manages security plugins.

Supports:
  - Auto-discovery from app/plugins/ directory
  - Plugin metadata listing (marketplace)
  - Category-based filtering
  - Plan-gating (free/pro/enterprise plugins)
"""
import importlib
import inspect
import logging
import pkgutil
from typing import Dict, List, Optional

from app.plugins.base import SecurityPlugin, PluginResult

logger = logging.getLogger("SageAI.plugin_registry")

# Global plugin registry
_REGISTRY: Dict[str, SecurityPlugin] = {}
_LOADED = False


def _auto_discover():
    """Auto-discover and register all plugins in app/plugins/."""
    global _LOADED
    if _LOADED:
        return

    import app.plugins as plugin_pkg
    for _, module_name, is_pkg in pkgutil.iter_modules(plugin_pkg.__path__):
        if module_name in ("base", "registry") or is_pkg:
            continue
        try:
            module = importlib.import_module(f"app.plugins.{module_name}")
            for _, obj in inspect.getmembers(module, inspect.isclass):
                if (
                    issubclass(obj, SecurityPlugin)
                    and obj is not SecurityPlugin
                    and not inspect.isabstract(obj)
                ):
                    try:
                        instance = obj()
                        _REGISTRY[instance.name] = instance
                        logger.info(f"[PluginRegistry] Loaded: {instance.meta.name} v{instance.meta.version}")
                    except Exception as e:
                        logger.warning(f"[PluginRegistry] Failed to instantiate {obj.__name__}: {e}")
        except Exception as e:
            logger.warning(f"[PluginRegistry] Failed to load module {module_name}: {e}")

    _LOADED = True
    logger.info(f"[PluginRegistry] {len(_REGISTRY)} plugins registered")


def get_plugin(name: str) -> Optional[SecurityPlugin]:
    """Get a plugin by name."""
    _auto_discover()
    return _REGISTRY.get(name)


def get_all_plugins() -> List[SecurityPlugin]:
    """Get all registered plugins."""
    _auto_discover()
    return list(_REGISTRY.values())


def get_plugins_by_category(category: str) -> List[SecurityPlugin]:
    """Get plugins filtered by category."""
    _auto_discover()
    return [p for p in _REGISTRY.values() if p.category == category]


def get_marketplace_listing() -> List[Dict]:
    """Return marketplace-style listing of all plugins."""
    _auto_discover()
    return [
        {
            "name": p.meta.name,
            "version": p.meta.version,
            "author": p.meta.author,
            "description": p.meta.description,
            "category": p.meta.category,
            "tags": p.meta.tags,
            "requires_tools": p.meta.requires_tools,
            "min_plan": p.meta.min_plan,
        }
        for p in _REGISTRY.values()
    ]


async def run_plugin(name: str, target: str, **kwargs) -> Optional[PluginResult]:
    """Run a named plugin against a target."""
    _auto_discover()
    plugin = _REGISTRY.get(name)
    if not plugin:
        logger.warning(f"[PluginRegistry] Plugin '{name}' not found")
        return None
    try:
        result = await plugin.run(target, **kwargs)
        return result
    except Exception as e:
        logger.error(f"[PluginRegistry] Plugin '{name}' failed on {target}: {e}")
        from app.plugins.base import PluginResult
        return PluginResult(name, target, [], error=str(e))


async def run_all_plugins(
    target: str,
    category: Optional[str] = None,
    plan: str = "free",
    **kwargs,
) -> List[PluginResult]:
    """Run all plugins (or filtered by category/plan) against a target."""
    import asyncio
    _auto_discover()

    plugins = list(_REGISTRY.values())
    if category:
        plugins = [p for p in plugins if p.category == category]

    plan_order = {"free": 0, "pro": 1, "enterprise": 2}
    plugins = [p for p in plugins if plan_order.get(p.meta.min_plan, 0) <= plan_order.get(plan, 0)]

    if not plugins:
        return []

    tasks = [run_plugin(p.name, target, **kwargs) for p in plugins]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    return [r for r in results if r is not None and not isinstance(r, Exception)]
