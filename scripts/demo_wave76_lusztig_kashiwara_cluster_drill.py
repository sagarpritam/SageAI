"""Wave 76 Standalone Drill: Lusztig Canonical Basis, Kashiwara Crystal, Fomin-Zelevinsky Cluster & Electrojet Supergrid."""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient

from app.main import app


def main() -> None:
    client = TestClient(app)

    # 1. Capability 248: Lusztig Canonical Basis & Quantum Group Crystal Shield
    r1 = client.post(
        "/api/lusztig-canonical-basis/evaluate-canonical-basis",
        json={
            "basis_id": "LUSZTIG-CANONICAL-UQG-01",
            "crystal_rank": 4,
            "bar_order": 2,
            "shield_gain": 1.25,
        },
    )
    assert r1.status_code == 200, r1.text
    d1 = r1.json()
    assert d1["status"] == "LUSZTIG_CANONICAL_LOCKED"
    print(f"[1/4] Cap 248 Lusztig Canonical Shield: {d1['status']} | Shield={d1['lusztig_shield_strength_pev']:.1f} PeV")

    # 2. Capability 249: Kashiwara Crystal Graph & Global Basis Barrier
    r2 = client.post(
        "/api/kashiwara-crystal-graph/evaluate-crystal-graph",
        json={
            "crystal_id": "KASHIWARA-CRYSTAL-B-01",
            "operator_rank": 6,
            "string_cone_dim": 4,
            "barrier_gain": 1.25,
        },
    )
    assert r2.status_code == 200, r2.text
    d2 = r2.json()
    assert d2["status"] == "KASHIWARA_CRYSTAL_LOCKED"
    print(f"[2/4] Cap 249 Kashiwara Crystal Barrier: {d2['status']} | Barrier={d2['kashiwara_barrier_strength_pev']:.1f} PeV")

    # 3. Capability 250: Fomin-Zelevinsky Cluster Algebra & Laurent Phenomenon Firewall
    r3 = client.post(
        "/api/fomin-zelevinsky-cluster/evaluate-cluster-mutation",
        json={
            "cluster_id": "FOMIN-ZELEVINSKY-CLUSTER-01",
            "seed_rank": 5,
            "mutation_depth": 4,
            "firewall_gain": 1.25,
        },
    )
    assert r3.status_code == 200, r3.text
    d3 = r3.json()
    assert d3["status"] == "FOMIN_ZELEVINSKY_CLUSTER_LOCKED"
    print(f"[3/4] Cap 250 Fomin-Zelevinsky Cluster Firewall: {d3['status']} | Firewall={d3['fz_firewall_strength_pev']:.1f} PeV")

    # 4. Option B Wave 76: Planetary Geomagnetic Substorm & Auroral Electrojet Supergrid
    r4 = client.post(
        "/api/planetary-electrojet/harvest-electrojet-power",
        json={
            "electrojet_id": "ELECTROJET-WESTWARD-01",
            "substorm_multiplier": 1.05,
            "induction_efficiency": 0.996,
            "dispatch_duration_s": 60.0,
        },
    )
    assert r4.status_code == 200, r4.text
    d4 = r4.json()
    assert d4["status"] == "ELECTROJET_POWER_DISPATCHED"
    print(
        f"[4/4] Opt B W76 Auroral Electrojet Supergrid: {d4['status']} | Dispatch={d4['harvested_power_gw']:.3f} GW | Stability={d4['grid_stability_pct']:.3f}%"
    )
    print("WAVE 76 DRILL 4/4 VERIFIED.")


if __name__ == "__main__":
    main()
