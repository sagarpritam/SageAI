"""Capability 170: Langlands Automorphic Duality Engine."""
from app.services.langlands_automorphic_shield.langlands_automorphic_shield import (
    LanglandsAutomorphicShieldService,
    get_langlands_automorphic_shield_service,
)

__all__ = [
    "LanglandsAutomorphicShieldService",
    "get_langlands_automorphic_shield_service",
]
