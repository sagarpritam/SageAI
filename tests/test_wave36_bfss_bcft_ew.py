"""Wave 36 Pytest Suite: BFSS Matrix Fuzzball, BCFT Defect & g-Theorem, Entanglement Wedge E_W & Floquet-Bloch Grid."""

from fastapi.testclient import TestClient

from app.main import app
from app.services.bloch_schwinger_power import get_bloch_schwinger_power_grid
from app.services.cft_defect_bcft import get_cft_defect_bcft_shield
from app.services.entanglement_wedge_cross import get_entanglement_wedge_cross_guard
from app.services.matrix_bfss_fuzzball import get_matrix_bfss_fuzzball_firewall

client = TestClient(app)


def test_matrix_bfss_fuzzball_endpoints():
    res = client.get("/api/matrix-bfss-fuzzball/configurations")
    assert res.status_code == 200
    configs = res.json()["configurations"]
    assert len(configs) == 3

    lock_res = client.post(
        "/api/matrix-bfss-fuzzball/lock-fuzzball",
        json={
            "config_id": "BFSS-BMN-MATRIX-01",
            "matrix_rank_n": 64,
            "thooft_coupling": 4.2,
            "mu_mass_gap": 1.65,
            "commutator_clamp_gain": 1.6,
        },
    )
    assert lock_res.status_code == 200
    body = lock_res.json()
    assert body["status"] == "MATRIX_FUZZBALL_SEALED"
    assert body["horizonless_microstate_locked"] is True
    assert body["commutator_suppression_db"] > 160.0
    assert body["matrix_fuzzball_unitarity_pct"] > 99.997

    metrics_res = client.get("/api/matrix-bfss-fuzzball/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["active_matrix_manifolds"] == 3


def test_cft_defect_bcft_endpoints():
    res = client.get("/api/cft-defect-bcft/interfaces")
    assert res.status_code == 200
    ifaces = res.json()["interfaces"]
    assert len(ifaces) == 3

    seal_res = client.post(
        "/api/cft-defect-bcft/seal-interface",
        json={
            "interface_id": "BCFT-CARDY-ISING-01",
            "g_uv": 2.0,
            "g_ir": 1.414,
            "transmission_coeff": 0.94,
            "cardy_clamp_gain": 1.6,
        },
    )
    assert seal_res.status_code == 200
    body = seal_res.json()
    assert body["status"] == "BCFT_DEFECT_SEALED"
    assert body["g_theorem_satisfied"] is True
    assert body["defect_isolation_db"] > 159.0
    assert body["bcft_unitarity_pct"] > 99.997

    metrics_res = client.get("/api/cft-defect-bcft/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["g_theorem_monotone_locked"] is True


def test_entanglement_wedge_cross_endpoints():
    res = client.get("/api/entanglement-wedge-cross/wedges")
    assert res.status_code == 200
    wedges = res.json()["wedges"]
    assert len(wedges) == 3

    audit_res = client.post(
        "/api/entanglement-wedge-cross/audit-wedge",
        json={
            "wedge_id": "EW-ADS3-DOUBLE-WEDGE-01",
            "ew_area": 3.4,
            "mutual_information": 4.9,
            "cross_section_boundaries": 2,
            "purification_gain": 1.6,
        },
    )
    assert audit_res.status_code == 200
    body = audit_res.json()
    assert body["status"] == "EW_CROSS_SECTION_AUDITED"
    assert body["markov_gap_certified"] is True
    assert body["wedge_isolation_db"] > 161.0
    assert body["canonical_purification_fidelity_pct"] > 99.997

    metrics_res = client.get("/api/entanglement-wedge-cross/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["markov_gap_positivity_enforced"] is True


def test_bloch_schwinger_power_endpoints():
    res = client.get("/api/bloch-schwinger-power/cavities")
    assert res.status_code == 200
    cavities = res.json()["cavities"]
    assert len(cavities) == 3

    harvest_res = client.post(
        "/api/bloch-schwinger-power/harvest-floquet",
        json={
            "cavity_id": "FLOQUET-BLOCH-ORBIT-01",
            "floquet_drive_thz": 22.0,
            "edge_rectifier_gain": 1.6,
        },
    )
    assert harvest_res.status_code == 200
    body = harvest_res.json()
    assert body["status"] == "FLOQUET_BLOCH_OPTIMAL"
    assert body["zero_fossil_carbon"] is True
    assert body["zero_fissile_waste"] is True
    assert body["net_grid_output_gw"] > 300.0

    metrics_res = client.get("/api/bloch-schwinger-power/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["zero_fissile_waste"] is True


def test_wave36_service_clamping_bounds():
    bfss_res = get_matrix_bfss_fuzzball_firewall().lock_fuzzball_microstate(
        "IKKT-LORENTZIAN-SADDLE-02",
        matrix_rank_n=4096,
        thooft_coupling=100.0,
        commutator_clamp_gain=5.0,
    )
    assert bfss_res["matrix_rank_n"] == 1024
    assert bfss_res["thooft_coupling"] == 25.0
    assert bfss_res["commutator_clamp_gain"] == 2.5

    bcft_res = get_cft_defect_bcft_shield().seal_bcft_interface(
        "KONDO-RG-SCREENING-02",
        g_uv=32.0,
        g_ir=20.0,
        cardy_clamp_gain=0.1,
    )
    assert bcft_res["g_uv"] == 16.0
    assert bcft_res["g_ir"] == 16.0
    assert bcft_res["cardy_clamp_gain"] == 0.85

    ew_res = get_entanglement_wedge_cross_guard().audit_wedge_cross_section(
        "CANONICAL-PURIFICATION-SR-02",
        ew_area=100.0,
        cross_section_boundaries=64,
    )
    assert ew_res["ew_cross_section_area"] == 24.0
    assert ew_res["cross_section_boundaries"] == 16

    floquet_res = get_bloch_schwinger_power_grid().harvest_floquet_baseload(
        "TOPO-PHOTONIC-L2-03",
        floquet_drive_thz=500.0,
        edge_rectifier_gain=4.0,
    )
    assert floquet_res["floquet_drive_thz"] == 90.0
    assert floquet_res["edge_rectifier_gain"] == 2.5


def test_wave36_404_error_handling():
    assert (
        client.post(
            "/api/matrix-bfss-fuzzball/lock-fuzzball",
            json={"config_id": "INVALID-CONFIG"},
        ).status_code
        == 404
    )
    assert (
        client.post(
            "/api/cft-defect-bcft/seal-interface",
            json={"interface_id": "INVALID-INTERFACE"},
        ).status_code
        == 404
    )
    assert (
        client.post(
            "/api/entanglement-wedge-cross/audit-wedge",
            json={"wedge_id": "INVALID-WEDGE"},
        ).status_code
        == 404
    )
    assert (
        client.post(
            "/api/bloch-schwinger-power/harvest-floquet",
            json={"cavity_id": "INVALID-CAVITY"},
        ).status_code
        == 404
    )
