from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_wave66_mazur_eisenstein_list_and_evaluate():
    res = client.get("/api/mazur-eisenstein-torsion/curves")
    assert res.status_code == 200
    data = res.json()
    assert len(data["curves"]) == 3
    assert data["curves"][0]["curve_id"] == "MAZUR-EISENSTEIN-X0-11-01"

    eval_res = client.post(
        "/api/mazur-eisenstein-torsion/evaluate-eisenstein-torsion",
        json={"curve_id": "MAZUR-EISENSTEIN-X0-11-01", "prime_n": 11, "torsion_order": 5, "shield_gain": 1.25},
    )
    assert eval_res.status_code == 200
    ev = eval_res.json()
    assert ev["status"] == "MAZUR_EISENSTEIN_TORSION_LOCKED"
    assert ev["torsion_verified"] is True


def test_wave66_mazur_eisenstein_metrics():
    res = client.get("/api/mazur-eisenstein-torsion/metrics")
    assert res.status_code == 200
    m = res.json()
    assert m["active_curves_count"] == 3
    assert m["eisenstein_torsion_compliance_pct"] == 100.0


def test_wave66_ribet_level_lowering_list_and_evaluate():
    res = client.get("/api/ribet-level-lowering/forms")
    assert res.status_code == 200
    data = res.json()
    assert len(data["forms"]) == 3
    assert data["forms"][0]["form_id"] == "RIBET-LEVEL-LOWER-P5-01"

    eval_res = client.post(
        "/api/ribet-level-lowering/evaluate-level-lowering",
        json={"form_id": "RIBET-LEVEL-LOWER-P5-01", "residual_prime_p": 5, "serre_weight_k": 2, "barrier_gain": 1.25},
    )
    assert eval_res.status_code == 200
    ev = eval_res.json()
    assert ev["status"] == "RIBET_LEVEL_LOWERING_LOCKED"
    assert ev["level_lowered_verified"] is True


def test_wave66_ribet_level_lowering_metrics():
    res = client.get("/api/ribet-level-lowering/metrics")
    assert res.status_code == 200
    m = res.json()
    assert m["active_forms_count"] == 3
    assert m["level_lowering_compliance_pct"] == 100.0


def test_wave66_iwasawa_main_conjecture_list_and_evaluate():
    res = client.get("/api/iwasawa-main-conjecture/extensions")
    assert res.status_code == 200
    data = res.json()
    assert len(data["extensions"]) == 3
    assert data["extensions"][0]["extension_id"] == "IWASAWA-ZP-CYCLOTOMIC-01"

    eval_res = client.post(
        "/api/iwasawa-main-conjecture/evaluate-iwasawa-ideal",
        json={"extension_id": "IWASAWA-ZP-CYCLOTOMIC-01", "prime_p": 5, "lambda_invariant": 1, "firewall_gain": 1.25},
    )
    assert eval_res.status_code == 200
    ev = eval_res.json()
    assert ev["status"] == "IWASAWA_MAIN_CONJECTURE_LOCKED"
    assert ev["iwasawa_ideal_verified"] is True


def test_wave66_iwasawa_main_conjecture_metrics():
    res = client.get("/api/iwasawa-main-conjecture/metrics")
    assert res.status_code == 200
    m = res.json()
    assert m["active_extensions_count"] == 3
    assert m["iwasawa_compliance_pct"] == 100.0


def test_wave66_planetary_stratospheric_jetstream_and_harvest():
    res = client.get("/api/planetary-stratospheric-jetstream/streams")
    assert res.status_code == 200
    data = res.json()
    assert len(data["streams"]) == 3
    assert data["streams"][0]["stream_id"] == "POLAR-FRONT-JETSTREAM-01"

    hv_res = client.post(
        "/api/planetary-stratospheric-jetstream/harvest-jetstream-power",
        json={"stream_id": "POLAR-FRONT-JETSTREAM-01", "rossby_multiplier": 1.05, "triboelectric_efficiency": 0.986, "dispatch_duration_s": 60.0},
    )
    assert hv_res.status_code == 200
    hv = hv_res.json()
    assert hv["status"] == "JETSTREAM_POWER_DISPATCHED"
    assert hv["jetstream_coupling_state"] == "JETSTREAM_TRIBOELECTRIC_LOCKED"


def test_wave66_planetary_stratospheric_jetstream_metrics():
    res = client.get("/api/planetary-stratospheric-jetstream/metrics")
    assert res.status_code == 200
    m = res.json()
    assert m["active_streams_count"] == 3
    assert m["jetstream_coupling_status"] == "JETSTREAM_TRIBOELECTRIC_LOCKED"


def test_wave66_health_version():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["version"] in ("10.6.0",)
