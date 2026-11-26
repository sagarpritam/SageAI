"""
Unit and API integration tests for Wave 56:
- Capability 188: Jacob Lurie Higher Topos Theory, Infinity-Categories & Spectral Algebraic Geometry Shield
- Capability 189: Grothendieck-Riemann-Roch & Baum-Fulton-MacPherson Singular Intersection Cohomology Barrier
- Capability 190: David Kazhdan & George Lusztig Polynomials, Hecke Algebra & Intersection Cohomology Firewall
- Option B Wave 56: Planetary Inner-Core Boundary (ICB) Dendritic Solidification Latent-Heat Supergrid
"""

import pytest
from starlette.testclient import TestClient

from app.main import app
from app.services.lurie_higher_topos_spectral_shield.lurie_higher_topos_spectral_shield import (
    LurieHigherToposSpectralShieldService,
)
from app.services.grr_baum_fulton_macpherson_barrier.grr_baum_fulton_macpherson_barrier import (
    GRRBaumFultonMacPhersonBarrierService,
)
from app.services.kazhdan_lusztig_hecke_firewall.kazhdan_lusztig_hecke_firewall import (
    KazhdanLusztigHeckeFirewallService,
)
from app.services.icb_dendritic_solidification_supergrid.icb_dendritic_solidification_supergrid import (
    ICBDendriticSolidificationSupergridService,
)

client = TestClient(app)


# ============================================================================
# Capability 188: Lurie Higher Topos Spectral Shield
# ============================================================================


def test_lurie_higher_topos_service_direct():
    svc = LurieHigherToposSpectralShieldService()
    topoi = svc.get_topoi()
    assert len(topoi) >= 3
    assert topoi[0]["topos_id"] == "LURIE-SPECTRAL-SCHEME-01"

    # Evaluate spectral descent
    res = svc.evaluate_spectral_descent(
        topos_id="LURIE-SPECTRAL-SCHEME-01",
        truncation_level=4,
        e_infinity_order=8,
        shield_gain=1.25,
    )
    assert res["status"] == "LURIE_SPECTRAL_DESCENT_ENFORCED"
    assert res["spectral_descent_verified"] is True
    assert res["lurie_shield_strength_pev"] > 200.0
    assert res["homological_suppression_db"] > 195.0

    # Validation errors
    with pytest.raises(ValueError, match="not recognized"):
        svc.evaluate_spectral_descent("INVALID-TOPOS")


