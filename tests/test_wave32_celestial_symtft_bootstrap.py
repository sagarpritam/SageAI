"""
Unit and Integration Tests for Wave 32: Celestial Holography w_{1+infinity}, Non-Invertible
Generalized Symmetry & SymTFT Firewall, Conformal Bootstrap SDP & Planetary Axion Haloscope Grid.
Covers:
- Capability 116: Celestial Holography w_{1+infinity} Asymptotic BMS Supertranslation & Soft-Graviton Memory Shield
- Capability 117: Non-Invertible Generalized Fusion-Category Symmetry & SymTFT Topological Defect Firewall
- Capability 118: Bootstrap Conformal Field Theory & Tauberian Crossing-Symmetry S-Matrix SDP Bound Auditor
- Option B Wave 32: Sovereign Planetary Topological Axion-Quasiparticle Dark-Matter Haloscope & Coherent Primakov Cavity Grid
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.axion_haloscope_power.axion_haloscope_power import (
    get_axion_haloscope_power_grid,
)
from app.services.celestial_holography.celestial_holography import (
    get_celestial_holography_shield,
)
from app.services.conformal_bootstrap.conformal_bootstrap import (
    get_conformal_bootstrap_auditor,
)
from app.services.non_invertible_symtft.non_invertible_symtft import (
    get_non_invertible_symtft_firewall,
)


@pytest.fixture
def client():
    return TestClient(app)


# ==============================================================================
# Capability 116: Celestial Holography w_{1+infinity} & BMS4 Memory Shield Tests
# ==============================================================================


def test_celestial_holography_service():
    shield = get_celestial_holography_shield()
    boundaries = shield.get_boundaries()
    assert len(boundaries) >= 3
    boundary_id = boundaries[0]["boundary_id"]

    res = shield.seal_bms_ward_identity(
        boundary_id=boundary_id,
        mellin_boost_delta=1.5,
        soft_theorem_order=2,
        w_infinity_mode_cutoff=20,
        bms_damping_gain=1.35,
    )
    assert res["boundary_id"] == boundary_id
    assert res["bms4_supertranslation_sealed"] is True
    assert res["ward_identity_fidelity_pct"] > 99.99
    assert res["memory_suppression_db"] > 150.0
    assert res["status"] == "CELESTIAL_W1INF_LOCKED"

    metrics = shield.get_celestial_metrics()
    assert metrics["active_celestial_boundaries"] >= 3
    assert metrics["w_infinity_chiral_lock"] is True


def test_celestial_holography_api(client):
    b_res = client.get("/api/celestial-holography/boundaries")
    assert b_res.status_code == 200
    assert len(b_res.json()["boundaries"]) >= 3

    seal_res = client.post(
        "/api/celestial-holography/seal-ward",
        json={
            "boundary_id": "CS2-CELESTIAL-BMS-01",
            "mellin_boost_delta": 1.5,
            "soft_theorem_order": 2,
            "w_infinity_mode_cutoff": 20,
            "bms_damping_gain": 1.35,
        },
    )
    assert seal_res.status_code == 200
    data = seal_res.json()
    assert data["boundary_id"] == "CS2-CELESTIAL-BMS-01"
    assert data["bms4_supertranslation_sealed"] is True
    assert data["status"] == "CELESTIAL_W1INF_LOCKED"

    miss_res = client.post(
        "/api/celestial-holography/seal-ward",
        json={"boundary_id": "CS2-UNKNOWN-999"},
    )
    assert miss_res.status_code == 404

    metrics_res = client.get("/api/celestial-holography/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["w_infinity_chiral_lock"] is True


# ==============================================================================
# Capability 117: Non-Invertible Generalized Symmetry & SymTFT Firewall Tests
# ==============================================================================


def test_non_invertible_symtft_service():
    fw = get_non_invertible_symtft_firewall()
    sandwiches = fw.get_sandwiches()
    assert len(sandwiches) >= 3
    sandwich_id = sandwiches[0]["sandwich_id"]

    res = fw.seal_topological_defect(
        sandwich_id=sandwich_id,
        higher_form_p=1,
        anyon_count=6,
        pentagon_associator_gain=1.4,
    )
    assert res["sandwich_id"] == sandwich_id
    assert res["pentagon_identity_verified"] is True
    assert res["defect_coherence_pct"] > 99.99
    assert res["anomaly_isolation_db"] > 152.0
    assert res["status"] == "SYMTFT_DEFECT_SEALED"

    metrics = fw.get_symtft_metrics()
    assert metrics["active_symtft_sandwiches"] >= 3
    assert metrics["lagrangian_algebra_condensed"] is True


def test_non_invertible_symtft_api(client):
    s_res = client.get("/api/non-invertible-symtft/sandwiches")
    assert s_res.status_code == 200
    assert len(s_res.json()["sandwiches"]) >= 3

    seal_res = client.post(
        "/api/non-invertible-symtft/seal-defect",
        json={
            "sandwich_id": "SYMTFT-KW-ISING-01",
            "higher_form_p": 1,
            "anyon_count": 6,
            "pentagon_associator_gain": 1.4,
        },
    )
    assert seal_res.status_code == 200
    data = seal_res.json()
    assert data["sandwich_id"] == "SYMTFT-KW-ISING-01"
    assert data["pentagon_identity_verified"] is True
    assert data["status"] == "SYMTFT_DEFECT_SEALED"

    miss_res = client.post(
        "/api/non-invertible-symtft/seal-defect",
        json={"sandwich_id": "SYMTFT-UNKNOWN-999"},
    )
    assert miss_res.status_code == 404

    metrics_res = client.get("/api/non-invertible-symtft/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["lagrangian_algebra_condensed"] is True


# ==============================================================================
# Capability 118: Conformal Bootstrap SDP & Crossing-Symmetry Auditor Tests
# ==============================================================================


def test_conformal_bootstrap_service():
    auditor = get_conformal_bootstrap_auditor()
    functionals = auditor.get_functionals()
    assert len(functionals) >= 3
    functional_id = functionals[0]["functional_id"]

    res = auditor.audit_crossing_unitarity(
        functional_id=functional_id,
        derivative_order_lambda=27,
        max_spin_ell=26,
        sdp_precision_gain=1.45,
    )
    assert res["functional_id"] == functional_id
    assert res["reflection_positivity_verified"] is True
    assert res["unitarity_margin_above_floor"] > 0.0
    assert res["unitarity_fidelity_pct"] > 99.99
    assert res["status"] == "BOOTSTRAP_UNITARITY_SEALED"

    metrics = auditor.get_bootstrap_metrics()
    assert metrics["active_sdp_functionals"] >= 3
    assert metrics["reflection_positivity_enforced"] is True


def test_conformal_bootstrap_api(client):
    f_res = client.get("/api/conformal-bootstrap/functionals")
    assert f_res.status_code == 200
    assert len(f_res.json()["functionals"]) >= 3

    audit_res = client.post(
        "/api/conformal-bootstrap/audit-crossing",
        json={
            "functional_id": "SDP-ISING-3D-KINK-01",
            "derivative_order_lambda": 27,
            "max_spin_ell": 26,
            "sdp_precision_gain": 1.45,
        },
    )
    assert audit_res.status_code == 200
    data = audit_res.json()
    assert data["functional_id"] == "SDP-ISING-3D-KINK-01"
    assert data["reflection_positivity_verified"] is True
    assert data["status"] == "BOOTSTRAP_UNITARITY_SEALED"

    miss_res = client.post(
        "/api/conformal-bootstrap/audit-crossing",
        json={"functional_id": "SDP-UNKNOWN-999"},
    )
    assert miss_res.status_code == 404

    metrics_res = client.get("/api/conformal-bootstrap/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["reflection_positivity_enforced"] is True


# ==============================================================================
# Option B Wave 32: Planetary Axion-Quasiparticle Haloscope Power Grid Tests
# ==============================================================================


def test_axion_haloscope_service():
    grid = get_axion_haloscope_power_grid()
    arrays = grid.get_arrays()
    assert len(arrays) >= 3
    array_id = arrays[0]["array_id"]

    res = grid.resonate_haloscope_grid(
        array_id=array_id,
        magnetic_field_tesla=14.0,
        cavity_quality_q_million=2.8,
        axion_mass_uev=42.0,
        primakov_coupling_gain=1.25,
    )
    assert res["array_id"] == array_id
    assert res["zero_fossil_carbon"] is True
    assert res["zero_fissile_waste"] is True
    assert res["net_clean_baseload_gw"] > 165.0
    assert res["coherent_rectification_eff_pct"] > 94.0
    assert res["status"] == "AXION_PRIMAKOV_GRID_OPTIMAL"

    metrics = grid.get_haloscope_metrics()
    assert metrics["active_haloscope_arrays"] >= 3
    assert metrics["zero_fissile_actinide_waste"] is True


def test_axion_haloscope_api(client):
    a_res = client.get("/api/axion-haloscope-power/arrays")
    assert a_res.status_code == 200
    assert len(a_res.json()["arrays"]) >= 3

    res_post = client.post(
        "/api/axion-haloscope-power/resonate-haloscope",
        json={
            "array_id": "AXION-ADMX-TOROID-01",
            "magnetic_field_tesla": 14.0,
            "cavity_quality_q_million": 2.8,
            "axion_mass_uev": 42.0,
            "primakov_coupling_gain": 1.25,
        },
    )
    assert res_post.status_code == 200
    data = res_post.json()
    assert data["array_id"] == "AXION-ADMX-TOROID-01"
    assert data["zero_fissile_waste"] is True
    assert data["net_clean_baseload_gw"] > 165.0
    assert data["status"] == "AXION_PRIMAKOV_GRID_OPTIMAL"

    miss_res = client.post(
        "/api/axion-haloscope-power/resonate-haloscope",
        json={"array_id": "AXION-UNKNOWN-999"},
    )
    assert miss_res.status_code == 404

    metrics_res = client.get("/api/axion-haloscope-power/metrics")
    assert metrics_res.status_code == 200
    assert metrics_res.json()["zero_fissile_actinide_waste"] is True
