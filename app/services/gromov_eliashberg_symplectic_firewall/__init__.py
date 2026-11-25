"""
Gromov-Eliashberg Symplectic Topology & Contact Non-Squeezing Firewall (Capability 193).
Formalizes Mikhail Gromov and Yakov Eliashberg's symplectic non-squeezing theorem,
pseudo-holomorphic curves, and C^0-rigidity of symplectic diffeomorphisms.
"""

from .gromov_eliashberg_symplectic_firewall import (
    GromovEliashbergSymplecticFirewallService,
    get_gromov_eliashberg_symplectic_firewall_service,
)

__all__ = [
    "GromovEliashbergSymplecticFirewallService",
    "get_gromov_eliashberg_symplectic_firewall_service",
]
