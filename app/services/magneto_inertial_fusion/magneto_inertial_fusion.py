"""
Option B: Sovereign Directed Magneto-Inertial Fusion (MIF) Deep-Space Toroidal Propulsion & Pulsed Energy Matrix.

Combines pulsed multi-megampere magnetic drivers with imploding metal plasma liners to compress
magnetized thermonuclear targets, achieving breakeven (Q > 10, >2.5 GW_th yield) and driving pulsed
magnetic expansion nozzles (>120,000s specific impulse) for deep-space laser array power and sovereign propulsion.
"""

import random
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Dict, List


@dataclass
class MIFReactorPlatform:
    reactor_id: str
    callsign: str
    peak_driver_current_ma: float
    plasma_liner_velocity_kms: float
    thermonuclear_q_factor: float
    pulse_repetition_rate_hz: float
    thermal_power_output_gw: float
    magnetic_nozzle_isp_seconds: float
    status: str = "MIF_MAGNETIC_LINER_ARMED"


@dataclass
class MIFPulseResult:
    pulse_id: str
    reactor_id: str
    peak_current_ma: float
    fusion_gain_q: float
    plasma_implosion_pressure_mbar: float
    thermal_yield_gw: float
    direct_electrical_conversion_mw: float
    magnetic_nozzle_exhaust_velocity_kms: float
    specific_impulse_isp_s: float
    dew_array_power_bus_charged: bool
    status: str
    timestamp: str


class MagnetoInertialFusion:
    """
    Sovereign Directed Magneto-Inertial Fusion (MIF) Matrix.
    """

    def __init__(self):
        self.reactors: Dict[str, MIFReactorPlatform] = {}
        self.history: List[MIFPulseResult] = []
        self._initialize_default_reactors()

    def _initialize_default_reactors(self):
        default_reactors = [
            MIFReactorPlatform(
                reactor_id="MIF-REACTOR-ORBITAL-01",
                callsign="Prometheus Sovereign High-Orbit MIF Core",
                peak_driver_current_ma=20.5,
                plasma_liner_velocity_kms=125.0,
                thermonuclear_q_factor=11.4,
                pulse_repetition_rate_hz=10.0,
                thermal_power_output_gw=2.85,
                magnetic_nozzle_isp_seconds=128500.0,
            ),
            MIFReactorPlatform(
                reactor_id="MIF-REACTOR-LUNAR-02",
                callsign="Artemis Deep-Well South-Pole Toroidal Liner Array",
                peak_driver_current_ma=22.8,
                plasma_liner_velocity_kms=135.0,
                thermonuclear_q_factor=12.8,
                pulse_repetition_rate_hz=10.0,
                thermal_power_output_gw=3.40,
                magnetic_nozzle_isp_seconds=134000.0,
            ),
            MIFReactorPlatform(
                reactor_id="MIF-REACTOR-DEEP-SPACE-03",
                callsign="Helios Interplanetary Pulse Wave Propulsion Vault",
                peak_driver_current_ma=24.5,
                plasma_liner_velocity_kms=145.0,
                thermonuclear_q_factor=13.6,
                pulse_repetition_rate_hz=10.0,
                thermal_power_output_gw=3.85,
                magnetic_nozzle_isp_seconds=142000.0,
            ),
        ]
        for r in default_reactors:
            self.reactors[r.reactor_id] = r

    def list_reactors(self) -> List[Dict[str, Any]]:
        return [
            {
                "reactor_id": r.reactor_id,
                "callsign": r.callsign,
                "peak_driver_current_ma": r.peak_driver_current_ma,
                "plasma_liner_velocity_kms": r.plasma_liner_velocity_kms,
                "thermonuclear_q_factor": r.thermonuclear_q_factor,
                "pulse_repetition_rate_hz": r.pulse_repetition_rate_hz,
                "thermal_power_output_gw": r.thermal_power_output_gw,
                "magnetic_nozzle_isp_seconds": r.magnetic_nozzle_isp_seconds,
                "status": r.status,
            }
            for r in self.reactors.values()
        ]

    list_mif_reactors = list_reactors

    def pulse_fusion_reactor(
        self,
        reactor_id: str,
        current_boost_ma: float = 2.0,
        compression_gain: float = 1.0,
        **kwargs: Any,
    ) -> Dict[str, Any]:
        """
        Triggers a multi-megampere magnetic liner implosion, achieving thermonuclear breakeven (Q > 10)
        and releasing high-temperature charged plasma through the magnetic nozzle.
        """
        reactor = self.reactors.get(reactor_id)
        if not reactor:
            raise ValueError(f"MIF reactor {reactor_id} not registered.")

        current = reactor.peak_driver_current_ma + current_boost_ma
        q_val = round(reactor.thermonuclear_q_factor * (1.0 + 0.05 * compression_gain), 2)
        thermal_gw = round(reactor.thermal_power_output_gw * (1.0 + 0.06 * compression_gain), 2)
        electrical_mw = round(thermal_gw * 340.0, 1)  # Direct conversion yield
        pressure_mbar = round(48.5 * (current / 20.0)**2, 1)
        exhaust_vel = round(1180.0 + current * 4.5, 1)
        isp = round(exhaust_vel * 101.97, 1)

        pulse_id = f"MIF-PULSE-{int(datetime.now(timezone.utc).timestamp())}-{random.randint(100, 999)}"
        res = MIFPulseResult(
            pulse_id=pulse_id,
            reactor_id=reactor_id,
            peak_current_ma=current,
            fusion_gain_q=q_val,
            plasma_implosion_pressure_mbar=pressure_mbar,
            thermal_yield_gw=thermal_gw,
            direct_electrical_conversion_mw=electrical_mw,
            magnetic_nozzle_exhaust_velocity_kms=exhaust_vel,
            specific_impulse_isp_s=isp,
            dew_array_power_bus_charged=True,
            status="MIF_THERMONUCLEAR_PULSE_SUCCESS",
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
        self.history.append(res)

        return {
            "pulse_id": res.pulse_id,
            "reactor_id": res.reactor_id,
            "peak_current_ma": res.peak_current_ma,
            "fusion_gain_q": res.fusion_gain_q,
            "plasma_implosion_pressure_mbar": res.plasma_implosion_pressure_mbar,
            "thermal_yield_gw": res.thermal_yield_gw,
            "direct_electrical_conversion_mw": res.direct_electrical_conversion_mw,
            "magnetic_nozzle_exhaust_velocity_kms": res.magnetic_nozzle_exhaust_velocity_kms,
            "specific_impulse_isp_s": res.specific_impulse_isp_s,
            "dew_array_power_bus_charged": res.dew_array_power_bus_charged,
            "status": res.status,
            "timestamp": res.timestamp,
        }

    def get_fusion_metrics(self) -> Dict[str, Any]:
        return {
            "operational_reactors": len(self.reactors),
            "completed_fusion_pulses": len(self.history),
            "mean_energy_gain_q": 12.5,
            "confinement_scheme": "CYLINDRICAL_METALLIC_LINER_MAGNETO_INERTIAL",
            "specific_impulse_threshold_s": 120000.0,
            "dew_coupling_status": "HIGH_VOLTAGE_SUPERCONDUCTING_BUS_SYNCHRONIZED",
            "status": "OPERATIONAL",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }


magneto_inertial_fusion = MagnetoInertialFusion()


def get_magneto_inertial_fusion() -> MagnetoInertialFusion:
    return magneto_inertial_fusion

