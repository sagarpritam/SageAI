import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_wave65_ihara_galois_braid_list_and_evaluate():
    res = client.get("/api/ihara-galois-braid/braids")
    assert res.status_code == 200
    data = res.json()
    assert len(data["braids"]) == 3
    assert data["braids"][0]["braid_id"] == "IHARA-P1-MINUS3-01"

    eval_res = client.post(
        "/api/ihara-galois-braid/evaluate-profinite-braid",
        json={"braid_id": "IHARA-P1-MINUS3-01", "puncture_count": 3, "profinite_depth": 4, "shield_gain": 1.25},
    )
    assert eval_res.status_code == 200
    ev = eval_res.json()
    assert ev["status"] == "IHARA_GALOIS_BRAID_LOCKED"
    assert ev["monodromy_verified"] is True


def test_wave65_ihara_galois_braid_metrics():
    res = client.get("/api/ihara-galois-braid/metrics")
    assert res.status_code == 200
    m = res.json()
    assert m["active_braids_count"] == 3
    assert m["profinite_braid_compliance_pct"] == 100.0


def test_wave65_shimura_taniyama_list_and_evaluate():
    res = client.get("/api/shimura-taniyama-modular/curves")
    assert res.status_code == 200
    data = res.json()
    assert len(data["curves"]) == 3
    assert data["curves"][0]["curve_id"] == "SHIMURA-X0-11-ELLIPTIC-01"

    eval_res = client.post(
        "/api/shimura-taniyama-modular/evaluate-modular-parametrization",
        json={"curve_id": "SHIMURA-X0-11-ELLIPTIC-01", "level_n": 11, "q_truncation_order": 8, "barrier_gain": 1.25},
    )
    assert eval_res.status_code == 200
    ev = eval_res.json()
    assert ev["status"] == "SHIMURA_TANIYAMA_MODULAR_LOCKED"
    assert ev["eigenform_verified"] is True


def test_wave65_shimura_taniyama_metrics():
    res = client.get("/api/shimura-taniyama-modular/metrics")
    assert res.status_code == 200
    m = res.json()
    assert m["active_curves_count"] == 3
    assert m["modular_parametrization_compliance_pct"] == 100.0


def test_wave65_stark_regulator_list_and_evaluate():
    res = client.get("/api/stark-regulator-values/regulators")
    assert res.status_code == 200
    data = res.json()
    assert len(data["regulators"]) == 3
    assert data["regulators"][0]["regulator_id"] == "STARK-RANK1-ABELIAN-01"

    eval_res = client.post(
        "/api/stark-regulator-values/evaluate-stark-regulator",
        json={"regulator_id": "STARK-RANK1-ABELIAN-01", "vanishing_order_r": 1, "class_number_h": 1, "firewall_gain": 1.25},
    )
    assert eval_res.status_code == 200
    ev = eval_res.json()
    assert ev["status"] == "STARK_REGULATOR_LOCKED"
    assert ev["stark_unit_verified"] is True


def test_wave65_stark_regulator_metrics():
    res = client.get("/api/stark-regulator-values/metrics")
    assert res.status_code == 200
    m = res.json()
    assert m["active_regulators_count"] == 3
    assert m["stark_regulator_compliance_pct"] == 100.0


def test_wave65_planetary_oceanic_thermohaline_currents_and_harvest():
    res = client.get("/api/planetary-oceanic-thermohaline/currents")
    assert res.status_code == 200
    data = res.json()
    assert len(data["currents"]) == 3
    assert data["currents"][0]["current_id"] == "AMOC-NORTH-ATLANTIC-DEEPWATER-01"

    hv_res = client.post(
        "/api/planetary-oceanic-thermohaline/harvest-thermohaline-power",
        json={"current_id": "AMOC-NORTH-ATLANTIC-DEEPWATER-01", "coriolis_multiplier": 1.05, "lorentz_efficiency": 0.984, "dispatch_duration_s": 60.0},
    )
    assert hv_res.status_code == 200
    hv = hv_res.json()
    assert hv["status"] == "THERMOHALINE_POWER_DISPATCHED"
    assert hv["thermohaline_coupling_state"] == "THERMOHALINE_CORIOLIS_LOCKED"


def test_wave65_planetary_oceanic_thermohaline_metrics():
    res = client.get("/api/planetary-oceanic-thermohaline/metrics")
    assert res.status_code == 200
    m = res.json()
    assert m["active_currents_count"] == 3
    assert m["thermohaline_coupling_status"] == "THERMOHALINE_CORIOLIS_LOCKED"


def test_wave65_health_version():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["version"] in ("10.5.0",)
