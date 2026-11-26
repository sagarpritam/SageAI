"""Wave 72 Standalone Drill: Maulik-Okounkov, Bridgeland, Getzler-Kapranov & Magnetotail Supergrid."""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient

from app.main import app


def main() -> None:
    client = TestClient(app)

    # 1. Capability 236: Maulik-Okounkov Quantum Cohomology & R-Matrix Shield
    r1 = client.post(
        "/api/maulik-okounkov-qc/evaluate-quantum-cohomology",
        json={
            "cohomology_id": "MAULIK-OKOUNKOV-QC-01",
            "torus_rank": 4,
            "quantum_degree": 3,
            "shield_gain": 1.25,
        },
    )
    assert r1.status_code == 200, r1.text
    d1 = r1.json()
    assert d1["status"] == "MO_QUANTUM_COHOMOLOGY_LOCKED"
    print(f"[1/4] Cap 236 Maulik-Okounkov QC Shield: {d1['status']} | Shield={d1['maulik_shield_strength_pev']:.1f} PeV")

    # 2. Capability 237: Bridgeland Stability Conditions & Wall-Crossing Barrier
    r2 = client.post(
        "/api/bridgeland-stability/evaluate-bridgeland-stability",
        json={
            "manifold_id": "BRIDGELAND-STAB-K3-01",
            "heart_shift": 1,
            "filtration_length": 3,
            "barrier_gain": 1.25,
        },
    )
    assert r2.status_code == 200, r2.text
    d2 = r2.json()
    assert d2["status"] == "BRIDGELAND_STABILITY_LOCKED"
    print(f"[2/4] Cap 237 Bridgeland Stability Barrier: {d2['status']} | Barrier={d2['bridgeland_barrier_strength_pev']:.1f} PeV")

    # 3. Capability 238: Getzler-Kapranov Modular Operad & BV Homotopy Firewall
    r3 = client.post(
        "/api/getzler-kapranov-operad/evaluate-operad-bv",
        json={
            "operad_id": "GETZLER-KAPRANOV-MODULAR-01",
            "genus_order": 2,
            "arity_n": 4,
            "firewall_gain": 1.25,
        },
    )
    assert r3.status_code == 200, r3.text
    d3 = r3.json()
    assert d3["status"] == "GETZLER_KAPRANOV_BV_LOCKED"
    print(f"[3/4] Cap 238 Getzler-Kapranov BV Firewall: {d3['status']} | Firewall={d3['operad_firewall_strength_pev']:.1f} PeV")

    # 4. Option B Wave 72: Planetary Magnetotail Reconnection & Plasmoid Supergrid
    r4 = client.post(
        "/api/planetary-magnetotail/harvest-magnetotail-power",
        json={
            "lobe_id": "MAGNETOTAIL-XLINE-01",
            "plasmoid_multiplier": 1.05,
            "reconnection_efficiency": 0.992,
            "dispatch_duration_s": 60.0,
        },
    )
    assert r4.status_code == 200, r4.text
    d4 = r4.json()
    assert d4["status"] == "MAGNETOTAIL_POWER_DISPATCHED"
    print(
        f"[4/4] Opt B W72 Magnetotail Plasmoid Supergrid: {d4['status']} | Dispatch={d4['harvested_power_gw']:.3f} GW | Stability={d4['grid_stability_pct']:.3f}%"
    )
    print("WAVE 72 DRILL 4/4 VERIFIED.")


if __name__ == "__main__":
    main()
