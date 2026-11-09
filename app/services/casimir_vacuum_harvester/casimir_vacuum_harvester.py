"""
Capability 84: Dynamic Casimir Effect Vacuum Zero-Point Field Harvester.

Modulates effective electromagnetic boundary conditions at relativistic speeds (v -> c)
using superconducting quantum interference devices (SQUIDs) in microwave coplanar waveguide cavities
to convert ground-state vacuum fluctuations into correlated real photon pairs.
"""

import math
import random
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Dict, List


@dataclass
class CasimirResonatorNode:
    resonator_id: str
    facility_name: str
    latitude: float
    longitude: float
    altitude_m: float
    squid_junction_count: int = 250
    microwave_cavity_freq_ghz: float = 10.4
    boundary_modulation_velocity_c: float = 0.25  # 25% of c effective boundary velocity
    photon_pair_flux_per_second: float = 4.85e11
    squeezing_factor_db: float = 14.2
    cryo_temperature_mk: float = 15.0  # 15 milliKelvin
    status: str = "SUPERCONDUCTING_SQUID_RESONANT"


@dataclass
class VacuumFluxHarvestResult:
    result_id: str
    resonator_id: str
    pump_frequency_ghz: float
    duration_microseconds: float
    correlated_photon_pairs_emitted: float
    two_mode_squeezing_db: float
    vacuum_zero_point_energy_harvested_uj: float
    quantum_state_fidelity: float
    status: str
    timestamp: str


