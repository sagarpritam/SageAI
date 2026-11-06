"""
Capability 77: Phased Array Gigawatt Relativistic Solar Sail Laser Optical Propulsion & Deflection Mesh.

Models a 100 GW coherent phased-array laser array (1064 nm) delivering photon radiation pressure
for relativistic light-sail acceleration (0.15 - 0.20 c) and hazardous near-Earth asteroid (NEO)
kinetic deflection using adaptive optics with high Strehl ratios.
"""

from dataclasses import dataclass, field
from datetime import datetime
import math
import random
from typing import Any, Dict, List, Optional


@dataclass
class LaserPhasedEmitterArray:
    array_id: str
    location_name: str
    latitude: float
    longitude: float
    altitude_m: float
    total_power_gw: float = 100.0  # 100 Gigawatt peak coherent power
    operating_wavelength_nm: float = 1064.0  # Nd:YAG / Yb fiber
    synthesized_aperture_m: float = 1000.0  # 1 km baseline array
    sub_emitter_tiles: int = 10000
    strehl_ratio: float = 0.91
    tracking_slew_rate_deg_s: float = 12.5
    status: str = "PHASE_LOCKED_ACTIVE"


@dataclass
class LaserPropulsionEvent:
    event_id: str
    array_id: str
    target_type: str  # "RELATIVISTIC_LIGHTSAIL", "ASTEROID_HAZARD_DEFLECTION"
    target_id: str
    beam_power_gw: float
    duration_seconds: float
    radiation_pressure_pa: float
    total_photonic_thrust_newtons: float
    achieved_delta_v_m_s: float
    terminal_velocity_fraction_c: float
    projected_miss_distance_km: float
    strehl_ratio: float
    status: str
    timestamp: str


