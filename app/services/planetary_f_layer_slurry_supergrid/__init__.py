"""
Planetary F-Layer Inner-Core Slurry Stratification Supergrid (Option B Wave 57).
Dispatches continuous multi-gigawatt electrical baseload energy harvested directly
from the lowermost outer core F-layer slurry stratification zone at 4,900-5,150 km depth.
"""

from .planetary_f_layer_slurry_supergrid import (
    PlanetaryFLayerSlurrySupergridService,
    get_planetary_f_layer_slurry_supergrid_service,
)

__all__ = [
    "PlanetaryFLayerSlurrySupergridService",
    "get_planetary_f_layer_slurry_supergrid_service",
]
