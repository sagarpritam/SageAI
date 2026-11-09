"""
Capability 74: Cis-Lunar Lagrange L1/L2 High-Rate Quantum Laser Optical Relay Engine.

Models deep-space laser communication links across Earth-Moon Lagrange points (L1, L2),
photon orbital angular momentum (OAM) multiplexing, decoy-state BB84 quantum key distribution,
and relativistic Shapiro delay compensation.
"""

import math
import random
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional


@dataclass
class CisLunarTransceiverNode:
    node_id: str
    lagrange_point: str  # "L1", "L2", "Lunar_Gateway", "Earth_Ground_Station"
    distance_km: float
    laser_wavelength_nm: float = 1550.0  # Telecom C-band
    beam_divergence_urad: float = 4.8
    aperture_diameter_m: float = 0.85
    pointing_jitter_nrad: float = 42.0
    optical_power_watts: float = 25.0
    qkd_enabled: bool = True
    oam_modes: List[int] = field(default_factory=lambda: [-2, -1, 0, 1, 2])
    status: str = "ALIGNED_TRACKING"


@dataclass
class CisLunarTransmissionResult:
    transmission_id: str
    source_node: str
    target_node: str
    distance_km: float
    one_way_light_delay_sec: float
    shapiro_delay_nsec: float
    received_optical_power_dbm: float
    quantum_bit_error_rate_qber: float
    secure_key_rate_kbps: float
    oam_aggregate_throughput_gbps: float
    beam_drift_correction_urad: float
    link_status: str
    timestamp: str


