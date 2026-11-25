"""
Unit and API integration tests for Wave 54:
- Capability 182: Yau-Tian-Donaldson K-Stability of Fano Varieties, Ding Functional Coercivity & Kähler-Einstein Metric Solvability Shield
- Capability 183: Deligne-Lusztig Varieties, Compactly Supported Étale Cohomology, Virtual Representations & Character Sheaves Barrier
- Capability 184: Atiyah-Segal Axiomatic Functorial Topological Quantum Field Theory & Cobordism Cutting-and-Gluing Firewall
- Option B Wave 54: Planetary Mantle Transition Zone Hydrous Ringwoodite/Wadsleyite Proton-Conduction Supergrid
"""

import pytest
from starlette.testclient import TestClient

from app.main import app
from app.services.yau_tian_donaldson_k_stability_shield.yau_tian_donaldson_k_stability_shield import (
    YauTianDonaldsonKStabilityShieldService,
)
from app.services.deligne_lusztig_character_barrier.deligne_lusztig_character_barrier import (
    DeligneLusztigCharacterBarrierService,
)
from app.services.atiyah_segal_tqft_functor_firewall.atiyah_segal_tqft_functor_firewall import (
    AtiyahSegalTQFTFunctorFirewallService,
)
from app.services.mantle_transition_zone_wadsleyite_supergrid.mantle_transition_zone_wadsleyite_supergrid import (
    MantleTransitionZoneWadsleyiteSupergridService,
)

client = TestClient(app)


# ============================================================================
# Capability 182: Yau-Tian-Donaldson K-Stability Shield
# ============================================================================


def test_yau_tian_donaldson_k_stability_service_direct():
    svc = YauTianDonaldsonKStabilityShieldService()
    varieties = svc.get_varieties()
    assert len(varieties) >= 3
    assert varieties[0]["variety_id"] == "YTD-FANO-CP3-01"
    assert varieties[0]["fano_index_r"] == 4

    # Verify K-stability
    res = svc.verify_k_stability(
        variety_id="YTD-FANO-CP3-01",
        test_configuration_exponent=2,
        coercivity_threshold=0.05,
        kahler_gain=1.25,
    )
    assert res["status"] == "YTD_K_STABILITY_ENFORCED"
    assert res["kahler_einstein_metric_solvable"] is True
    assert res["ytd_shield_strength_pev"] > 200.0
    assert res["ricci_suppression_db"] > 195.0

    # Validation errors
    with pytest.raises(ValueError, match="not recognized"):
        svc.verify_k_stability("INVALID-VARIETY")


