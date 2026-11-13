"""
Capability 153: Derived Algebraic Geometry, Spectral Scheme & Derived Artin Stack Firewall.
Evaluates Lurie spectral Deligne-Mumford & Artin stacks, cotangent complex obstruction classes,
and non-connective derived quasi-coherent sheaf hypercomplete etale descent.
"""

from app.services.derived_spectral_scheme.derived_spectral_scheme import (
    DerivedSpectralSchemeFirewall,
    get_derived_spectral_scheme_firewall,
)

__all__ = [
    "DerivedSpectralSchemeFirewall",
    "get_derived_spectral_scheme_firewall",
]
