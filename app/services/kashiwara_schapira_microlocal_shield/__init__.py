"""
Kashiwara-Schapira Sheaves on Manifolds & Microlocal Defect Shield (Capability 191).
Formalizes Masaki Kashiwara and Pierre Schapira's microlocal theory of sheaves,
computing micro-support SS(F) in the cotangent bundle T*X, enforcing involutivity,
and preventing spectral cotangent defect leakage.
"""

from .kashiwara_schapira_microlocal_shield import (
    KashiwaraSchapiraMicrolocalShieldService,
    get_kashiwara_schapira_microlocal_shield_service,
)

__all__ = [
    "KashiwaraSchapiraMicrolocalShieldService",
    "get_kashiwara_schapira_microlocal_shield_service",
]
