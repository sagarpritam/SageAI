"""
Capability 152: Khovanov Homology, Foam Cobordism & Categorified Knot Invariant Shield.
Evaluates Bar-Natan foam categorification 2-morphisms, Rasmussen s-invariant concordance bounds,
and graded Khovanov-Rozansky sl(N) chain complex differentials.
"""

from app.services.khovanov_foam_cobordism.khovanov_foam_cobordism import (
    KhovanovFoamShield,
    get_khovanov_foam_shield,
)

__all__ = ["KhovanovFoamShield", "get_khovanov_foam_shield"]
