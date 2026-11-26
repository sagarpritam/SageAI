from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_wave68_szpiro_abc_list_and_evaluate():
    res = client.get("/api/szpiro-abc-height/bounds")
    assert res.status_code == 200
    data = res.json()
    assert len(data["bounds"]) == 3
    assert data["bounds"][0]["bound_id"] == "SZPIRO-DISCRIMINANT-01"

    eval_res = client.post(
        "/api/szpiro-abc-height/evaluate-abc-radical",
        json={"bound_id": "SZPIRO-DISCRIMINANT-01", "conductor_n": 11, "szpiro_exponent": 6.0, "shield_gain": 1.25},
    )
    assert eval_res.status_code == 200
    ev = eval_res.json()
    assert ev["status"] == "SZPIRO_ABC_LOCKED"
    assert ev["abc_bound_verified"] is True


def test_wave68_szpiro_abc_metrics():
    res = client.get("/api/szpiro-abc-height/metrics")
    assert res.status_code == 200
    m = res.json()
    assert m["active_bounds_count"] == 3
    assert m["szpiro_abc_compliance_pct"] == 100.0


def test_wave68_andre_oort_list_and_evaluate():
    res = client.get("/api/andre-oort-shimura/varieties")
    assert res.status_code == 200
    data = res.json()
    assert len(data["varieties"]) == 3
    assert data["varieties"][0]["variety_id"] == "ANDRE-OORT-CM-POINTS-01"

    eval_res = client.post(
        "/api/andre-oort-shimura/evaluate-special-points",
        json={"variety_id": "ANDRE-OORT-CM-POINTS-01", "shimura_dimension": 2, "cm_discriminant": 19, "barrier_gain": 1.25},
    )
    assert eval_res.status_code == 200
    ev = eval_res.json()
    assert ev["status"] == "ANDRE_OORT_LOCKED"
    assert ev["special_subvariety_verified"] is True


def test_wave68_andre_oort_metrics():
    res = client.get("/api/andre-oort-shimura/metrics")
    assert res.status_code == 200
    m = res.json()
    assert m["active_varieties_count"] == 3
    assert m["andre_oort_compliance_pct"] == 100.0


def test_wave68_arthur_endoscopy_list_and_evaluate():
    res = client.get("/api/langlands-arthur-trace/endoscopies")
    assert res.status_code == 200
    data = res.json()
    assert len(data["endoscopies"]) == 3
    assert data["endoscopies"][0]["endoscopy_id"] == "ARTHUR-ENDOSCOPY-SL2-01"

    eval_res = client.post(
        "/api/langlands-arthur-trace/evaluate-arthur-trace",
        json={"endoscopy_id": "ARTHUR-ENDOSCOPY-SL2-01", "group_rank": 2, "packet_dimension": 4, "firewall_gain": 1.25},
    )
    assert eval_res.status_code == 200
    ev = eval_res.json()
    assert ev["status"] == "ARTHUR_ENDOSCOPY_LOCKED"
    assert ev["fundamental_lemma_verified"] is True


def test_wave68_arthur_endoscopy_metrics():
    res = client.get("/api/langlands-arthur-trace/metrics")
    assert res.status_code == 200
    m = res.json()
    assert m["active_endoscopies_count"] == 3
    assert m["arthur_endoscopy_compliance_pct"] == 100.0


def test_wave68_planetary_thermospheric_dynamo_and_harvest():
    res = client.get("/api/planetary-thermospheric-dynamo/zones")
    assert res.status_code == 200
    data = res.json()
    assert len(data["zones"]) == 3
    assert data["zones"][0]["zone_id"] == "THERMOSPHERE-JOULE-RING-01"

    hv_res = client.post(
        "/api/planetary-thermospheric-dynamo/harvest-thermospheric-power",
        json={"zone_id": "THERMOSPHERE-JOULE-RING-01", "dynamo_multiplier": 1.05, "dynamo_efficiency": 0.988, "dispatch_duration_s": 60.0},
    )
    assert hv_res.status_code == 200
    hv = hv_res.json()
    assert hv["status"] == "THERMOSPHERIC_POWER_DISPATCHED"
    assert hv["thermospheric_coupling_state"] == "THERMOSPHERIC_DYNAMO_LOCKED"


def test_wave68_planetary_thermospheric_dynamo_metrics():
    res = client.get("/api/planetary-thermospheric-dynamo/metrics")
    assert res.status_code == 200
    m = res.json()
    assert m["active_zones_count"] == 3
    assert m["thermospheric_coupling_status"] == "THERMOSPHERIC_DYNAMO_LOCKED"


def test_wave68_health_version():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["version"] in ("10.8.0", "10.9.0", "11.0.0", "11.1.0", "11.2.0", "11.3.0", "11.4.0", "11.5.0", "11.6.0")
