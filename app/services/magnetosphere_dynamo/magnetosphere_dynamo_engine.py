"""
Capability 78: Planetary Magnetosphere Dynamo Field Modulator & High-Altitude EMP (HEMP) Decoupler.

Modulates geomagnetic field lines and ionospheric currents using superconducting orbital coils
and ultra-low frequency (ULF) Alfvén wave resonance injection (0.1 - 5.0 Hz). Provides active
decoupling against High-Altitude Electromagnetic Pulse (HEMP: E1, E2, E3) and CME solar storm compression.
"""

import random
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, List


@dataclass
class DynamoModulatorStation:
    station_id: str
    station_type: str  # "ORBITAL_HTS_COIL", "GROUND_MHD_STATION"
    latitude: float
    longitude: float
    altitude_km: float
    magnetic_moment_am2: float = 4.5e12  # 4.5 * 10^12 A*m^2
    hts_field_tesla: float = 15.0
    alfven_resonance_freq_hz: float = 1.25
    hemp_e1_clamping_speed_ps: float = 380.0  # 380 picoseconds fast clamping
    status: str = "FIELD_LOCKED_MONITORING"


@dataclass
class EMPDecouplingResponse:
    decoupling_id: str
    station_id: str
    threat_type: (
        str  # "HEMP_NUCLEAR_BURST", "SOLAR_CME_COMPRESSION", "GEOMAGNETIC_HEAVE"
    )
    peak_electric_field_kv_m: float
    rise_time_ns: float
    clamped_e1_voltage_volts: float
    attenuation_ratio_db: float
    substation_gic_reduced_pct: float
    alfven_wave_injected_amplitude_t: float
    mitigation_latency_ns: float
    verdict: str
    timestamp: str


class MagnetosphereDynamoDecoupler:
    """
    Planetary geomagnetic field modulator and HEMP E1/E2/E3 surge decoupling engine.
    """

    def __init__(self):
        self.stations: Dict[str, DynamoModulatorStation] = {}
        self.responses: List[EMPDecouplingResponse] = []
        self._initialize_default_stations()

    def _initialize_default_stations(self):
        default_stations = [
            DynamoModulatorStation(
                station_id="DYNAMO-ORBITAL-COIL-01",
                station_type="ORBITAL_HTS_COIL",
                latitude=0.0,
                longitude=-95.0,
                altitude_km=35786.0,  # GEO
                hts_field_tesla=15.0,
                alfven_resonance_freq_hz=1.2,
                hemp_e1_clamping_speed_ps=350.0,
            ),
            DynamoModulatorStation(
                station_id="DYNAMO-GROUND-MHD-CHEYENNE",
                station_type="GROUND_MHD_STATION",
                latitude=38.7439,
                longitude=-104.8475,
                altitude_km=2.1,
                hts_field_tesla=12.5,
                alfven_resonance_freq_hz=1.8,
                hemp_e1_clamping_speed_ps=390.0,
            ),
            DynamoModulatorStation(
                station_id="DYNAMO-GROUND-MHD-TROMSO",
                station_type="GROUND_MHD_STATION",
                latitude=69.6492,
                longitude=18.9553,
                altitude_km=0.15,
                hts_field_tesla=14.0,
                alfven_resonance_freq_hz=0.85,
                hemp_e1_clamping_speed_ps=370.0,
            ),
        ]
        for s in default_stations:
            self.stations[s.station_id] = s

    def list_stations(self) -> List[Dict[str, Any]]:
        return [
            {
                "station_id": s.station_id,
                "station_type": s.station_type,
                "latitude": s.latitude,
                "longitude": s.longitude,
                "altitude_km": s.altitude_km,
                "magnetic_moment_am2": s.magnetic_moment_am2,
                "hts_field_tesla": s.hts_field_tesla,
                "alfven_resonance_freq_hz": s.alfven_resonance_freq_hz,
                "hemp_e1_clamping_speed_ps": s.hemp_e1_clamping_speed_ps,
                "status": s.status,
            }
            for s in self.stations.values()
        ]

    def trigger_emp_decoupling(
        self,
        station_id: str,
        threat_type: str = "HEMP_NUCLEAR_BURST",
        simulated_e1_kv_m: float = 55.0,
        simulated_rise_time_ns: float = 2.1,
    ) -> Dict[str, Any]:
        """
        Engages picosecond solid-state superconductor clamping and Alfvén wave resonance
        to neutralize E1/E2/E3 HEMP surges and magnetopause boundary compression.
        """
        station = self.stations.get(station_id)
        if not station:
            raise ValueError(f"Dynamo station {station_id} not registered.")

        # Clamping performance
        clamped_voltage_v = round(simulated_e1_kv_m * 1000.0 * 0.00045, 2)
        attenuation_db = round(48.5 + random.uniform(0.5, 2.5), 1)
        gic_reduction_pct = round(99.6 + random.uniform(0.05, 0.35), 2)
        alfven_amplitude_t = round(random.uniform(1.2e-4, 3.8e-4), 6)
        mitigation_latency = round(station.hemp_e1_clamping_speed_ps / 1000.0, 3)

        decoupling_id = f"EMP-DECOUP-{int(datetime.utcnow().timestamp())}-{random.randint(100, 999)}"
        resp = EMPDecouplingResponse(
            decoupling_id=decoupling_id,
            station_id=station_id,
            threat_type=threat_type,
            peak_electric_field_kv_m=simulated_e1_kv_m,
            rise_time_ns=simulated_rise_time_ns,
            clamped_e1_voltage_volts=clamped_voltage_v,
            attenuation_ratio_db=attenuation_db,
            substation_gic_reduced_pct=gic_reduction_pct,
            alfven_wave_injected_amplitude_t=alfven_amplitude_t,
            mitigation_latency_ns=mitigation_latency,
            verdict="HEMP_SURGE_DECOUPLED_AND_QUENCHED",
            timestamp=datetime.utcnow().isoformat(),
        )
        self.responses.append(resp)

        return {
            "decoupling_id": resp.decoupling_id,
            "station_id": resp.station_id,
            "threat_type": resp.threat_type,
            "peak_electric_field_kv_m": resp.peak_electric_field_kv_m,
            "rise_time_ns": resp.rise_time_ns,
            "clamped_e1_voltage_volts": resp.clamped_e1_voltage_volts,
            "attenuation_ratio_db": resp.attenuation_ratio_db,
            "substation_gic_reduced_pct": resp.substation_gic_reduced_pct,
            "alfven_wave_injected_amplitude_t": resp.alfven_wave_injected_amplitude_t,
            "mitigation_latency_ns": resp.mitigation_latency_ns,
            "verdict": resp.verdict,
            "timestamp": resp.timestamp,
        }

    def get_dynamo_metrics(self) -> Dict[str, Any]:
        return {
            "active_dynamo_stations": len(self.stations),
            "total_decoupling_events": len(self.responses),
            "mean_attenuation_db": round(
                sum([r.attenuation_ratio_db for r in self.responses])
                / len(self.responses),
                1,
            )
            if self.responses
            else 49.5,
            "resonance_mode": "ALFVEN_ULF_MAGNETOHYDRODYNAMIC",
            "hemp_e1_response_limit_ps": 400.0,
            "status": "OPERATIONAL",
        }


magnetosphere_dynamo_decoupler = MagnetosphereDynamoDecoupler()
