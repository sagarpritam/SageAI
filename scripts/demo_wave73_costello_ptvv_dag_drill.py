"""Wave 73 Standalone Drill: Costello BV, PTVV Shifted Symplectic, Gaitsgory-Rozenblyum & Magnetopause Supergrid."""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient

from app.main import app


def main() -> None:
    client = TestClient(app)

    # 1. Capability 239: Kevin Costello Factorization Algebra & BV Renormalization Shield
    r1 = client.post(
        "/api/costello-bv-renorm/evaluate-bv-renorm",
        json={
            "theory_id": "COSTELLO-BV-RENORM-01",
            "loop_order": 2,
            "scale_cutoff": 0.01,
            "shield_gain": 1.25,
        },
    )
    assert r1.status_code == 200, r1.text
    d1 = r1.json()
    assert d1["status"] == "COSTELLO_BV_RENORM_LOCKED"
    print(f"[1/4] Cap 239 Costello BV Renorm Shield: {d1['status']} | Shield={d1['costello_shield_strength_pev']:.1f} PeV")

    # 2. Capability 240: PTVV Shifted Symplectic & Derived Stack Barrier
    r2 = client.post(
        "/api/ptvv-shifted-symplectic/evaluate-shifted-symplectic",
        json={
            "stack_id": "PTVV-SHIFTED-SYMPLECTIC-01",
            "symplectic_shift_n": -1,
            "lagrangian_rank": 3,
            "barrier_gain": 1.25,
        },
    )
    assert r2.status_code == 200, r2.text
    d2 = r2.json()
    assert d2["status"] == "PTVV_SHIFTED_SYMPLECTIC_LOCKED"
    print(f"[2/4] Cap 240 PTVV Shifted Symplectic Barrier: {d2['status']} | Barrier={d2['ptvv_barrier_strength_pev']:.1f} PeV")

    # 3. Capability 241: Gaitsgory-Rozenblyum Ind-Coherent Sheaves & DAG Crystal Firewall
    r3 = client.post(
        "/api/gaitsgory-rozenblyum-dag/evaluate-indcoherent-crystal",
        json={
            "crystal_id": "GAITSGORY-ROZENBLYUM-INDCOH-01",
            "serre_order": 3,
            "algebroid_rank": 4,
            "firewall_gain": 1.25,
        },
    )
    assert r3.status_code == 200, r3.text
    d3 = r3.json()
    assert d3["status"] == "GAITSGORY_ROZENBLYUM_DAG_LOCKED"
    print(f"[3/4] Cap 241 Gaitsgory-Rozenblyum DAG Firewall: {d3['status']} | Firewall={d3['gr_firewall_strength_pev']:.1f} PeV")

    # 4. Option B Wave 73: Planetary Magnetopause Kelvin-Helmholtz Vortex Supergrid
    r4 = client.post(
        "/api/planetary-magnetopause/harvest-magnetopause-power",
        json={
            "vortex_id": "MAGNETOPAUSE-KH-DAWN-01",
            "vortex_multiplier": 1.05,
            "kh_efficiency": 0.993,
            "dispatch_duration_s": 60.0,
        },
    )
    assert r4.status_code == 200, r4.text
    d4 = r4.json()
    assert d4["status"] == "MAGNETOPAUSE_POWER_DISPATCHED"
    print(
        f"[4/4] Opt B W73 Magnetopause KH Supergrid: {d4['status']} | Dispatch={d4['harvested_power_gw']:.3f} GW | Stability={d4['grid_stability_pct']:.3f}%"
    )
    print("WAVE 73 DRILL 4/4 VERIFIED.")


if __name__ == "__main__":
    main()
