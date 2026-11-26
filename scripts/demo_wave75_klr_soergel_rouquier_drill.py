"""Wave 75 Standalone Drill: Webster KLR, Elias-Williamson Soergel, Chuang-Rouquier sl2 & Auroral AKR Supergrid."""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient

from app.main import app


def main() -> None:
    client = TestClient(app)

    # 1. Capability 245: Webster KLR Categorification & Tensor Product Shield
    r1 = client.post(
        "/api/webster-klr-cat/evaluate-klr-tensor",
        json={
            "algebra_id": "WEBSTER-KLR-TENSOR-01",
            "highest_weight_rank": 3,
            "strand_count": 6,
            "shield_gain": 1.25,
        },
    )
    assert r1.status_code == 200, r1.text
    d1 = r1.json()
    assert d1["status"] == "WEBSTER_KLR_LOCKED"
    print(f"[1/4] Cap 245 Webster KLR Shield: {d1['status']} | Shield={d1['klr_shield_strength_pev']:.1f} PeV")

    # 2. Capability 246: Elias-Williamson Soergel Bimodules & Kazhdan-Lusztig Positivity Barrier
    r2 = client.post(
        "/api/elias-williamson-soergel/evaluate-soergel-hodge",
        json={
            "bimodule_id": "ELIAS-WILLIAMSON-SOERGEL-01",
            "hodge_rank": 3,
            "bott_samelson_length": 5,
            "barrier_gain": 1.25,
        },
    )
    assert r2.status_code == 200, r2.text
    d2 = r2.json()
    assert d2["status"] == "ELIAS_WILLIAMSON_SOERGEL_LOCKED"
    print(f"[2/4] Cap 246 Elias-Williamson Soergel Barrier: {d2['status']} | Barrier={d2['soergel_barrier_strength_pev']:.1f} PeV")

    # 3. Capability 247: Chuang-Rouquier Derived Equivalences & sl_2 Categorification Firewall
    r3 = client.post(
        "/api/chuang-rouquier-sl2/evaluate-rickard-complex",
        json={
            "complex_id": "CHUANG-ROUQUIER-SL2-01",
            "rickard_terms": 4,
            "perverse_shift_p": 2,
            "firewall_gain": 1.25,
        },
    )
    assert r3.status_code == 200, r3.text
    d3 = r3.json()
    assert d3["status"] == "CHUANG_ROUQUIER_SL2_LOCKED"
    print(f"[3/4] Cap 247 Chuang-Rouquier sl2 Firewall: {d3['status']} | Firewall={d3['cr_firewall_strength_pev']:.1f} PeV")

    # 4. Option B Wave 75: Planetary Auroral Kilometric Radiation Maser Supergrid
    r4 = client.post(
        "/api/planetary-akr-maser/harvest-akr-power",
        json={
            "cavity_id": "AKR-CAVITY-BOREAL-01",
            "maser_multiplier": 1.05,
            "maser_efficiency": 0.995,
            "dispatch_duration_s": 60.0,
        },
    )
    assert r4.status_code == 200, r4.text
    d4 = r4.json()
    assert d4["status"] == "AKR_MASER_POWER_DISPATCHED"
    print(
        f"[4/4] Opt B W75 Auroral AKR Maser Supergrid: {d4['status']} | Dispatch={d4['harvested_power_gw']:.3f} GW | Stability={d4['grid_stability_pct']:.3f}%"
    )
    print("WAVE 75 DRILL 4/4 VERIFIED.")


if __name__ == "__main__":
    main()
