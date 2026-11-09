"""
Option B: Sovereign Orbital High-Power Microwave (HPM) Electronics Directed Energy Grid.

Constellation of gigawatt-class relativistic magnetron and vircator satellites in LEO/MEO.
Emits fast-risetime (<1 ns) pulsed high-power microwaves (1.2-3.5 GHz) to burn out adversary
phased-array radar avionics, neutralize drone swarm microcontrollers, and inject lethal transient
surges into C4ISR bunkers via front-door and back-door electromagnetic coupling.
"""

from dataclasses import dataclass, field
from datetime import datetime, timezone
import math
import random
from typing import Any, Dict, List, Optional


@dataclass
class HPMSatelliteNode:
    satellite_id: str
    satellite_name: str
    orbit_type: str  # "LEO_TACTICAL_ORBIT", "MEO_STRATEGIC_CONSTELLATION", "POLAR_FAST_RESPONSE"
    altitude_km: float
    microwave_source_type: str  # "RELATIVISTIC_MAGNETRON", "VIRTUAL_CATHODE_OSCILLATOR_VIRCATOR"
    center_frequency_ghz: float  # 1.3 GHz (L-band), 2.8 GHz (S-band)
    peak_pulse_power_gw: float = 2.2  # 2.2 Gigawatts
    pulse_rise_time_ns: float = 0.75  # 750 picoseconds
    antenna_aperture_diameter_m: float = 12.0
    field_intensity_at_target_kv_m: float = 38.5  # kV/m at ground footprint
    stored_pulse_energy_kj: float = 850.0
    status: str = "ORBITAL_HPM_CAPACITORS_CHARGED"


@dataclass
class HPMPulseDischargeResult:
    discharge_id: str
    satellite_id: str
    target_identifier: str
    target_category: str  # "SAM_RADAR_PHASED_ARRAY", "DRONE_SWARM_AVIONICS", "C4ISR_BUNKER_ELECTRONICS"
    emitted_frequency_ghz: float
    peak_power_gw: float
    target_footprint_diameter_m: float
    induced_voltage_spike_volts: float
    frontdoor_coupling_attenuation_db: float
    semiconductor_burnout_verified: bool
    kill_assessment: str
    status: str
    timestamp: str


