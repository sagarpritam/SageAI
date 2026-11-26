import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app


def main():
    client = TestClient(app)
    print("=== Wave 65 Ihara-Shimura-Stark & Planetary Oceanic Thermohaline Drill ===")

    r1 = client.post(
        "/api/ihara-galois-braid/evaluate-profinite-braid",
        json={"braid_id": "IHARA-P1-MINUS3-01", "puncture_count": 3, "profinite_depth": 4, "shield_gain": 1.25},
    )
    assert r1.status_code == 200 and r1.json()["status"] == "IHARA_GALOIS_BRAID_LOCKED"
    print(f"[1/4] Ihara Galois Braid Shield: {r1.json()['status']} ({r1.json()['braid_monodromy_suppression_db']} dB)")

    r2 = client.post(
        "/api/shimura-taniyama-modular/evaluate-modular-parametrization",
        json={"curve_id": "SHIMURA-X0-11-ELLIPTIC-01", "level_n": 11, "q_truncation_order": 8, "barrier_gain": 1.25},
    )
    assert r2.status_code == 200 and r2.json()["status"] == "SHIMURA_TANIYAMA_MODULAR_LOCKED"
    print(f"[2/4] Shimura-Taniyama Modular Barrier: {r2.json()['status']} ({r2.json()['eigenform_suppression_db']} dB)")

    r3 = client.post(
        "/api/stark-regulator-values/evaluate-stark-regulator",
        json={"regulator_id": "STARK-RANK1-ABELIAN-01", "vanishing_order_r": 1, "class_number_h": 1, "firewall_gain": 1.25},
    )
    assert r3.status_code == 200 and r3.json()["status"] == "STARK_REGULATOR_LOCKED"
    print(f"[3/4] Stark Regulator Firewall: {r3.json()['status']} ({r3.json()['ray_class_suppression_db']} dB)")

    r4 = client.post(
        "/api/planetary-oceanic-thermohaline/harvest-thermohaline-power",
        json={"current_id": "AMOC-NORTH-ATLANTIC-DEEPWATER-01", "coriolis_multiplier": 1.05, "lorentz_efficiency": 0.984, "dispatch_duration_s": 60.0},
    )
    assert r4.status_code == 200 and r4.json()["status"] == "THERMOHALINE_POWER_DISPATCHED"
    print(f"[4/4] Planetary Oceanic Thermohaline Supergrid: {r4.json()['status']} ({r4.json()['harvested_power_gw']} GW)")

    print("Wave 65 drill PASSED (4/4).")


if __name__ == "__main__":
    main()
