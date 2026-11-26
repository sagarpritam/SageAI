import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app


def main():
    client = TestClient(app)
    print("=== Wave 70 Kollar-Perelman-Kontsevich & Planetary Van Allen Belt Drill ===")

    r1 = client.post(
        "/api/kollar-birkar-mmp/evaluate-mmp-threshold",
        json={"model_id": "KOLLAR-LOG-CANONICAL-01", "variety_dimension": 3, "epsilon_lc": 0.05, "shield_gain": 1.25},
    )
    assert r1.status_code == 200 and r1.json()["status"] == "KOLLAR_BIRKAR_MMP_LOCKED"
    print(f"[1/4] Kollar-Birkar MMP Shield: {r1.json()['status']} ({r1.json()['mmp_suppression_db']} dB)")

    r2 = client.post(
        "/api/perelman-w-entropy/evaluate-w-entropy",
        json={"flow_id": "PERELMAN-W-ENTROPY-01", "tau_scale": 1.5, "kappa_noncollapse": 0.95, "barrier_gain": 1.25},
    )
    assert r2.status_code == 200 and r2.json()["status"] == "PERELMAN_W_ENTROPY_LOCKED"
    print(f"[2/4] Perelman W-Entropy Barrier: {r2.json()['status']} ({r2.json()['w_entropy_suppression_db']} dB)")

    r3 = client.post(
        "/api/kontsevich-wall-crossing/evaluate-wall-crossing",
        json={"chamber_id": "KONTSEVICH-SOIBELMAN-01", "bps_charge_rank": 2, "dt_invariant_order": 4, "firewall_gain": 1.25},
    )
    assert r3.status_code == 200 and r3.json()["status"] == "KONTSEVICH_WALL_LOCKED"
    print(f"[3/4] Kontsevich Wall-Crossing Firewall: {r3.json()['status']} ({r3.json()['wall_crossing_suppression_db']} dB)")

    r4 = client.post(
        "/api/planetary-van-allen-belt/harvest-betatron-power",
        json={"belt_id": "VAN-ALLEN-INNER-PROTON-01", "cyclotron_multiplier": 1.05, "betatron_efficiency": 0.99, "dispatch_duration_s": 60.0},
    )
    assert r4.status_code == 200 and r4.json()["status"] == "BETATRON_POWER_DISPATCHED"
    print(f"[4/4] Planetary Van Allen Belt Supergrid: {r4.json()['status']} ({r4.json()['harvested_power_gw']} GW)")

    print("Wave 70 drill PASSED (4/4).")


if __name__ == "__main__":
    main()