def test_yau_tian_donaldson_k_stability_api_routes():
    # GET /varieties
    r = client.get("/api/yau-tian-donaldson-k-stability/varieties")
    assert r.status_code == 200
    data = r.json()
    assert len(data["varieties"]) >= 3

    # POST /verify-k-stability
    payload = {
        "variety_id": "YTD-DEL-PEZZO-DP6-02",
        "test_configuration_exponent": 2,
        "coercivity_threshold": 0.05,
        "kahler_gain": 1.25,
    }
    r = client.post("/api/yau-tian-donaldson-k-stability/verify-k-stability", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "YTD_K_STABILITY_ENFORCED"
    assert res["kahler_einstein_metric_solvable"] is True

    # GET /metrics
    r = client.get("/api/yau-tian-donaldson-k-stability/metrics")
    assert r.status_code == 200
    metrics = r.json()
    assert metrics["active_varieties_count"] >= 3
    assert metrics["kahler_einstein_solvability_pct"] == 100.0


# ============================================================================
# Capability 183: Deligne-Lusztig Character Sheaves Barrier
# ============================================================================


def test_deligne_lusztig_character_service_direct():
    svc = DeligneLusztigCharacterBarrierService()
    varieties = svc.get_varieties()
    assert len(varieties) >= 3
    assert varieties[0]["variety_id"] == "DL-GL3-FLAG-01"

    # Evaluate Deligne-Lusztig character
    res = svc.evaluate_character(
        variety_id="DL-GL3-FLAG-01",
        cohomology_degree=2,
        unipotent_rank=3,
        representation_gain=1.25,
    )
    assert res["status"] == "DL_CHARACTER_ORTHOGONAL_LOCKED"
    assert res["character_orthogonality_verified"] is True
    assert res["dl_barrier_strength_pev"] > 200.0
    assert res["character_suppression_db"] > 195.0

    # Validation errors
    with pytest.raises(ValueError, match="not recognized"):
        svc.evaluate_character("INVALID-VARIETY")


def test_deligne_lusztig_character_api_routes():
    # GET /varieties
    r = client.get("/api/deligne-lusztig-character/varieties")
    assert r.status_code == 200
    data = r.json()
    assert len(data["varieties"]) >= 3

    # POST /evaluate-character
    payload = {
        "variety_id": "DL-SP4-SYMPLECTIC-02",
        "cohomology_degree": 2,
        "unipotent_rank": 3,
        "representation_gain": 1.25,
    }
    r = client.post("/api/deligne-lusztig-character/evaluate-character", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "DL_CHARACTER_ORTHOGONAL_LOCKED"
    assert res["character_orthogonality_verified"] is True

    # GET /metrics
    r = client.get("/api/deligne-lusztig-character/metrics")
    assert r.status_code == 200
    metrics = r.json()
    assert metrics["active_varieties_count"] >= 3
    assert metrics["deligne_lusztig_orthogonality_compliance_pct"] == 100.0


# ============================================================================
# Capability 184: Atiyah-Segal Axiomatic Functorial TQFT Firewall
# ============================================================================


def test_atiyah_segal_tqft_service_direct():
    svc = AtiyahSegalTQFTFunctorFirewallService()
    bordisms = svc.get_bordisms()
    assert len(bordisms) >= 3
    assert bordisms[0]["bordism_id"] == "TQFT-TORUS-DEHN-TWIST-01"

    # Evaluate functor
    res = svc.evaluate_functor(
        bordism_id="TQFT-TORUS-DEHN-TWIST-01",
        gluing_cut_count=2,
        mapping_class_order=12,
        functor_gain=1.25,
    )
    assert res["status"] == "ATIYAH_SEGAL_FUNCTOR_LOCKED"
    assert res["cobordism_gluing_verified"] is True
    assert res["tqft_firewall_strength_pev"] > 200.0
    assert res["anomaly_suppression_db"] > 195.0

    # Validation errors
    with pytest.raises(ValueError, match="not recognized"):
        svc.evaluate_functor("INVALID-BORDISM")


def test_atiyah_segal_tqft_api_routes():
    # GET /bordisms
    r = client.get("/api/atiyah-segal-tqft/bordisms")
    assert r.status_code == 200
    data = r.json()
    assert len(data["bordisms"]) >= 3

    # POST /evaluate-functor
    payload = {
        "bordism_id": "TQFT-PAIR-OF-PANTS-02",
        "gluing_cut_count": 2,
        "mapping_class_order": 6,
        "functor_gain": 1.25,
    }
    r = client.post("/api/atiyah-segal-tqft/evaluate-functor", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "ATIYAH_SEGAL_FUNCTOR_LOCKED"
    assert res["cobordism_gluing_verified"] is True

    # GET /metrics
    r = client.get("/api/atiyah-segal-tqft/metrics")
    assert r.status_code == 200
    metrics = r.json()
    assert metrics["active_bordisms_count"] >= 3
    assert metrics["atiyah_segal_gluing_compliance_pct"] == 100.0


# ============================================================================
# Wave 54 Option B: Planetary Mantle Transition Zone Wadsleyite Supergrid
# ============================================================================


def test_mantle_transition_zone_wadsleyite_supergrid_service_direct():
    svc = MantleTransitionZoneWadsleyiteSupergridService()
    arrays = svc.get_arrays()
    assert len(arrays) >= 3
    assert arrays[0]["array_id"] == "WADSLEYITE-PACIFIC-SLAB-01"

    # Harvest proton conduction power
    res = svc.harvest_proton_conduction(
        array_id="WADSLEYITE-PACIFIC-SLAB-01",
        water_content_override_wt_pct=2.15,
        induction_efficiency=0.95,
        dispatch_duration_s=60.0,
    )
    assert res["status"] == "WADSLEYITE_POWER_DISPATCHED"
    assert res["harvested_power_gw"] > 4.0
    assert res["grid_stability_pct"] > 99.0

    # Validation errors
    with pytest.raises(ValueError, match="not recognized"):
        svc.harvest_proton_conduction("INVALID-ARRAY")


def test_mantle_transition_zone_wadsleyite_supergrid_api_routes():
    # GET /arrays
    r = client.get("/api/mantle-transition-zone-wadsleyite-supergrid/arrays")
    assert r.status_code == 200
    data = r.json()
    assert len(data["arrays"]) >= 3

    # POST /harvest-proton-conduction
    payload = {
        "array_id": "RINGWOODITE-TONGA-KERMADEC-02",
        "water_content_override_wt_pct": 2.45,
        "induction_efficiency": 0.95,
        "dispatch_duration_s": 60.0,
    }
    r = client.post("/api/mantle-transition-zone-wadsleyite-supergrid/harvest-proton-conduction", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "WADSLEYITE_POWER_DISPATCHED"
    assert res["harvested_power_gw"] > 4.0

    # GET /metrics
    r = client.get("/api/mantle-transition-zone-wadsleyite-supergrid/metrics")
    assert r.status_code == 200
    metrics = r.json()
    assert metrics["active_arrays_count"] >= 3
    assert metrics["superionic_coupling_status"] == "HYDROUS_RINGWOODITE_CONDUCTION_LOCKED"


# ============================================================================
# Platform Health & Version 9.4.0 Verification
# ============================================================================


def test_wave54_platform_health_version():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] in ("healthy", "degraded")
    assert data["version"] in ("9.3.0", "9.4.0", "9.5.0", "9.6.0", "9.7.0", "9.8.0", "9.9.0", "10.0.0")
    assert len(app.routes) >= 960
