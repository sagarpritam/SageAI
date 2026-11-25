"""
Capability 186: Cannon-Thurston Hyperbolic Group Boundary & Fractal Rigid Barrier.
James Cannon, William Thurston, Zlil Sela & Misha Gromov:
Visual Gromov boundary d_infty Gamma, continuous surjection map i_hat: d_infty H -> d_infty G.
"""

from .cannon_thurston_hyperbolic_barrier import (
    CannonThurstonHyperbolicBarrierService,
    get_cannon_thurston_hyperbolic_barrier_service,
)

__all__ = [
    "CannonThurstonHyperbolicBarrierService",
    "get_cannon_thurston_hyperbolic_barrier_service",
]
