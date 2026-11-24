"""
Option B Wave 49: Planetary Ultra-Dense Rydberg Exciton-Polariton Condensate Supergrid.
Harvests macroscopic room-temperature Bose-Einstein condensation (BEC) of Rydberg exciton-polaritons
in ultra-high-Q perovskite microcavities and 2D van der Waals moire heterostructures.
Exploits giant Rydberg dipole-dipole interactions and optical parametric oscillation (OPO)
to dispatch zero-dissipation polariton superfluid power with >99.95% grid efficiency.
"""

import math
import time
from typing import Any, Dict, List


class RydbergPolaritonSupergridService:
    """Option B Wave 49: Planetary Ultra-Dense Rydberg Exciton-Polariton Supergrid Service."""

    def __init__(self) -> None:
        self._cavities: Dict[str, Dict[str, Any]] = {
            "RYDBERG-PEROVSKITE-CAVITY-01": {
                "cavity_id": "RYDBERG-PEROVSKITE-CAVITY-01",
                "classification": "Perovskite CsPbBr_3 Microcavity Polariton BEC Array",
                "rabi_splitting_mev": 42.5,
                "condensate_density_cm3": 8.4e16,
                "base_harvest_mw": 1180.0,
                "grid_efficiency_pct": 99.98,
                "status": "POLARITON_CONDENSED",
            },
            "RYDBERG-TMD-HETEROSTRUCTURE-02": {
                "cavity_id": "RYDBERG-TMD-HETEROSTRUCTURE-02",
                "classification": "MoSe_2/WSe_2 Moire Heterostructure Rydberg Polariton Grid",
                "rabi_splitting_mev": 58.2,
                "condensate_density_cm3": 1.2e17,
                "base_harvest_mw": 1620.0,
                "grid_efficiency_pct": 99.99,
                "status": "POLARITON_CONDENSED",
            },
            "RYDBERG-CU2O-QUANTUM-WELL-03": {
                "cavity_id": "RYDBERG-CU2O-QUANTUM-WELL-03",
                "classification": "Rydberg Cuprous Oxide Cu_2O Giant Exciton Superfluid Grid",
                "rabi_splitting_mev": 76.0,
                "condensate_density_cm3": 2.5e17,
                "base_harvest_mw": 2150.0,
                "grid_efficiency_pct": 99.97,
                "status": "POLARITON_CONDENSED",
            },
        }
        self._harvest_history: List[Dict[str, Any]] = []

    def get_cavities(self) -> List[Dict[str, Any]]:
        """Return all registered Rydberg polariton microcavity arrays."""
        return list(self._cavities.values())

    def harvest_polariton(
        self,
        cavity_id: str,
        exciton_fraction_pct: float = 50.0,
        pump_fluence_uj_cm2: float = 120.0,
        superfluid_coupling_gain: float = 1.15,
        temperature_k: float = 295.0,
    ) -> Dict[str, Any]:
        """Harvest zero-dissipation electric power from Rydberg polariton BEC condensate."""
        if cavity_id not in self._cavities:
            raise ValueError(f"Unknown cavity ID: {cavity_id}")
        if exciton_fraction_pct <= 0.0 or exciton_fraction_pct >= 100.0:
            raise ValueError(
                f"exciton_fraction_pct {exciton_fraction_pct} must be in (0.0, 100.0)"
            )
        if pump_fluence_uj_cm2 <= 0.0 or pump_fluence_uj_cm2 > 1000.0:
            raise ValueError(
                f"pump_fluence_uj_cm2 {pump_fluence_uj_cm2} out of bounds (0, 1000]"
            )

        cavity = self._cavities[cavity_id]
        base_mw = float(cavity["base_harvest_mw"])

        harvested_power = base_mw * (
            1.0 + 0.002 * (pump_fluence_uj_cm2 - 100.0) * superfluid_coupling_gain
        )
        bogoliubov_sound_velocity = round(
            1.2e6 * math.sqrt(float(cavity["rabi_splitting_mev"]) / 40.0), 2
        )
        efficiency = min(
            99.999,
            float(cavity["grid_efficiency_pct"]) + (superfluid_coupling_gain * 0.005),
        )

        record = {
            "cavity_id": cavity_id,
            "classification": cavity["classification"],
            "harvested_power_mw": round(harvested_power, 2),
            "bogoliubov_sound_velocity_m_s": bogoliubov_sound_velocity,
            "grid_efficiency_pct": round(efficiency, 3),
            "condensate_phase_coherence": 0.9999998,
            "temperature_k": temperature_k,
            "harvest_status": "POLARITON_POWER_DISPATCHED",
            "timestamp": time.time(),
        }
        self._harvest_history.append(record)
        return record

    def get_metrics(self) -> Dict[str, Any]:
        """Return aggregate telemetry metrics for Rydberg polariton supergrid."""
        return {
            "active_rydberg_cavities": len(self._cavities),
            "total_harvested_mw": sum(
                c["base_harvest_mw"] for c in self._cavities.values()
            ),
            "harvests_dispatched": len(self._harvest_history),
            "average_grid_efficiency_pct": 99.985,
            "peak_rabi_splitting_mev": 76.0,
            "polariton_superfluid_conformance": "100.0% ZERO_RESISTANCE_SUPERFLUID",
            "status": "RYDBERG_POLARITON_SUPERGRID_OPTIMAL",
        }


_rydberg_polariton_service = RydbergPolaritonSupergridService()


def get_rydberg_polariton_supergrid_service() -> RydbergPolaritonSupergridService:
    return _rydberg_polariton_service
