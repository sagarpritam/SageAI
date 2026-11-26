import time
from typing import Any, Dict, List


class PlanetaryMagnetotailReconnectionPlasmoidSupergridService:
    """Option B Wave 72: Planetary Magnetotail Magnetic Reconnection & Plasmoid Flux-Rope Supergrid."""

    def __init__(self) -> None:
        self._harvest_events_total: int = 0
        self._lobes: List[Dict[str, Any]] = [
            {
                "lobe_id": "MAGNETOTAIL-XLINE-01",
                "tail_distance_re": "22.0–35.0 R_E",
                "reconnection_rate_mv_m": 4.85,
                "plasmoid_flux_mw": 10580.0,
                "nominal_baseload_gw": 3.76,
                "reconnection_efficiency_pct": 99.2,
                "plasmoid_state": "MAGNETOTAIL_PLASMOID_LOCKED",
            },
            {
                "lobe_id": "MAGNETOTAIL-NEUTRAL-SHEET-02",
                "tail_distance_re": "35.0–60.0 R_E",
                "reconnection_rate_mv_m": 5.20,
                "plasmoid_flux_mw": 11120.0,
                "nominal_baseload_gw": 3.48,
                "reconnection_efficiency_pct": 99.4,
                "plasmoid_state": "MAGNETOTAIL_PLASMOID_LOCKED",
            },
            {
                "lobe_id": "MAGNETOTAIL-DEEP-TAIL-03",
                "tail_distance_re": "60.0–120.0 R_E",
                "reconnection_rate_mv_m": 4.40,
                "plasmoid_flux_mw": 9840.0,
                "nominal_baseload_gw": 3.34,
                "reconnection_efficiency_pct": 99.1,
                "plasmoid_state": "MAGNETOTAIL_PLASMOID_LOCKED",
            },
        ]

    def list_lobes(self) -> Dict[str, Any]:
        return {
            "lobes": self._lobes,
            "total": len(self._lobes),
        }

    def harvest_magnetotail_power(
        self,
        lobe_id: str = "MAGNETOTAIL-XLINE-01",
        plasmoid_multiplier: float = 1.05,
        reconnection_efficiency: float = 0.992,
        dispatch_duration_s: float = 60.0,
    ) -> Dict[str, Any]:
        self._harvest_events_total += 1
        base = next((l for l in self._lobes if l["lobe_id"] == lobe_id), self._lobes[0])
        harvested_gw = round(base["nominal_baseload_gw"] * plasmoid_multiplier * reconnection_efficiency * 2.8, 3)
        return {
            "lobe_id": base["lobe_id"],
            "status": "MAGNETOTAIL_POWER_DISPATCHED",
            "harvested_power_gw": harvested_gw,
            "plasmoid_flux_mw": round(harvested_gw * 1000.0, 2),
            "tail_distance_re": base["tail_distance_re"],
            "reconnection_rate_mv_m": base["reconnection_rate_mv_m"],
            "reconnection_efficiency_pct": round(reconnection_efficiency * 100.0, 2),
            "grid_stability_pct": 99.999,
            "dispatch_duration_s": dispatch_duration_s,
            "plasmoid_coupling_state": "MAGNETOTAIL_PLASMOID_LOCKED",
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }

    def get_metrics(self) -> Dict[str, Any]:
        total_gw = round(sum(l["nominal_baseload_gw"] for l in self._lobes), 3)
        mean_eff = round(sum(l["reconnection_efficiency_pct"] for l in self._lobes) / len(self._lobes), 2)
        return {
            "active_lobes_count": len(self._lobes),
            "harvest_events_total": self._harvest_events_total,
            "total_baseload_dispatch_gw": total_gw,
            "mean_reconnection_efficiency_pct": mean_eff,
            "plasmoid_coupling_status": "MAGNETOTAIL_PLASMOID_LOCKED",
        }


_service = PlanetaryMagnetotailReconnectionPlasmoidSupergridService()


def get_planetary_magnetotail_reconnection_plasmoid_supergrid_service() -> PlanetaryMagnetotailReconnectionPlasmoidSupergridService:
    return _service