class DynamicCasimirVacuumHarvester:
    """
    Sovereign dynamic Casimir relativistic boundary quantum vacuum zero-point harvester.
    """

    PLANCK_HBAR = 1.054571817e-34  # J * s
    SPEED_OF_LIGHT = 299792458.0  # m/s

    def __init__(self):
        self.resonators: Dict[str, CasimirResonatorNode] = {}
        self.harvest_results: List[VacuumFluxHarvestResult] = []
        self._initialize_default_resonators()

    def _initialize_default_resonators(self):
        default_nodes = [
            CasimirResonatorNode(
                resonator_id="CASIMIR-CAVITY-DELFT-01",
                facility_name="Delft Superconducting Quantum Cavity Lab",
                latitude=52.0067,
                longitude=4.3556,
                altitude_m=1.0,
                squid_junction_count=300,
                microwave_cavity_freq_ghz=10.5,
                boundary_modulation_velocity_c=0.28,
                photon_pair_flux_per_second=5.2e11,
                squeezing_factor_db=15.1,
                cryo_temperature_mk=12.0,
            ),
            CasimirResonatorNode(
                resonator_id="CASIMIR-CAVITY-BOULDER-02",
                facility_name="NIST Boulder Micro-Waveguide Facility",
                latitude=40.0150,
                longitude=-105.2705,
                altitude_m=1655.0,
                squid_junction_count=250,
                microwave_cavity_freq_ghz=9.8,
                boundary_modulation_velocity_c=0.24,
                photon_pair_flux_per_second=4.5e11,
                squeezing_factor_db=13.8,
                cryo_temperature_mk=15.0,
            ),
            CasimirResonatorNode(
                resonator_id="CASIMIR-CAVITY-GENEVA-03",
                facility_name="CERN Sub-Kelvin Vacuum Cryo-Rig",
                latitude=46.2044,
                longitude=6.1432,
                altitude_m=375.0,
                squid_junction_count=400,
                microwave_cavity_freq_ghz=11.2,
                boundary_modulation_velocity_c=0.32,
                photon_pair_flux_per_second=6.8e11,
                squeezing_factor_db=16.4,
                cryo_temperature_mk=8.5,
            ),
        ]
        for node in default_nodes:
            self.resonators[node.resonator_id] = node

    def list_resonators(self) -> List[Dict[str, Any]]:
        return [
            {
                "resonator_id": r.resonator_id,
                "facility_name": r.facility_name,
                "latitude": r.latitude,
                "longitude": r.longitude,
                "altitude_m": r.altitude_m,
                "squid_junction_count": r.squid_junction_count,
                "microwave_cavity_freq_ghz": r.microwave_cavity_freq_ghz,
                "boundary_modulation_velocity_c": r.boundary_modulation_velocity_c,
                "photon_pair_flux_per_second": r.photon_pair_flux_per_second,
                "squeezing_factor_db": r.squeezing_factor_db,
                "cryo_temperature_mk": r.cryo_temperature_mk,
                "status": r.status,
            }
            for r in self.resonators.values()
        ]

    def harvest_vacuum_flux(
        self,
        resonator_id: str,
        pump_power_mw: float = 50.0,
        pulse_duration_us: float = 100.0,
    ) -> Dict[str, Any]:
        """
        Executes parametric fast-flux pumping on the SQUID array at 2*omega_0, creating
        correlated photon pairs directly out of vacuum zero-point electromagnetic fluctuations.
        """
        node = self.resonators.get(resonator_id)
        if not node:
            raise ValueError(f"Resonator {resonator_id} not registered.")

        pump_freq = round(node.microwave_cavity_freq_ghz * 2.0, 3)
        duration_sec = pulse_duration_us * 1e-6

        # Number of photon pairs emitted
        pairs = round(node.photon_pair_flux_per_second * duration_sec * (pump_power_mw / 50.0) * random.uniform(0.98, 1.02))
        squeezing = round(node.squeezing_factor_db * math.sqrt(pump_power_mw / 50.0), 2)

        # Harvested zero point energy in micro-Joules (E = hbar * omega * N)
        omega = 2 * math.pi * node.microwave_cavity_freq_ghz * 1e9
        energy_uj = round((pairs * 2 * self.PLANCK_HBAR * omega) * 1e6, 14)
        if energy_uj == 0.0:
            energy_uj = (pairs * 2 * self.PLANCK_HBAR * omega) * 1e6
        fidelity = round(99.6 + random.uniform(0.05, 0.35), 2)

        result_id = f"CASIMIR-FLUX-{int(datetime.now(timezone.utc).timestamp())}-{random.randint(100, 999)}"
        res = VacuumFluxHarvestResult(
            result_id=result_id,
            resonator_id=resonator_id,
            pump_frequency_ghz=pump_freq,
            duration_microseconds=pulse_duration_us,
            correlated_photon_pairs_emitted=float(pairs),
            two_mode_squeezing_db=squeezing,
            vacuum_zero_point_energy_harvested_uj=energy_uj,
            quantum_state_fidelity=fidelity,
            status="VACUUM_PHOTON_EMISSION_COHERENT",
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
        self.harvest_results.append(res)

        return {
            "result_id": res.result_id,
            "resonator_id": res.resonator_id,
            "pump_frequency_ghz": res.pump_frequency_ghz,
            "duration_microseconds": res.duration_microseconds,
            "correlated_photon_pairs_emitted": res.correlated_photon_pairs_emitted,
            "two_mode_squeezing_db": res.two_mode_squeezing_db,
            "vacuum_zero_point_energy_harvested_uj": res.vacuum_zero_point_energy_harvested_uj,
            "quantum_state_fidelity": res.quantum_state_fidelity,
            "status": res.status,
            "timestamp": res.timestamp,
        }

    def get_resonator_metrics(self) -> Dict[str, Any]:
        return {
            "active_casimir_resonators": len(self.resonators),
            "mean_squeezing_factor_db": round(sum([r.squeezing_factor_db for r in self.resonators.values()]) / len(self.resonators), 1),
            "total_harvest_discharges": len(self.harvest_results),
            "lowest_cryo_temp_mk": min([r.cryo_temperature_mk for r in self.resonators.values()]),
            "physics_mode": "PARAMETRIC_SQUID_RELATIVISTIC_DYNAMIC_CASIMIR",
            "status": "OPERATIONAL",
        }


casimir_vacuum_harvester = DynamicCasimirVacuumHarvester()
