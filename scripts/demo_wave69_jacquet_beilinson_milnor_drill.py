import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app


def main():
    client = TestClient(app)
    print("=== Wave 69 Jacquet-Beilinson-Milnor & Planetary Exospheric Geocorona Drill ===")

    r1 = client.post(
        "/api/jacquet-langlands-quaternion/evaluate-quaternion-transfer",
        json={"correspondence_id": "JACQUET-LANGLANDS-GL2-01", "quaternion_discriminant": 6, "level_n": 11, "shield_gain": 1.25},
    )
    assert r1.status_code == 200 and r1.json()["status"] == "JACQUET_LANGLANDS_LOCKED"
    print(f"[1/4] Jacquet-Langlands Quaternion Shield: {r1.json()['status']} ({r1.json()['quaternion_suppression_db']} dB)")

    r2 = client.post(
        "/api/beilinson-deligne-regulator/evaluate-beilinson-regulator",
        json={"regulator_id": "BEILINSON-REGULATOR-K2-01", "motivic_weight": 2, "chow_codimension": 2, "barrier_gain": 1.25},
    )
    assert r2.status_code == 200 and r2.json()["status"] == "BEILINSON_REGULATOR_LOCKED"
    print(f"[2/4] Beilinson Regulator Barrier: {r2.json()['status']} ({r2.json()['regulator_suppression_db']} dB)")

    r3 = client.post(
        "/api/milnor-norm-residue/evaluate-milnor-symbol",
        json={"symbol_id": "MILNOR-K2-SYMBOL-01", "k_degree_n": 2, "torsion_m": 5, "firewall_gain": 1.25},
    )
    assert r3.status_code == 200 and r3.json()["status"] == "MILNOR_K_THEORY_LOCKED"
    print(f"[3/4] Milnor K-Theory Firewall: {r3.json()['status']} ({r3.json()['steinberg_suppression_db']} dB)")

    r4 = client.post(
        "/api/planetary-exospheric-geocorona/harvest-exospheric-power",
        json={"shell_id": "EXOSPHERE-GEOCORONA-LYMAN-01", "reconnection_multiplier": 1.05, "reconnection_efficiency": 0.989, "dispatch_duration_s": 60.0},
    )
    assert r4.status_code == 200 and r4.json()["status"] == "EXOSPHERIC_POWER_DISPATCHED"
    print(f"[4/4] Planetary Exospheric Geocorona Supergrid: {r4.json()['status']} ({r4.json()['harvested_power_gw']} GW)")

    print("Wave 69 drill PASSED (4/4).")


if __name__ == "__main__":
    main()