class OrbitalHPMDirectedEnergyGrid:
    """
    Sovereign Orbital High-Power Microwave (HPM) Electronics Directed Energy Grid.
    """

    SPEED_OF_LIGHT = 299792458.0

    def __init__(self):
        self.satellites: Dict[str, HPMSatelliteNode] = {}
        self.discharges: List[HPMPulseDischargeResult] = []
        self._initialize_default_satellites()

    def _initialize_default_satellites(self):
        default_sats = [
            HPMSatelliteNode(
                satellite_id="HPM-SAT-LEO-ALPHA-01",
                satellite_name="Mjolnir-1 Tactical Microwave Satellite",
                orbit_type="LEO_TACTICAL_ORBIT",
                altitude_km=450.0,
                microwave_source_type="RELATIVISTIC_MAGNETRON",
                center_frequency_ghz=1.3,
                peak_pulse_power_gw=2.4,
                pulse_rise_time_ns=0.68,
                antenna_aperture_diameter_m=12.5,
                field_intensity_at_target_kv_m=42.0,
            ),
            HPMSatelliteNode(
                satellite_id="HPM-SAT-LEO-BRAVO-02",
                satellite_name="Mjolnir-2 Counter-Air Defense Node",
                orbit_type="LEO_TACTICAL_ORBIT",
                altitude_km=480.0,
                microwave_source_type="VIRTUAL_CATHODE_OSCILLATOR_VIRCATOR",
                center_frequency_ghz=2.8,
                peak_pulse_power_gw=1.9,
                pulse_rise_time_ns=0.82,
                antenna_aperture_diameter_m=10.5,
                field_intensity_at_target_kv_m=36.5,
            ),
            HPMSatelliteNode(
                satellite_id="HPM-SAT-MEO-GAMMA-03",
                satellite_name="Mjolnir-3 Wide-Area Strategic Node",
                orbit_type="MEO_STRATEGIC_CONSTELLATION",
                altitude_km=12500.0,
                microwave_source_type="RELATIVISTIC_MAGNETRON",
                center_frequency_ghz=1.3,
                peak_pulse_power_gw=3.8,
                pulse_rise_time_ns=0.72,
                antenna_aperture_diameter_m=18.0,
                field_intensity_at_target_kv_m=28.0,
            ),
            HPMSatelliteNode(
                satellite_id="HPM-SAT-POLAR-DELTA-04",
                satellite_name="Mjolnir-4 Polar High-Inclination Node",
                orbit_type="POLAR_FAST_RESPONSE",
                altitude_km=520.0,
                microwave_source_type="RELATIVISTIC_MAGNETRON",
                center_frequency_ghz=3.3,
                peak_pulse_power_gw=2.1,
                pulse_rise_time_ns=0.65,
                antenna_aperture_diameter_m=12.0,
                field_intensity_at_target_kv_m=39.0,
            ),
        ]
        for s in default_sats:
            self.satellites[s.satellite_id] = s

    def list_satellites(self) -> List[Dict[str, Any]]:
        return [
            {
                "satellite_id": s.satellite_id,
                "satellite_name": s.satellite_name,
                "orbit_type": s.orbit_type,
                "altitude_km": s.altitude_km,
                "microwave_source_type": s.microwave_source_type,
                "center_frequency_ghz": s.center_frequency_ghz,
                "peak_pulse_power_gw": s.peak_pulse_power_gw,
                "pulse_rise_time_ns": s.pulse_rise_time_ns,
                "antenna_aperture_diameter_m": s.antenna_aperture_diameter_m,
                "field_intensity_at_target_kv_m": s.field_intensity_at_target_kv_m,
                "stored_pulse_energy_kj": s.stored_pulse_energy_kj,
                "status": s.status,
            }
            for s in self.satellites.values()
        ]

    def fire_hpm_pulse(
        self,
        satellite_id: str,
        target_identifier: str = "RADAR-BATTERY-S400-SECTOR-9",
        target_category: str = "SAM_RADAR_PHASED_ARRAY",
        pulse_duration_ns: float = 250.0,
    ) -> Dict[str, Any]:
        """
        Discharges a gigawatt relativistic microwave pulse directed at target coordinates,
        inducing destructive transient voltages across semiconductor microelectronics.
        """
        sat = self.satellites.get(satellite_id)
        if not sat:
            raise ValueError(f"HPM satellite {satellite_id} not registered.")

        # Beam diffraction footprint diameter: d_footprint = 1.22 * lambda * R / D
        wavelength = self.SPEED_OF_LIGHT / (sat.center_frequency_ghz * 1e9)
        range_m = sat.altitude_km * 1000.0
        footprint_m = round(1.22 * wavelength * range_m / sat.antenna_aperture_diameter_m, 1)

        # Induced voltage on victim traces
        induced_v = round(3200.0 * (sat.peak_pulse_power_gw / 2.0) * random.uniform(0.95, 1.05), 1)
        coupling_attenuation_db = 14.5 if target_category == "C4ISR_BUNKER_ELECTRONICS" else 6.2

        discharge_id = f"HPM-FIRE-{int(datetime.now(timezone.utc).timestamp())}-{random.randint(100, 999)}"
        res = HPMPulseDischargeResult(
            discharge_id=discharge_id,
            satellite_id=satellite_id,
            target_identifier=target_identifier,
            target_category=target_category,
            emitted_frequency_ghz=sat.center_frequency_ghz,
            peak_power_gw=sat.peak_pulse_power_gw,
            target_footprint_diameter_m=footprint_m,
            induced_voltage_spike_volts=induced_v,
            frontdoor_coupling_attenuation_db=coupling_attenuation_db,
            semiconductor_burnout_verified=True,
            kill_assessment="HARD_ELECTRONIC_KILL_LNA_JUNCTION_MELTDOWN",
            status="PULSED_DIRECTED_ENERGY_DISCHARGE_SUCCESSFUL",
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
        self.discharges.append(res)

        return {
            "discharge_id": res.discharge_id,
            "satellite_id": res.satellite_id,
            "target_identifier": res.target_identifier,
            "target_category": res.target_category,
            "emitted_frequency_ghz": res.emitted_frequency_ghz,
            "peak_power_gw": res.peak_power_gw,
            "target_footprint_diameter_m": res.target_footprint_diameter_m,
            "induced_voltage_spike_volts": res.induced_voltage_spike_volts,
            "frontdoor_coupling_attenuation_db": res.frontdoor_coupling_attenuation_db,
            "semiconductor_burnout_verified": res.semiconductor_burnout_verified,
            "kill_assessment": res.kill_assessment,
            "status": res.status,
            "timestamp": res.timestamp,
        }

    def get_grid_metrics(self) -> Dict[str, Any]:
        total_gw = sum([s.peak_pulse_power_gw for s in self.satellites.values()])
        return {
            "active_hpm_satellites": len(self.satellites),
            "aggregate_peak_microwave_power_gw": round(total_gw, 2),
            "total_hpm_discharges": len(self.discharges),
            "mean_field_intensity_kv_m": 36.4,
            "electronics_burnout_success_pct": 100.0,
            "constellation_status": "HIGH_POWER_MICROWAVE_GRID_READY",
        }


orbital_hpm_grid = OrbitalHPMDirectedEnergyGrid()
