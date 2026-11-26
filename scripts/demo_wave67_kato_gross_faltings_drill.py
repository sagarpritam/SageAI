import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app


def main():
    client = TestClient(app)
    print("=== Wave 67 Kato-Gross-Faltings & Planetary Mesospheric Plasma Drill ===")

    r1 = client.post(
        "/api/kato-euler-system/evaluate-euler-system",
        json={"system_id": "KATO-EULER-ZETA-01", "prime_p": 5, "weight_k": 2, "shield_gain": 1.25},
    )
    assert r1.status_code == 200 and r1.json()["status"] == "KATO_EULER_SYSTEM_LOCKED"
    print(f"[1/4] Kato Euler System Shield: {r1.json()['status']} ({r1.json()['euler_system_suppression_db']} dB)")

    r2 = client.post(
        "/api/gross-zagier-heegner/evaluate-height-pairing",
        json={"pairing_id": "GROSS-ZAGIER-HEEGNER-01", "conductor_n": 37, "analytic_rank": 1, "barrier_gain": 1.25},
    )
    assert r2.status_code == 200 and r2.json()["status"] == "GROSS_ZAGIER_HEIGHT_LOCKED"
    print(f"[2/4] Gross-Zagier Height Barrier: {r2.json()['status']} ({r2.json()['heegner_height_suppression_db']} dB)")

    r3 = client.post(
        "/api/faltings-mordell-finiteness/evaluate-mordell-finiteness",
        json={"curve_id": "FALTINGS-MORDELL-GENUS2-01", "genus_g": 2, "bad_primes_count": 3, "firewall_gain": 1.25},
    )
    assert r3.status_code == 200 and r3.json()["status"] == "FALTINGS_MORDELL_LOCKED"
    print(f"[3/4] Faltings Mordell Firewall: {r3.json()['status']} ({r3.json()['mordell_finiteness_suppression_db']} dB)")

    r4 = client.post(
        "/api/planetary-mesospheric-plasma/harvest-mesospheric-power",
        json={"layer_id": "MESOPAUSE-NOCTILUCENT-01", "electrojet_multiplier": 1.05, "plasma_efficiency": 0.987, "dispatch_duration_s": 60.0},
    )
    assert r4.status_code == 200 and r4.json()["status"] == "MESOSPHERIC_POWER_DISPATCHED"
    print(f"[4/4] Planetary Mesospheric Plasma Supergrid: {r4.json()['status']} ({r4.json()['harvested_power_gw']} GW)")

    print("Wave 67 drill PASSED (4/4).")


if __name__ == "__main__":
    main()
