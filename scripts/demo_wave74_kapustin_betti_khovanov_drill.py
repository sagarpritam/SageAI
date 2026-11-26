"""Wave 74 Standalone Drill: Kapustin-Witten S-Duality, Ben-Zvi-Nadler Betti, Khovanov-Bar-Natan & Polar Cusp Supergrid."""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient

from app.main import app


def main() -> None:
    client = TestClient(app)

    # 1. Capability 242: Kapustin-Witten Geometric Langlands & S-Duality Shield
    r1 = client.post(
        "/api/kapustin-witten-sduality/evaluate-s-duality",
        json={
            "braneline_id": "KAPUSTIN-WITTEN-SDUAL-01",
            "hecke_rank": 3,
            "twist_t": 1.0,
            "shield_gain": 1.25,
        },
    )
    assert r1.status_code == 200, r1.text
    d1 = r1.json()
    assert d1["status"] == "KAPUSTIN_WITTEN_SDUAL_LOCKED"
    print(f"[1/4] Cap 242 Kapustin-Witten S-Duality Shield: {d1['status']} | Shield={d1['kw_shield_strength_pev']:.1f} PeV")

    # 2. Capability 243: Ben-Zvi-Nadler Spectral Langlands & Betti Stack Barrier
    r2 = client.post(
        "/api/ben-zvi-nadler-betti/evaluate-betti-langlands",
        json={
            "stack_id": "BENZVI-NADLER-BETTI-01",
            "nilpotent_rank": 3,
            "support_order": 2,
            "barrier_gain": 1.25,
        },
    )
    assert r2.status_code == 200, r2.text
    d2 = r2.json()
    assert d2["status"] == "BEN_ZVI_NADLER_BETTI_LOCKED"
    print(f"[2/4] Cap 243 Ben-Zvi-Nadler Betti Barrier: {d2['status']} | Barrier={d2['bzn_barrier_strength_pev']:.1f} PeV")

    # 3. Capability 244: Khovanov-Bar-Natan Categorified Knot Homology & Tangle Firewall
    r3 = client.post(
        "/api/khovanov-barnatan-tangle/evaluate-khovanov-tangle",
        json={
            "tangle_id": "KHOVANOV-BARNATAN-COB-01",
            "crossing_count": 7,
            "quantum_grading_j": 3,
            "firewall_gain": 1.25,
        },
    )
    assert r3.status_code == 200, r3.text
    d3 = r3.json()
    assert d3["status"] == "KHOVANOV_BARNATAN_LOCKED"
    print(f"[3/4] Cap 244 Khovanov-Bar-Natan Tangle Firewall: {d3['status']} | Firewall={d3['kb_firewall_strength_pev']:.1f} PeV")

    # 4. Option B Wave 74: Planetary Polar Cusp & Magnetosheath Solar-Wind Funnel Supergrid
    r4 = client.post(
        "/api/planetary-polar-cusp/harvest-polar-cusp-power",
        json={
            "funnel_id": "POLAR-CUSP-NORTH-01",
            "cusp_multiplier": 1.05,
            "funnel_efficiency": 0.994,
            "dispatch_duration_s": 60.0,
        },
    )
    assert r4.status_code == 200, r4.text
    d4 = r4.json()
    assert d4["status"] == "POLAR_CUSP_POWER_DISPATCHED"
    print(
        f"[4/4] Opt B W74 Polar Cusp Funnel Supergrid: {d4['status']} | Dispatch={d4['harvested_power_gw']:.3f} GW | Stability={d4['grid_stability_pct']:.3f}%"
    )
    print("WAVE 74 DRILL 4/4 VERIFIED.")


if __name__ == "__main__":
    main()
