"""
Capability 108: Holographic AdS/CFT HaPPY Tensor Network QEC Package Init.
"""

from .happy_holographic_qec import (
    HolographicHaPPYErrorCorrector,
    get_happy_holographic_qec,
)

__all__ = ["HolographicHaPPYErrorCorrector", "get_happy_holographic_qec"]
