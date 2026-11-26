"""Wave 77 Standalone Drill: Kac-Moody Affine, Frenkel-Ben-Zvi VOA, Borcherds Moonshine & Plasmapause Supergrid."""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient

from app.main import app


def main() -> None:
    client = TestClient(app)

    # 1. Capability 251: Kac-Moody Affine Lie Algebra & Weyl-Kac Character Shield
    r1 = client.post(
        "/api/kac-moody-affine/evaluate-kac-moody",
        json={
            "algebra_id": "KAC-MOODY-AFFINE-01",
            "central_level_k": 2,
            "imaginary_root_mult": 4,
            "shield_gain": 1.25,
        },
    )
    assert r1.status_code == 200, r1.text
    d1 = r1.json()
    assert d1["status"] == "KAC_MOODY_AFFINE_LOCKED"
    print(f"[1/4] Cap 251 Kac-Moody Affine Shield: {d1['status']} | Shield={d1['km_shield_strength_pev']:.1f} PeV")

    # 2. Capability 252: Frenkel-Ben-Zvi Vertex Operator Algebra & Chiral Homology Barrier
    r2 = client.post(
        "/api/frenkel-voa-chiral/evaluate-voa-chiral",
        json={
            "voa_id": "FRENKEL-VOA-CHIRAL-01",
            "central_charge_c": 24,
            "zhu_rank": 4,
            "barrier_gain": 1.25,
        },
    )
    assert r2.status_code == 200, r2.text
    d2 = r2.json()
    assert d2["status"] == "FRENKEL_VOA_CHIRAL_LOCKED"
    print(f"[2/4] Cap 252 Frenkel-Ben-Zvi VOA Barrier: {d2['status']} | Barrier={d2['fbz_barrier_strength_pev']:.1f} PeV")

    # 3. Capability 253: Borcherds Monster Lie Algebra & Monstrous Moonshine Firewall
    r3 = client.post(
        "/api/borcherds-moonshine/evaluate-borcherds-moonshine",
        json={
            "moonshine_id": "BORCHERDS-MONSTER-VOA-01",
            "denominator_rank": 2,
            "hauptmodul_order": 1,
            "firewall_gain": 1.25,
        },
    )
    assert r3.status_code == 200, r3.text
    d3 = r3.json()
    assert d3["status"] == "BORCHERDS_MOONSHINE_LOCKED"
    print(f"[3/4] Cap 253 Borcherds Moonshine Firewall: {d3['status']} | Firewall={d3['borcherds_firewall_strength_pev']:.1f} PeV")

    # 4. Option B Wave 77: Planetary Magnetospheric Plasmapause & Whistler-Mode Chorus Supergrid
    r4 = client.post(
        "/api/planetary-plasmapause/harvest-plasmapause-power",
        json={
            "waveguide_id": "PLASMAPAUSE-CHORUS-01",
            "whistler_multiplier": 1.05,
            "waveguide_efficiency": 0.996,
            "dispatch_duration_s": 60.0,
        },
    )
    assert r4.status_code == 200, r4.text
    d4 = r4.json()
    assert d4["status"] == "PLASMAPAUSE_POWER_DISPATCHED"
    print(
        f"[4/4] Opt B W77 Plasmapause Whistler Supergrid: {d4['status']} | Dispatch={d4['harvested_power_gw']:.3f} GW | Stability={d4['grid_stability_pct']:.3f}%"
    )
    print("WAVE 77 DRILL 4/4 VERIFIED.")


if __name__ == "__main__":
    main()
