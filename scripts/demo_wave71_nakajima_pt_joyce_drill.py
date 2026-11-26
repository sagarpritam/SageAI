"""Wave 71 Standalone Drill: Nakajima Quiver, Pandharipande-Thomas, Joyce-Song & Ring-Current Supergrid."""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient

from app.main import app


def main() -> None:
    client = TestClient(app)

    # 1. Capability 233: Nakajima Quiver Variety & Quantum Loop Yangian Shield
    r1 = client.post(
        "/api/nakajima-quiver-yangian/evaluate-quiver-yangian",
        json={
            "quiver_id": "NAKAJIMA-QUIVER-ADE-01",
            "framing_rank": 2,
            "equivariant_weight": 3,
            "shield_gain": 1.25,
        },
    )
    assert r1.status_code == 200, r1.text
    d1 = r1.json()
    assert d1["status"] == "NAKAJIMA_QUIVER_LOCKED"
    print(f"[1/4] Cap 233 Nakajima Quiver Yangian Shield: {d1['status']} | Shield={d1['nakajima_shield_strength_pev']:.1f} PeV")

    # 2. Capability 234: Pandharipande-Thomas & Gopakumar-Vafa BPS Barrier
    r2 = client.post(
        "/api/pandharipande-thomas-bps/evaluate-pt-bps",
        json={
            "pair_id": "PT-STABLE-PAIR-CY3-01",
            "euler_char": 1,
            "curve_degree": 2,
            "barrier_gain": 1.25,
        },
    )
    assert r2.status_code == 200, r2.text
    d2 = r2.json()
    assert d2["status"] == "PT_BPS_LOCKED"
    print(f"[2/4] Cap 234 Pandharipande-Thomas BPS Barrier: {d2['status']} | Barrier={d2['pt_barrier_strength_pev']:.1f} PeV")

    # 3. Capability 235: Joyce-Song Generalized DT & Hall Algebra Firewall
    r3 = client.post(
        "/api/joyce-song-hall/evaluate-joyce-song",
        json={
            "invariant_id": "JOYCE-SONG-HALL-ALGEBRA-01",
            "chern_rank": 2,
            "behrend_weight": 1,
            "firewall_gain": 1.25,
        },
    )
    assert r3.status_code == 200, r3.text
    d3 = r3.json()
    assert d3["status"] == "JOYCE_SONG_HALL_LOCKED"
    print(f"[3/4] Cap 235 Joyce-Song Motivic DT Firewall: {d3['status']} | Firewall={d3['joyce_firewall_strength_pev']:.1f} PeV")

    # 4. Option B Wave 71: Planetary Ring-Current & Plasmasphere Alfvén Maser Supergrid
    r4 = client.post(
        "/api/planetary-ring-current/harvest-ring-current-power",
        json={
            "torus_id": "RING-CURRENT-TORUS-01",
            "alfven_multiplier": 1.05,
            "alfven_efficiency": 0.991,
            "dispatch_duration_s": 60.0,
        },
    )
    assert r4.status_code == 200, r4.text
    d4 = r4.json()
    assert d4["status"] == "RING_CURRENT_POWER_DISPATCHED"
    print(
        f"[4/4] Opt B W71 Ring-Current Alfvén Supergrid: {d4['status']} | Dispatch={d4['harvested_power_gw']:.3f} GW | Stability={d4['grid_stability_pct']:.2f}%"
    )
    print("WAVE 71 DRILL 4/4 VERIFIED.")


if __name__ == "__main__":
    main()
