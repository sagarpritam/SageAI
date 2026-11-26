from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_wave67_kato_euler_system_list_and_evaluate():
    res = client.get("/api/kato-euler-system/systems")
    assert res.status_code == 200
    data = res.json()
    assert len(data["systems"]) == 3
    assert data["systems"][0]["system_id"] == "KATO-EULER-ZETA-01"

    eval_res = client.post(
        "/api/kato-euler-system/evaluate-euler-system",
        json={"system_id": "KATO-EULER-ZETA-01", "prime_p": 5, "weight_k": 2, "shield_gain": 1.25},
    )
    assert eval_res.status_code == 200
    ev = eval_res.json()
    assert ev["status"] == "KATO_EULER_SYSTEM_LOCKED"
    assert ev["euler_system_verified"] is True


def test_wave67_kato_euler_system_metrics():
    res = client.get("/api/kato-euler-system/metrics")
    assert res.status_code == 200
    m = res.json()
    assert m["active_systems_count"] == 3
    assert m["kato_euler_compliance_pct"] == 100.0


def test_wave67_gross_zagier_heegner_list_and_evaluate():
    res = client.get("/api/gross-zagier-heegner/pairings")
    assert res.status_code == 200
    data = res.json()
    assert len(data["pairings"]) == 3
    assert data["pairings"][0]["pairing_id"] == "GROSS-ZAGIER-HEEGNER-01"

    eval_res = client.post(
        "/api/gross-zagier-heegner/evaluate-height-pairing",
        json={"pairing_id": "GROSS-ZAGIER-HEEGNER-01", "conductor_n": 37, "analytic_rank": 1, "barrier_gain": 1.25},
    )
    assert eval_res.status_code == 200
    ev = eval_res.json()
    assert ev["status"] == "GROSS_ZAGIER_HEIGHT_LOCKED"
    assert ev["heegner_verified"] is True


def test_wave67_gross_zagier_heegner_metrics():
    res = client.get("/api/gross-zagier-heegner/metrics")
    assert res.status_code == 200
    m = res.json()
    assert m["active_pairings_count"] == 3
    assert m["gross_zagier_compliance_pct"] == 100.0


def test_wave67_faltings_mordell_list_and_evaluate():
    res = client.get("/api/faltings-mordell-finiteness/curves")
    assert res.status_code == 200
    data = res.json()
    assert len(data["curves"]) == 3
    assert data["curves"][0]["curve_id"] == "FALTINGS-MORDELL-GENUS2-01"

    eval_res = client.post(
        "/api/faltings-mordell-finiteness/evaluate-mordell-finiteness",
        json={"curve_id": "FALTINGS-MORDELL-GENUS2-01", "genus_g": 2, "bad_primes_count": 3, "firewall_gain": 1.25},
    )
    assert eval_res.status_code == 200
    ev = eval_res.json()
    assert ev["status"] == "FALTINGS_MORDELL_LOCKED"
    assert ev["mordell_finiteness_verified"] is True


def test_wave67_faltings_mordell_metrics():
    res = client.get("/api/faltings-mordell-finiteness/metrics")
    assert res.status_code == 200
    m = res.json()
    assert m["active_curves_count"] == 3
    assert m["faltings_mordell_compliance_pct"] == 100.0


def test_wave67_planetary_mesospheric_plasma_and_harvest():
    res = client.get("/api/planetary-mesospheric-plasma/layers")
    assert res.status_code == 200
    data = res.json()
    assert len(data["layers"]) == 3
    assert data["layers"][0]["layer_id"] == "MESOPAUSE-NOCTILUCENT-01"

    hv_res = client.post(
        "/api/planetary-mesospheric-plasma/harvest-mesospheric-power",
        json={"layer_id": "MESOPAUSE-NOCTILUCENT-01", "electrojet_multiplier": 1.05, "plasma_efficiency": 0.987, "dispatch_duration_s": 60.0},
    )
    assert hv_res.status_code == 200
    hv = hv_res.json()
    assert hv["status"] == "MESOSPHERIC_POWER_DISPATCHED"
    assert hv["mesospheric_coupling_state"] == "MESOSPHERIC_PLASMA_LOCKED"


def test_wave67_planetary_mesospheric_plasma_metrics():
    res = client.get("/api/planetary-mesospheric-plasma/metrics")
    assert res.status_code == 200
    m = res.json()
    assert m["active_layers_count"] == 3
    assert m["mesospheric_coupling_status"] == "MESOSPHERIC_PLASMA_LOCKED"


def test_wave67_health_version():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["version"] in ("10.7.0", "10.8.0", "10.9.0", "11.0.0", "11.1.0", "11.2.0", "11.3.0", "11.4.0", "11.5.0")
