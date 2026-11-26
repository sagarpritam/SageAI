import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app


def main():
    client = TestClient(app)
    print("=== Wave 68 Szpiro-Andre-Arthur & Planetary Thermospheric Dynamo Drill ===")

    r1 = client.post(
        "/api/szpiro-abc-height/evaluate-abc-radical",
        json={"bound_id": "SZPIRO-DISCRIMINANT-01", "conductor_n": 11, "szpiro_exponent": 6.0, "shield_gain": 1.25},
    )
    assert r1.status_code == 200 and r1.json()["status"] == "SZPIRO_ABC_LOCKED"
    print(f"[1/4] Szpiro ABC Height Shield: {r1.json()['status']} ({r1.json()['abc_radical_suppression_db']} dB)")

    r2 = client.post(
        "/api/andre-oort-shimura/evaluate-special-points",
        json={"variety_id": "ANDRE-OORT-CM-POINTS-01", "shimura_dimension": 2, "cm_discriminant": 19, "barrier_gain": 1.25},
    )
    assert r2.status_code == 200 and r2.json()["status"] == "ANDRE_OORT_LOCKED"
    print(f"[2/4] Andre-Oort Shimura Barrier: {r2.json()['status']} ({r2.json()['special_points_suppression_db']} dB)")

    r3 = client.post(
        "/api/langlands-arthur-trace/evaluate-arthur-trace",
        json={"endoscopy_id": "ARTHUR-ENDOSCOPY-SL2-01", "group_rank": 2, "packet_dimension": 4, "firewall_gain": 1.25},
    )
    assert r3.status_code == 200 and r3.json()["status"] == "ARTHUR_ENDOSCOPY_LOCKED"
    print(f"[3/4] Arthur Endoscopy Firewall: {r3.json()['status']} ({r3.json()['endoscopy_suppression_db']} dB)")

    r4 = client.post(
        "/api/planetary-thermospheric-dynamo/harvest-thermospheric-power",
        json={"zone_id": "THERMOSPHERE-JOULE-RING-01", "dynamo_multiplier": 1.05, "dynamo_efficiency": 0.988, "dispatch_duration_s": 60.0},
    )
    assert r4.status_code == 200 and r4.json()["status"] == "THERMOSPHERIC_POWER_DISPATCHED"
    print(f"[4/4] Planetary Thermospheric Dynamo Supergrid: {r4.json()['status']} ({r4.json()['harvested_power_gw']} GW)")

    print("Wave 68 drill PASSED (4/4).")


if __name__ == "__main__":
    main()