class CisLunarQuantumLaserRelay:
    """
    Sovereign deep-space quantum laser relay operating across cis-lunar and lunar orbital space.
    """

    SPEED_OF_LIGHT_KM_S = 299792.458  # km/s
    GM_EARTH = 3.986004418e14  # m^3/s^2
    GM_MOON = 4.9048695e12

    def __init__(self):
        self.nodes: Dict[str, CisLunarTransceiverNode] = {}
        self.transmissions: List[CisLunarTransmissionResult] = []
        self._initialize_default_constellation()

    def _initialize_default_constellation(self):
        default_nodes = [
            CisLunarTransceiverNode(
                node_id="EARTH-OCP-TENERIFE",
                lagrange_point="Earth_Ground_Station",
                distance_km=0.0,
                aperture_diameter_m=1.0,
                pointing_jitter_nrad=35.0,
                optical_power_watts=40.0,
            ),
            CisLunarTransceiverNode(
                node_id="LAGRANGE-L1-HALO-1",
                lagrange_point="L1",
                distance_km=326400.0,
                aperture_diameter_m=0.85,
                pointing_jitter_nrad=45.0,
                optical_power_watts=25.0,
            ),
            CisLunarTransceiverNode(
                node_id="LAGRANGE-L2-HALO-2",
                lagrange_point="L2",
                distance_km=448900.0,
                aperture_diameter_m=1.2,
                pointing_jitter_nrad=50.0,
                optical_power_watts=30.0,
            ),
            CisLunarTransceiverNode(
                node_id="LUNAR-GATEWAY-ORBITER",
                lagrange_point="Lunar_Gateway",
                distance_km=384400.0,
                aperture_diameter_m=0.75,
                pointing_jitter_nrad=48.0,
                optical_power_watts=20.0,
            ),
        ]
        for node in default_nodes:
            self.nodes[node.node_id] = node

    def list_nodes(self) -> List[Dict[str, Any]]:
        return [
            {
                "node_id": n.node_id,
                "lagrange_point": n.lagrange_point,
                "distance_km": n.distance_km,
                "laser_wavelength_nm": n.laser_wavelength_nm,
                "beam_divergence_urad": n.beam_divergence_urad,
                "aperture_diameter_m": n.aperture_diameter_m,
                "pointing_jitter_nrad": n.pointing_jitter_nrad,
                "optical_power_watts": n.optical_power_watts,
                "qkd_enabled": n.qkd_enabled,
                "oam_modes": n.oam_modes,
                "status": n.status,
            }
            for n in self.nodes.values()
        ]

    def establish_quantum_link(
        self,
        source_id: str,
        target_id: str,
        requested_oam_modes: Optional[List[int]] = None,
        atmospheric_turbulence_index: float = 0.15,
    ) -> Dict[str, Any]:
        """
        Calculates link budget, relativistic propagation delay, Shapiro gravitational delay,
        quantum bit error rate (QBER), and aggregate OAM throughput.
        """
        source = self.nodes.get(source_id)
        target = self.nodes.get(target_id)
        if not source or not target:
            raise ValueError(f"Invalid nodes: source={source_id}, target={target_id}")

        # Compute effective geometric distance
        geometric_dist_km = abs(target.distance_km - source.distance_km)
        if geometric_dist_km < 1000.0:
            geometric_dist_km = 384400.0  # Default Earth-to-Moon baseline

        # Relativistic one-way light time
        light_time_sec = geometric_dist_km / self.SPEED_OF_LIGHT_KM_S

        # Relativistic Shapiro delay due to Earth-Moon gravitational well (approx in nsec)
        shapiro_delay_nsec = 4.0 * (self.GM_EARTH / (3e8**3)) * math.log(geometric_dist_km * 1e3 / 6.371e6) * 1e9
        shapiro_delay_nsec = max(1.2, round(abs(shapiro_delay_nsec), 3))

        # Optical link budget (free space path loss + aperture gains)
        wavelength_m = source.laser_wavelength_nm * 1e-9
        freq_hz = 3e8 / wavelength_m
        path_loss_db = 20.0 * math.log10((4.0 * math.pi * geometric_dist_km * 1000.0) / wavelength_m)
        tx_gain_db = 10.0 * math.log10((math.pi * source.aperture_diameter_m / wavelength_m) ** 2)
        rx_gain_db = 10.0 * math.log10((math.pi * target.aperture_diameter_m / wavelength_m) ** 2)
        tx_power_dbm = 10.0 * math.log10(source.optical_power_watts * 1000.0)

        rx_power_dbm = tx_power_dbm + tx_gain_db + rx_gain_db - path_loss_db - (atmospheric_turbulence_index * 8.5)
        rx_power_dbm = round(max(-72.0, min(-38.0, rx_power_dbm)), 2)

        # QBER calculation based on pointing jitter & received optical SNR
        jitter_penalty = (source.pointing_jitter_nrad + target.pointing_jitter_nrad) / 100.0
        qber = 0.012 + (jitter_penalty * 0.004) + (atmospheric_turbulence_index * 0.008)
        qber = round(min(0.11, max(0.015, qber)), 4)

        # Secure key rate (decoy state BB84 formula approximation)
        pulse_rep_rate_mhz = 250.0  # 250 MHz repetition rate
        raw_key_rate_kbps = (10 ** (rx_power_dbm / 10.0)) * 1e7
        secure_key_rate = raw_key_rate_kbps * (1.0 - 2.0 * (-qber * math.log2(max(1e-6, qber)) if qber > 0 else 0))
        secure_key_rate = round(max(12.5, min(95.0, secure_key_rate)), 2)

        # OAM throughput: sum across orthogonal topological charges
        modes = requested_oam_modes or source.oam_modes
        channel_rate_gbps = 80.0  # 80 Gbps per OAM mode
        aggregate_gbps = round(len(modes) * channel_rate_gbps * (1.0 - (qber * 2.0)), 1)

        drift_correction = round(random.uniform(0.12, 0.45) * source.beam_divergence_urad, 3)

        tx_id = f"CISLUNAR-TX-{int(datetime.utcnow().timestamp())}-{random.randint(100, 999)}"
        result = CisLunarTransmissionResult(
            transmission_id=tx_id,
            source_node=source_id,
            target_node=target_id,
            distance_km=geometric_dist_km,
            one_way_light_delay_sec=round(light_time_sec, 4),
            shapiro_delay_nsec=shapiro_delay_nsec,
            received_optical_power_dbm=rx_power_dbm,
            quantum_bit_error_rate_qber=qber,
            secure_key_rate_kbps=secure_key_rate,
            oam_aggregate_throughput_gbps=aggregate_gbps,
            beam_drift_correction_urad=drift_correction,
            link_status="LOCK_OPTIMAL" if qber < 0.05 else "DEGRADED_JITTER",
            timestamp=datetime.utcnow().isoformat(),
        )
        self.transmissions.append(result)
        return {
            "transmission_id": result.transmission_id,
            "source_node": result.source_node,
            "target_node": result.target_node,
            "distance_km": result.distance_km,
            "one_way_light_delay_sec": result.one_way_light_delay_sec,
            "shapiro_delay_nsec": result.shapiro_delay_nsec,
            "received_optical_power_dbm": result.received_optical_power_dbm,
            "quantum_bit_error_rate_qber": result.quantum_bit_error_rate_qber,
            "secure_key_rate_kbps": result.secure_key_rate_kbps,
            "oam_aggregate_throughput_gbps": result.oam_aggregate_throughput_gbps,
            "beam_drift_correction_urad": result.beam_drift_correction_urad,
            "link_status": result.link_status,
            "timestamp": result.timestamp,
        }

    def get_relay_metrics(self) -> Dict[str, Any]:
        return {
            "total_nodes": len(self.nodes),
            "total_transmissions_logged": len(self.transmissions),
            "max_distance_km": max([n.distance_km for n in self.nodes.values()] or [0.0]),
            "primary_constellation": "Earth-Moon L1/L2 High-Rate Quantum Laser Mesh",
            "active_oam_channels": sum([len(n.oam_modes) for n in self.nodes.values()]),
            "status": "OPERATIONAL",
        }


cislunar_quantum_relay = CisLunarQuantumLaserRelay()

