"""Wave 35 Pytest Suite: JT Wormhole Matrix, dS Static-Patch, 2-Group Higher-Form & Unruh-Rindler Grid."""

from fastapi.testclient import TestClient

from app.main import app
from app.services.ds_static_patch import get_ds_static_patch_shield
from app.services.higher_form_twogroup import get_higher_form_twogroup_guard
from app.services.jt_wormhole_matrix import get_jt_wormhole_matrix_firewall
from app.services.unruh_rindler_power import get_unruh_rindler_power_grid

client = TestClient(app)


def test_jt_wormhole_matrix_endpoints():
    res = client.get("/api/jt-wormhole-matrix/topologies")
    assert res.status_code == 200
    topos = res.json()["topologies"]
    assert len(topos) == 3

    seal_res = client.post(
        "/api/jt-wormhole-matrix/seal-wormhole",
        json={
            "topology_id": "JT-SSS-TRUMPET-01",
            "genus_g": 2,
            "s0_entropy": 8.4,
            "schwarzian_temp": 1.25,
            "trumpet_clamp_gain": 1.6,
        },
    )
    assert seal_res.status_code == 200
    body = seal_res.json()
    assert body["status"] == "JT_WORMHOLE_SEALED"
    assert body["weil_petersson_locked"] is True
    assert body["wormhole_suppression_db"] > 158.0
    assert body["matrix_unitarity_fidelity_pct"] > 99.997

    metrics_res = client.get("/api/jt-wormhole-matrix/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["active_jt_topologies"] == 3


def test_ds_static_patch_endpoints():
    res = client.get("/api/ds-static-patch/patches")
    assert res.status_code == 200
    patches = res.json()["patches"]
    assert len(patches) == 3

    lock_res = client.post(
        "/api/ds-static-patch/lock-patch",
        json={
            "patch_id": "DS-STATIC-GIBBONS-01",
            "hubble_scale": 1.0,
            "york_time": 0.95,
            "timelike_interval": 1.6,
            "observer_clamp_gain": 1.6,
        },
    )
    assert lock_res.status_code == 200
    body = lock_res.json()
    assert body["status"] == "DS_STATIC_PATCH_LOCKED"
    assert body["type_ii1_algebra_locked"] is True
    assert body["horizon_isolation_db"] > 159.0
    assert body["patch_coherence_pct"] > 99.997

    metrics_res = client.get("/api/ds-static-patch/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["type_ii1_observer_lock"] is True


def test_higher_form_twogroup_endpoints():
    res = client.get("/api/higher-form-twogroup/defects")
    assert res.status_code == 200
    defects = res.json()["defects"]
    assert len(defects) == 3

    audit_res = client.post(
        "/api/higher-form-twogroup/audit-twogroup",
        json={
            "defect_id": "TWOGROUP-POSTNIKOV-H3-01",
            "postnikov_order": 4,
            "walker_wang_rank": 8,
            "inflow_coupling": 1.25,
            "green_schwarz_gain": 1.65,
        },
    )
    assert audit_res.status_code == 200
    body = audit_res.json()
    assert body["status"] == "TWOGROUP_INFLOW_SEALED"
    assert body["green_schwarz_compensated"] is True
    assert body["anomaly_suppression_db"] > 160.0
    assert body["twogroup_unitarity_pct"] > 99.997

    metrics_res = client.get("/api/higher-form-twogroup/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["postnikov_h3_locked"] is True


def test_unruh_rindler_power_endpoints():
    res = client.get("/api/unruh-rindler-power/arrays")
    assert res.status_code == 200
    arrays = res.json()["arrays"]
    assert len(arrays) == 3

    harvest_res = client.post(
        "/api/unruh-rindler-power/harvest-unruh",
        json={
            "array_id": "UNRUH-RINDLER-LEO-01",
            "cavity_frequency_ghz": 42.0,
            "rectifier_gain": 1.6,
        },
    )
    assert harvest_res.status_code == 200
    body = harvest_res.json()
    assert body["status"] == "UNRUH_RINDLER_OPTIMAL"
    assert body["zero_fossil_carbon"] is True
    assert body["zero_fissile_waste"] is True
    assert body["net_grid_output_gw"] > 240.0

    metrics_res = client.get("/api/unruh-rindler-power/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["zero_fissile_waste"] is True


def test_wave35_service_clamping_bounds():
    jt_res = get_jt_wormhole_matrix_firewall().seal_wormhole_genus(
        "JT-MIRZAKHANI-WP-02",
        genus_g=99,
        s0_entropy=100.0,
        trumpet_clamp_gain=5.0,
    )
    assert jt_res["genus_g"] == 16
    assert jt_res["s0_entropy"] == 20.0
    assert jt_res["trumpet_clamp_gain"] == 2.5

    ds_res = get_ds_static_patch_shield().lock_static_patch(
        "DS-BILAYER-OBSERVER-02",
        hubble_scale=50.0,
        observer_clamp_gain=0.1,
    )
    assert ds_res["hubble_scale"] == 10.0
    assert ds_res["observer_clamp_gain"] == 0.85

    tg_res = get_higher_form_twogroup_guard().audit_twogroup_inflow(
        "TWOGROUP-WALKER-WANG-02",
        postnikov_order=128,
        walker_wang_rank=128,
    )
    assert tg_res["postnikov_order"] == 32
    assert tg_res["walker_wang_rank"] == 64

    unruh_res = get_unruh_rindler_power_grid().harvest_unruh_baseload(
        "UNRUH-L1-FULLING-03",
        cavity_frequency_ghz=500.0,
        rectifier_gain=4.0,
    )
    assert unruh_res["cavity_frequency_ghz"] == 180.0
    assert unruh_res["rectifier_gain"] == 2.5


def test_wave35_404_error_handling():
    assert (
        client.post(
            "/api/jt-wormhole-matrix/seal-wormhole",
            json={"topology_id": "INVALID-TOPOLOGY"},
        ).status_code
        == 404
    )
    assert (
        client.post(
            "/api/ds-static-patch/lock-patch",
            json={"patch_id": "INVALID-PATCH"},
        ).status_code
        == 404
    )
    assert (
        client.post(
            "/api/higher-form-twogroup/audit-twogroup",
            json={"defect_id": "INVALID-DEFECT"},
        ).status_code
        == 404
    )
    assert (
        client.post(
            "/api/unruh-rindler-power/harvest-unruh",
            json={"array_id": "INVALID-ARRAY"},
        ).status_code
        == 404
    )