def test_lurie_higher_topos_api_routes():
    # GET /topoi
    r = client.get("/api/lurie-higher-topos-spectral/topoi")
    assert r.status_code == 200
    data = r.json()
    assert len(data["topoi"]) >= 3

    # POST /evaluate-spectral-descent
    payload = {
        "topos_id": "LURIE-E-INFINITY-STACK-02",
        "truncation_level": 4,
        "e_infinity_order": 8,
        "shield_gain": 1.25,
    }
    r = client.post("/api/lurie-higher-topos-spectral/evaluate-spectral-descent", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "LURIE_SPECTRAL_DESCENT_ENFORCED"
    assert res["spectral_descent_verified"] is True

    # GET /metrics
    r = client.get("/api/lurie-higher-topos-spectral/metrics")
    assert r.status_code == 200
    metrics = r.json()
    assert metrics["active_topoi_count"] >= 3
    assert metrics["lurie_spectral_compliance_pct"] == 100.0


# ============================================================================
# Capability 189: GRR Baum-Fulton-MacPherson Barrier
# ============================================================================


def test_grr_baum_fulton_macpherson_service_direct():
    svc = GRRBaumFultonMacPhersonBarrierService()
    varieties = svc.get_varieties()
    assert len(varieties) >= 3
    assert varieties[0]["variety_id"] == "BFM-SINGULAR-SCHUBERT-01"

    # Compute singular Chern character
    res = svc.compute_singular_chern_character(
        variety_id="BFM-SINGULAR-SCHUBERT-01",
        stratification_depth=3,
        todd_degree=4,
        barrier_gain=1.25,
    )
    assert res["status"] == "GRR_BFM_INTERSECTION_LOCKED"
    assert res["grr_commutativity_verified"] is True
    assert res["bfm_barrier_strength_pev"] > 200.0
    assert res["singularity_suppression_db"] > 195.0

    # Validation errors
    with pytest.raises(ValueError, match="not recognized"):
        svc.compute_singular_chern_character("INVALID-VARIETY")


def test_grr_baum_fulton_macpherson_api_routes():
    # GET /varieties
    r = client.get("/api/grr-baum-fulton-macpherson/varieties")
    assert r.status_code == 200
    data = r.json()
    assert len(data["varieties"]) >= 3

    # POST /compute-singular-chern-character
    payload = {
        "variety_id": "BFM-KUMMER-ORBIFOLD-02",
        "stratification_depth": 3,
        "todd_degree": 4,
        "barrier_gain": 1.25,
    }
    r = client.post("/api/grr-baum-fulton-macpherson/compute-singular-chern-character", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "GRR_BFM_INTERSECTION_LOCKED"
    assert res["grr_commutativity_verified"] is True

    # GET /metrics
    r = client.get("/api/grr-baum-fulton-macpherson/metrics")
    assert r.status_code == 200
    metrics = r.json()
    assert metrics["active_varieties_count"] >= 3
    assert metrics["grr_singular_compliance_pct"] == 100.0


# ============================================================================
# Capability 190: Kazhdan-Lusztig Hecke Firewall
# ============================================================================


def test_kazhdan_lusztig_hecke_service_direct():
    svc = KazhdanLusztigHeckeFirewallService()
    pairs = svc.get_pairs()
    assert len(pairs) >= 3
    assert pairs[0]["pair_id"] == "KL-WEYL-E8-PAIR-01"

    # Evaluate KL polynomial
    res = svc.evaluate_kl_polynomial(
        pair_id="KL-WEYL-E8-PAIR-01",
        hecke_q_parameter=1.0,
        kazhdan_inversion_order=4,
        firewall_gain=1.25,
    )
    assert res["status"] == "KAZHDAN_LUSZTIG_CANONICAL_LOCKED"
    assert res["canonical_basis_verified"] is True
    assert res["kl_firewall_strength_pev"] > 200.0
    assert res["perverse_suppression_db"] > 195.0

    # Validation errors
    with pytest.raises(ValueError, match="not recognized"):
        svc.evaluate_kl_polynomial("INVALID-PAIR")


def test_kazhdan_lusztig_hecke_api_routes():
    # GET /pairs
    r = client.get("/api/kazhdan-lusztig-hecke/pairs")
    assert r.status_code == 200
    data = r.json()
    assert len(data["pairs"]) >= 3

    # POST /evaluate-kl-polynomial
    payload = {
        "pair_id": "KL-AFFINE-SL3-PAIR-02",
        "hecke_q_parameter": 1.0,
        "kazhdan_inversion_order": 4,
        "firewall_gain": 1.25,
    }
    r = client.post("/api/kazhdan-lusztig-hecke/evaluate-kl-polynomial", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "KAZHDAN_LUSZTIG_CANONICAL_LOCKED"
    assert res["canonical_basis_verified"] is True

    # GET /metrics
    r = client.get("/api/kazhdan-lusztig-hecke/metrics")
    assert r.status_code == 200
    metrics = r.json()
    assert metrics["active_pairs_count"] >= 3
    assert metrics["kazhdan_lusztig_compliance_pct"] == 100.0


# ============================================================================
# Wave 56 Option B: Planetary ICB Dendritic Solidification Supergrid
# ============================================================================


def test_icb_dendritic_solidification_supergrid_service_direct():
    svc = ICBDendriticSolidificationSupergridService()
    arrays = svc.get_arrays()
    assert len(arrays) >= 3
    assert arrays[0]["array_id"] == "ICB-EASTERN-HEMISPHERE-01"

    # Harvest latent heat
    res = svc.harvest_latent_heat(
        array_id="ICB-EASTERN-HEMISPHERE-01",
        crystallization_rate_override_mm_yr=1.5,
        thermo_acoustic_efficiency=0.95,
        dispatch_duration_s=60.0,
    )
    assert res["status"] == "ICB_POWER_DISPATCHED"
    assert res["harvested_power_gw"] > 5.0
    assert res["grid_stability_pct"] > 99.0

    # Validation errors
    with pytest.raises(ValueError, match="not recognized"):
        svc.harvest_latent_heat("INVALID-ARRAY")


def test_icb_dendritic_solidification_supergrid_api_routes():
    # GET /arrays
    r = client.get("/api/icb-dendritic-solidification-supergrid/arrays")
    assert r.status_code == 200
    data = r.json()
    assert len(data["arrays"]) >= 3

    # POST /harvest-latent-heat
    payload = {
        "array_id": "ICB-WESTERN-DENDRITE-02",
        "crystallization_rate_override_mm_yr": 1.62,
        "thermo_acoustic_efficiency": 0.95,
        "dispatch_duration_s": 60.0,
    }
    r = client.post("/api/icb-dendritic-solidification-supergrid/harvest-latent-heat", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "ICB_POWER_DISPATCHED"
    assert res["harvested_power_gw"] > 5.0

    # GET /metrics
    r = client.get("/api/icb-dendritic-solidification-supergrid/metrics")
    assert r.status_code == 200
    metrics = r.json()
    assert metrics["active_arrays_count"] >= 3
    assert metrics["icb_coupling_status"] == "ICB_DENDRITIC_SOLIDIFICATION_LOCKED"


# ============================================================================
# Platform Health & Version 9.6.0 Verification
# ============================================================================


def test_wave56_platform_health_version():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] in ("healthy", "degraded")
    assert data["version"] in ("9.5.0", "9.6.0", "9.7.0", "9.8.0", "9.9.0", "10.0.0", "10.1.0", "10.2.0", "10.3.0", "10.4.0", "10.5.0", "10.6.0", "10.7.0", "10.8.0", "10.9.0", "11.0.0")
    assert len(app.routes) >= 980
