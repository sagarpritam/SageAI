from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_wave70_kollar_birkar_list_and_evaluate():
    res = client.get("/api/kollar-birkar-mmp/models")
    assert res.status_code == 200
    data = res.json()
    assert len(data["models"]) == 3
    assert data["models"][0]["model_id"] == "KOLLAR-LOG-CANONICAL-01"

    eval_res = client.post(
        "/api/kollar-birkar-mmp/evaluate-mmp-threshold",
        json={"model_id": "KOLLAR-LOG-CANONICAL-01", "variety_dimension": 3, "epsilon_lc": 0.05, "shield_gain": 1.25},
    )
    assert eval_res.status_code == 200
    ev = eval_res.json()
    assert ev["status"] == "KOLLAR_BIRKAR_MMP_LOCKED"
    assert ev["mmp_terminated"] is True


def test_wave70_kollar_birkar_metrics():
    res = client.get("/api/kollar-birkar-mmp/metrics")
    assert res.status_code == 200
    m = res.json()
    assert m["active_models_count"] == 3
    assert m["kollar_birkar_compliance_pct"] == 100.0


def test_wave70_perelman_w_entropy_list_and_evaluate():
    res = client.get("/api/perelman-w-entropy/flows")
    assert res.status_code == 200
    data = res.json()
    assert len(data["flows"]) == 3
    assert data["flows"][0]["flow_id"] == "PERELMAN-W-ENTROPY-01"

    eval_res = client.post(
        "/api/perelman-w-entropy/evaluate-w-entropy",
        json={"flow_id": "PERELMAN-W-ENTROPY-01", "tau_scale": 1.5, "kappa_noncollapse": 0.95, "barrier_gain": 1.25},
    )
    assert eval_res.status_code == 200
    ev = eval_res.json()
    assert ev["status"] == "PERELMAN_W_ENTROPY_LOCKED"
    assert ev["monotonicity_verified"] is True


def test_wave70_perelman_w_entropy_metrics():
    res = client.get("/api/perelman-w-entropy/metrics")
    assert res.status_code == 200
    m = res.json()
    assert m["active_flows_count"] == 3
    assert m["perelman_entropy_compliance_pct"] == 100.0


def test_wave70_kontsevich_wall_crossing_list_and_evaluate():
    res = client.get("/api/kontsevich-wall-crossing/chambers")
    assert res.status_code == 200
    data = res.json()
    assert len(data["chambers"]) == 3
    assert data["chambers"][0]["chamber_id"] == "KONTSEVICH-SOIBELMAN-01"

    eval_res = client.post(
        "/api/kontsevich-wall-crossing/evaluate-wall-crossing",
        json={"chamber_id": "KONTSEVICH-SOIBELMAN-01", "bps_charge_rank": 2, "dt_invariant_order": 4, "firewall_gain": 1.25},
    )
    assert eval_res.status_code == 200
    ev = eval_res.json()
    assert ev["status"] == "KONTSEVICH_WALL_LOCKED"
    assert ev["automorphism_invariant"] is True


def test_wave70_kontsevich_wall_crossing_metrics():
    res = client.get("/api/kontsevich-wall-crossing/metrics")
    assert res.status_code == 200
    m = res.json()
    assert m["active_chambers_count"] == 3
    assert m["kontsevich_wall_compliance_pct"] == 100.0


def test_wave70_planetary_van_allen_belt_and_harvest():
    res = client.get("/api/planetary-van-allen-belt/belts")
    assert res.status_code == 200
    data = res.json()
    assert len(data["belts"]) == 3
    assert data["belts"][0]["belt_id"] == "VAN-ALLEN-INNER-PROTON-01"

    hv_res = client.post(
        "/api/planetary-van-allen-belt/harvest-betatron-power",
        json={"belt_id": "VAN-ALLEN-INNER-PROTON-01", "cyclotron_multiplier": 1.05, "betatron_efficiency": 0.99, "dispatch_duration_s": 60.0},
    )
    assert hv_res.status_code == 200
    hv = hv_res.json()
    assert hv["status"] == "BETATRON_POWER_DISPATCHED"
    assert hv["betatron_coupling_state"] == "VAN_ALLEN_BETATRON_LOCKED"


def test_wave70_planetary_van_allen_belt_metrics():
    res = client.get("/api/planetary-van-allen-belt/metrics")
    assert res.status_code == 200
    m = res.json()
    assert m["active_belts_count"] == 3
    assert m["betatron_coupling_status"] == "VAN_ALLEN_BETATRON_LOCKED"


def test_wave70_health_version():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["version"] in ("11.0.0", "11.1.0", "11.2.0", "11.3.0", "11.4.0", "11.5.0", "11.6.0", "11.7.0")
