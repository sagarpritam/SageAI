import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app


def main():
    client = TestClient(app)
    print("=== Wave 66 Mazur-Ribet-Iwasawa & Planetary Stratospheric Jet-Stream Drill ===")

    r1 = client.post(
        "/api/mazur-eisenstein-torsion/evaluate-eisenstein-torsion",
        json={"curve_id": "MAZUR-EISENSTEIN-X0-11-01", "prime_n": 11, "torsion_order": 5, "shield_gain": 1.25},
    )
    assert r1.status_code == 200 and r1.json()["status"] == "MAZUR_EISENSTEIN_TORSION_LOCKED"
    print(f"[1/4] Mazur Eisenstein Torsion Shield: {r1.json()['status']} ({r1.json()['eisenstein_torsion_suppression_db']} dB)")

    r2 = client.post(
        "/api/ribet-level-lowering/evaluate-level-lowering",
        json={"form_id": "RIBET-LEVEL-LOWER-P5-01", "residual_prime_p": 5, "serre_weight_k": 2, "barrier_gain": 1.25},
    )
    assert r2.status_code == 200 and r2.json()["status"] == "RIBET_LEVEL_LOWERING_LOCKED"
    print(f"[2/4] Ribet Level-Lowering Barrier: {r2.json()['status']} ({r2.json()['level_lowering_suppression_db']} dB)")

    r3 = client.post(
        "/api/iwasawa-main-conjecture/evaluate-iwasawa-ideal",
        json={"extension_id": "IWASAWA-ZP-CYCLOTOMIC-01", "prime_p": 5, "lambda_invariant": 1, "firewall_gain": 1.25},
    )
    assert r3.status_code == 200 and r3.json()["status"] == "IWASAWA_MAIN_CONJECTURE_LOCKED"
    print(f"[3/4] Iwasawa Main Conjecture Firewall: {r3.json()['status']} ({r3.json()['cyclotomic_suppression_db']} dB)")

    r4 = client.post(
        "/api/planetary-stratospheric-jetstream/harvest-jetstream-power",
        json={"stream_id": "POLAR-FRONT-JETSTREAM-01", "rossby_multiplier": 1.05, "triboelectric_efficiency": 0.986, "dispatch_duration_s": 60.0},
    )
    assert r4.status_code == 200 and r4.json()["status"] == "JETSTREAM_POWER_DISPATCHED"
    print(f"[4/4] Planetary Stratospheric Jetstream Supergrid: {r4.json()['status']} ({r4.json()['harvested_power_gw']} GW)")

    print("Wave 66 drill PASSED (4/4).")


if __name__ == "__main__":
    main()