class RelativisticSolarSailLaserMesh:
    """
    Gigawatt-class coherent phased laser optical propulsion and planetary deflection mesh.
    """

    SPEED_OF_LIGHT = 299792458.0  # m/s

    def __init__(self):
        self.arrays: Dict[str, LaserPhasedEmitterArray] = {}
        self.events: List[LaserPropulsionEvent] = []
        self._initialize_default_arrays()

    def _initialize_default_arrays(self):
        default_arrays = [
            LaserPhasedEmitterArray(
                array_id="LASER-ARRAY-ATACAMA-01",
                location_name="Atacama High Plateau Array",
                latitude=-24.6272,
                longitude=-70.4042,
                altitude_m=5050.0,
                total_power_gw=100.0,
                synthesized_aperture_m=1200.0,
                sub_emitter_tiles=12500,
                strehl_ratio=0.92,
            ),
            LaserPhasedEmitterArray(
                array_id="LASER-ARRAY-MAUNA-KEA-02",
                location_name="Mauna Kea High-Altitude Array",
                latitude=19.8206,
                longitude=-155.4681,
                altitude_m=4205.0,
                total_power_gw=85.0,
                synthesized_aperture_m=950.0,
                sub_emitter_tiles=9800,
                strehl_ratio=0.89,
            ),
            LaserPhasedEmitterArray(
                array_id="LASER-ARRAY-ORBITAL-HELIOS-03",
                location_name="Orbital Lagrange L1 Phased Platform",
                latitude=0.0,
                longitude=0.0,
                altitude_m=326400000.0,
                total_power_gw=120.0,
                synthesized_aperture_m=1500.0,
                sub_emitter_tiles=15000,
                strehl_ratio=0.98,
            ),
        ]
        for arr in default_arrays:
            self.arrays[arr.array_id] = arr

    def list_arrays(self) -> List[Dict[str, Any]]:
        return [
            {
                "array_id": a.array_id,
                "location_name": a.location_name,
                "latitude": a.latitude,
                "longitude": a.longitude,
                "altitude_m": a.altitude_m,
                "total_power_gw": a.total_power_gw,
                "operating_wavelength_nm": a.operating_wavelength_nm,
                "synthesized_aperture_m": a.synthesized_aperture_m,
                "sub_emitter_tiles": a.sub_emitter_tiles,
                "strehl_ratio": a.strehl_ratio,
                "tracking_slew_rate_deg_s": a.tracking_slew_rate_deg_s,
                "status": a.status,
            }
            for a in self.arrays.values()
        ]

    def fire_propulsion_beam(
        self,
        array_id: str,
        target_type: str,
        target_id: str,
        beam_power_gw: float = 80.0,
        duration_seconds: float = 120.0,
        target_mass_kg: float = 5.0,
        sail_area_m2: float = 16.0,
        reflectivity: float = 0.9995,
    ) -> Dict[str, Any]:
        """
        Fires coherent laser beam to apply photon radiation pressure to a lightsail probe
        or ablate a dangerous asteroid surface for kinetic orbit deflection.
        """
        array = self.arrays.get(array_id)
        if not array:
            raise ValueError(f"Laser array {array_id} not registered.")

        # Power clamped by array maximum
        effective_power_w = min(beam_power_gw, array.total_power_gw) * 1e9

        # Photon radiation pressure: P = (2 * R * I) / c
        intensity = effective_power_w / max(1.0, sail_area_m2)
        radiation_pressure_pa = (2.0 * reflectivity * intensity) / self.SPEED_OF_LIGHT

        # Total force in Newtons: F = P * A = (2 * R * Power) / c
        total_thrust_n = (2.0 * reflectivity * effective_power_w) / self.SPEED_OF_LIGHT

        # Acceleration a = F / m
        acceleration_m_s2 = total_thrust_n / max(0.001, target_mass_kg)
        delta_v = acceleration_m_s2 * duration_seconds

        if "LIGHTSAIL" in target_type.upper():
            # Relativistic velocity calculation
            # v = c * tanh(a * t / c)
            rapidity = (acceleration_m_s2 * duration_seconds) / self.SPEED_OF_LIGHT
            v_rel = math.tanh(min(2.0, rapidity))
            fraction_c = round(v_rel, 4)
            miss_dist_km = 0.0
        else:
            # Asteroid deflection
            fraction_c = 0.0
            # Delta-v leads to trajectory deflection over 30 days
            lead_time_sec = 30.0 * 86400.0
            miss_dist_km = round((delta_v * lead_time_sec) / 1000.0, 2)

        event_id = f"LASER-PULSE-{int(datetime.utcnow().timestamp())}-{random.randint(100, 999)}"
        event = LaserPropulsionEvent(
            event_id=event_id,
            array_id=array_id,
            target_type=target_type,
            target_id=target_id,
            beam_power_gw=round(effective_power_w / 1e9, 2),
            duration_seconds=duration_seconds,
            radiation_pressure_pa=round(radiation_pressure_pa, 4),
            total_photonic_thrust_newtons=round(total_thrust_n, 2),
            achieved_delta_v_m_s=round(delta_v, 2),
            terminal_velocity_fraction_c=fraction_c,
            projected_miss_distance_km=miss_dist_km,
            strehl_ratio=array.strehl_ratio,
            status="PULSE_DISCHARGE_SUCCESS",
            timestamp=datetime.utcnow().isoformat(),
        )
        self.events.append(event)

        return {
            "event_id": event.event_id,
            "array_id": event.array_id,
            "target_type": event.target_type,
            "target_id": event.target_id,
            "beam_power_gw": event.beam_power_gw,
            "duration_seconds": event.duration_seconds,
            "radiation_pressure_pa": event.radiation_pressure_pa,
            "total_photonic_thrust_newtons": event.total_photonic_thrust_newtons,
            "achieved_delta_v_m_s": event.achieved_delta_v_m_s,
            "terminal_velocity_fraction_c": event.terminal_velocity_fraction_c,
            "projected_miss_distance_km": event.projected_miss_distance_km,
            "strehl_ratio": event.strehl_ratio,
            "status": event.status,
            "timestamp": event.timestamp,
        }

    def get_mesh_metrics(self) -> Dict[str, Any]:
        total_p = sum([a.total_power_gw for a in self.arrays.values()])
        return {
            "active_laser_arrays": len(self.arrays),
            "total_phased_power_gw": total_p,
            "mean_strehl_ratio": round(sum([a.strehl_ratio for a in self.arrays.values()]) / len(self.arrays), 3),
            "total_propulsion_events": len(self.events),
            "primary_array_mode": "COHERENT_INTERFEROMETRIC_PHASE_LOCK",
            "status": "OPERATIONAL",
        }


relativistic_solar_sail_laser_mesh = RelativisticSolarSailLaserMesh()
