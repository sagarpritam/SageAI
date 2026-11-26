import time
from typing import Any, Dict, List


class PlanetaryMagnetopauseKelvinHelmholtzVortexSupergridService:
    """Option B Wave 73: Planetary Magnetopause Kelvin-Helmholtz Vortex & Bow-Shock Supergrid."""

    def __init__(self) -> None:
        self._harvest_events_total: int = 0
        self._vortices: List[Dict[str, Any]] = [
            {
                "vortex_id": "MAGNETOPAUSE-KH-DAWN-01",
                "standoff_distance_re": "10.5–13.0 R_E",
                "shear_velocity_kms": 420.0,
                "vortex_flux_mw": 10840.0,
                "nominal_baseload_gw": 3.84,
                "kh_coupling_efficiency_pct": 99.3,
                "vortex_state": "MAGNETOPAUSE_KH_LOCKED",
            },
            {
                "vortex_id": "MAGNETOPAUSE-KH-DUSK-02",
                "standoff_distance_re": "10.8–13.5 R_E",
                "shear_velocity_kms": 445.0,
                "vortex_flux_mw": 11260.0,
                "nominal_baseload_gw": 3.62,
                "kh_coupling_efficiency_pct": 99.4,
                "vortex_state": "MAGNETOPAUSE_KH_LOCKED",
            },
            {
                "vortex_id": "MAGNETOPAUSE-BOWSHOCK-03",
                "standoff_distance_re": "13.5–16.0 R_E",
                "shear_velocity_kms": 510.0,
                "vortex_flux_mw": 10200.0,
                "nominal_baseload_gw": 3.38,
                "kh_coupling_efficiency_pct": 99.2,
                "vortex_state": "MAGNETOPAUSE_KH_LOCKED",
            },
        ]

    def list_vortices(self) -> Dict[str, Any]:
        return {"vortices": self._vortices, "total": len(self._vortices)}

    def harvest_magnetopause_power(
        self,
        vortex_id: str = "MAGNETOPAUSE-KH-DAWN-01",
        vortex_multiplier: float = 1.05,
        kh_efficiency: float = 0.993,
        dispatch_duration_s: float = 60.0,
    ) -> Dict[str, Any]:
        self._harvest_events_total += 1
        base = next((v for v in self._vortices if v["vortex_id"] == vortex_id), self._vortices[0])
        harvested_gw = round(base["nominal_baseload_gw"] * vortex_multiplier * kh_efficiency * 2.8, 3)
        return {
            "vortex_id": base["vortex_id"],
            "status": "MAGNETOPAUSE_POWER_DISPATCHED",
            "harvested_power_gw": harvested_gw,
            "vortex_flux_mw": round(harvested_gw * 1000.0, 2),
            "standoff_distance_re": base["standoff_distance_re"],
            "shear_velocity_kms": base["shear_velocity_kms"],
            "kh_coupling_efficiency_pct": round(kh_efficiency * 100.0, 2),
            "grid_stability_pct": 99.999,
            "dispatch_duration_s": dispatch_duration_s,
            "kh_coupling_state": "MAGNETOPAUSE_KH_LOCKED",
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }

    def get_metrics(self) -> Dict[str, Any]:
        total_gw = round(sum(v["nominal_baseload_gw"] for v in self._vortices), 3)
        mean_eff = round(sum(v["kh_coupling_efficiency_pct"] for v in self._vortices) / len(self._vortices), 2)
        return {
            "active_vortices_count": len(self._vortices),
            "harvest_events_total": self._harvest_events_total,
            "total_baseload_dispatch_gw": total_gw,
            "mean_kh_coupling_efficiency_pct": mean_eff,
            "kh_coupling_status": "MAGNETOPAUSE_KH_LOCKED",
        }


_service = PlanetaryMagnetopauseKelvinHelmholtzVortexSupergridService()


def get_planetary_magnetopause_kelvin_helmholtz_vortex_supergrid_service() -> PlanetaryMagnetopauseKelvinHelmholtzVortexSupergridService:
    return _service
