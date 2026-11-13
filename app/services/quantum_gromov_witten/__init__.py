"""
Capability 154: Quantum Cohomology, Gromov-Witten Invariant & Quantum K-Theory Shield.
Evaluates Kontsevich moduli spaces of stable maps, virtual fundamental class cycle intersections,
and WDVV associativity equations across quantum cohomology rings QH*(M) and Givental J-functions.
"""

from app.services.quantum_gromov_witten.quantum_gromov_witten import (
    QuantumGromovWittenShield,
    get_quantum_gromov_witten_shield,
)

__all__ = [
    "QuantumGromovWittenShield",
    "get_quantum_gromov_witten_shield",
]
