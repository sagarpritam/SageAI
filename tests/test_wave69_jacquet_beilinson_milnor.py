from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_wave69_jacquet_langlands_list_and_evaluate():
    res = client.get("/api/jacquet-langlands-quaternion/correspondences")
    assert res.status_code == 200
    data = res.json()
    assert len(data["correspondences"]) == 3
    assert data["correspondences"][0]["correspondence_id"] == "JACQUET-LANGLANDS-GL2-01"

    eval_res = client.post(
        "/api/jacquet-langlands-quaternion/evaluate-quaternion-transfer",
        json={"correspondence_id": "JACQUET-LANGLANDS-GL2-01", "quaternion_discriminant": 6, "level_n": 11, "shield_gain": 1.25},
    )
    assert eval_res.status_code == 200
    ev = eval_res.json()
    assert ev["status"] == "JACQUET_LANGLANDS_LOCKED"
    assert ev["transfer_verified"] is True


def test_wave69_jacquet_langlands_metrics():
    res = client.get("/api/jacquet-langlands-quaternion/metrics")
    assert res.status_code == 200
    m = res.json()
    assert m["active_correspondences_count"] == 3
    assert m["jacquet_langlands_compliance_pct"] == 100.0


def test_wave69_beilinson_regulator_list_and_evaluate():
    res = client.get("/api/beilinson-deligne-regulator/regulators")
    assert res.status_code == 200
    data = res.json()
    assert len(data["regulators"]) == 3
    assert data["regulators"][0]["regulator_id"] == "BEILINSON-REGULATOR-K2-01"

    eval_res = client.post(
        "/api/beilinson-deligne-regulator/evaluate-beilinson-regulator",
        json={"regulator_id": "BEILINSON-REGULATOR-K2-01", "motivic_weight": 2, "chow_codimension": 2, "barrier_gain": 1.25},
    )
    assert eval_res.status_code == 200
    ev = eval_res.json()
    assert ev["status"] == "BEILINSON_REGULATOR_LOCKED"
    assert ev["regulator_verified"] is True


def test_wave69_beilinson_regulator_metrics():
    res = client.get("/api/beilinson-deligne-regulator/metrics")
    assert res.status_code == 200
    m = res.json()
    assert m["active_regulators_count"] == 3
    assert m["beilinson_regulator_compliance_pct"] == 100.0


def test_wave69_milnor_symbol_list_and_evaluate():
    res = client.get("/api/milnor-norm-residue/symbols")
    assert res.status_code == 200
    data = res.json()
    assert len(data["symbols"]) == 3
    assert data["symbols"][0]["symbol_id"] == "MILNOR-K2-SYMBOL-01"

    eval_res = client.post(
        "/api/milnor-norm-residue/evaluate-milnor-symbol",
        json={"symbol_id": "MILNOR-K2-SYMBOL-01", "k_degree_n": 2, "torsion_m": 5, "firewall_gain": 1.25},
    )
    assert eval_res.status_code == 200
    ev = eval_res.json()
    assert ev["status"] == "MILNOR_K_THEORY_LOCKED"
    assert ev["steinberg_relation_verified"] is True


def test_wave69_milnor_symbol_metrics():
    res = client.get("/api/milnor-norm-residue/metrics")
    assert res.status_code == 200
    m = res.json()
    assert m["active_symbols_count"] == 3
    assert m["milnor_k_theory_compliance_pct"] == 100.0


def test_wave69_planetary_exospheric_geocorona_and_harvest():
    res = client.get("/api/planetary-exospheric-geocorona/shells")
    assert res.status_code == 200
    data = res.json()
    assert len(data["shells"]) == 3
    assert data["shells"][0]["shell_id"] == "EXOSPHERE-GEOCORONA-LYMAN-01"

    hv_res = client.post(
        "/api/planetary-exospheric-geocorona/harvest-exospheric-power",
        json={"shell_id": "EXOSPHERE-GEOCORONA-LYMAN-01", "reconnection_multiplier": 1.05, "reconnection_efficiency": 0.989, "dispatch_duration_s": 60.0},
    )
    assert hv_res.status_code == 200
    hv = hv_res.json()
    assert hv["status"] == "EXOSPHERIC_POWER_DISPATCHED"
    assert hv["exospheric_coupling_state"] == "EXOSPHERIC_GEOCORONA_LOCKED"


def test_wave69_planetary_exospheric_geocorona_metrics():
    res = client.get("/api/planetary-exospheric-geocorona/metrics")
    assert res.status_code == 200
    m = res.json()
    assert m["active_shells_count"] == 3
    assert m["exospheric_coupling_status"] == "EXOSPHERIC_GEOCORONA_LOCKED"


def test_wave69_health_version():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["version"] in ("10.9.0", "11.0.0", "11.1.0", "11.2.0", "11.3.0", "11.4.0", "11.5.0", "11.6.0", "11.7.0")
