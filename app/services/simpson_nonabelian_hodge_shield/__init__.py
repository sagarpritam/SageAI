"""
Capability 185: Simpson Nonabelian Hodge Correspondence & Higgs Bundles Shield.
Carlos Simpson, Nigel Hitchin, Pierre Deligne & Corlette equivalence:
Flat reductive connections <-> Stable Higgs bundles (E, theta) <-> Harmonic metrics.
"""

from .simpson_nonabelian_hodge_shield import (
    SimpsonNonabelianHodgeShieldService,
    get_simpson_nonabelian_hodge_shield_service,
)

__all__ = [
    "SimpsonNonabelianHodgeShieldService",
    "get_simpson_nonabelian_hodge_shield_service",
]
