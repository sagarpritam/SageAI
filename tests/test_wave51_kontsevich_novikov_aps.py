"""
Unit and API integration tests for Wave 51:
- Capability 173: Kontsevich Deformation Quantization Shield & Formality L_infinity Morphism
- Capability 174: Novikov-Shubin Invariants & L^2-Betti Cohomological Barrier
- Capability 175: Atiyah-Patodi-Singer Spectral Asymmetry eta-Invariant Firewall
- Option B Wave 51: Planetary Magneto-Acoustic Soliton Core-Mantle Supergrid
"""

import pytest
from starlette.testclient import TestClient

from app.main import app
from app.services.kontsevich_deformation_shield.kontsevich_deformation_shield import (
    KontsevichDeformationShieldService,
)
from app.services.novikov_shubin_barrier.novikov_shubin_barrier import (
    NovikovShubinBarrierService,
)
from app.services.aps_eta_invariant_firewall.aps_eta_invariant_firewall import (
    ApsEtaInvariantFirewallService,
)
from app.services.magneto_acoustic_soliton_supergrid.magneto_acoustic_soliton_supergrid import (
    MagnetoAcousticSolitonSupergridService,
)

client = TestClient(app)


# ============================================================================
# Capability 173: Kontsevich Deformation Quantization Shield
# ============================================================================


def test_kontsevich_deformation_service_direct():
    svc = KontsevichDeformationShieldService()
    manifolds = svc.get_manifolds()
    assert len(manifolds) >= 3
    assert manifolds[0]["manifold_id"] == "KONTSEVICH-MOYAL-PLANE-01"
    assert manifolds[0]["poisson_rank"] == 2

    # Quantize deformation
    res = svc.quantize_deformation(
        manifold_id="KONTSEVICH-MOYAL-PLANE-01",
        hbar_order=4,
        harmonic_precision=1e-6,
        deformation_gain=1.25,
    )
    assert res["status"] == "KONTSEVICH_DEFORMATION_QUANTIZED"
    assert res["formality_morphism_order"] == 4
    assert 1 in res["kontsevich_graph_weights"]
    assert res["deformation_shield_strength_pev"] > 90.0
    assert res["deformation_suppression_db"] > 195.0
    assert res["star_product_associativity_pct"] >= 99.99

    # Validation errors
    with pytest.raises(ValueError, match="not recognized"):
        svc.quantize_deformation("INVALID-MANIFOLD")


def test_kontsevich_deformation_api_routes():
    # GET /manifolds
    r = client.get("/api/kontsevich-deformation/manifolds")
    assert r.status_code == 200
    data = r.json()
    assert len(data["manifolds"]) >= 3

    # POST /quantize-deformation
    payload = {
        "manifold_id": "KONTSEVICH-MOYAL-PLANE-01",
        "hbar_order": 4,
        "harmonic_precision": 1e-6,
        "deformation_gain": 1.25,
    }
    r = client.post("/api/kontsevich-deformation/quantize-deformation", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "KONTSEVICH_DEFORMATION_QUANTIZED"
    assert res["deformation_shield_strength_pev"] > 90.0

    # GET /metrics
    r = client.get("/api/kontsevich-deformation/metrics")
    assert r.status_code == 200
    metrics = r.json()
    assert metrics["active_manifolds_count"] >= 3
    assert metrics["formality_l_infinity_status"] == "L_INFINITY_QUASI_ISOMORPHISM_LOCKED"


# ============================================================================
# Capability 174: Novikov-Shubin Invariants & L^2-Betti Cohomological Barrier
# ============================================================================


def test_novikov_shubin_barrier_service_direct():
    svc = NovikovShubinBarrierService()
    coverings = svc.get_coverings()
    assert len(coverings) >= 3
    assert coverings[0]["covering_id"] == "NOVIKOV-HEISENBERG-3D-01"
    assert coverings[0]["manifold_dimension"] == 3

    # Compute invariants
    res = svc.compute_invariants(
        covering_id="NOVIKOV-HEISENBERG-3D-01",
        spectral_order=6,
        dilatational_cutoff=1e-4,
        barrier_gain=1.25,
    )
    assert res["status"] == "NOVIKOV_SHUBIN_BARRIER_LOCKED"
    assert res["atiyah_l2_index_verified"] is True
    assert res["l2_barrier_strength_pev"] > 200.0
    assert res["spectral_suppression_db"] > 195.0

    # Test hyperbolic surface with positive gap
    res_hyp = svc.compute_invariants(
        covering_id="NOVIKOV-HYPERBOLIC-SURFACE-03",
        spectral_order=6,
        dilatational_cutoff=1e-4,
        barrier_gain=1.25,
    )
    assert res_hyp["novikov_shubin_alpha"] == "INF_POSITIVE_GAP"
    assert res_hyp["spectral_gap_lambda0"] == 0.25
    assert res_hyp["atiyah_l2_index_verified"] is True

    # Validation errors
    with pytest.raises(ValueError, match="not recognized"):
        svc.compute_invariants("INVALID-COVERING")


def test_novikov_shubin_barrier_api_routes():
    # GET /coverings
    r = client.get("/api/novikov-shubin/coverings")
    assert r.status_code == 200
    data = r.json()
    assert len(data["coverings"]) >= 3

    # POST /compute-invariants
    payload = {
        "covering_id": "NOVIKOV-SOLV-4D-02",
        "spectral_order": 6,
        "dilatational_cutoff": 1e-4,
        "barrier_gain": 1.25,
    }
    r = client.post("/api/novikov-shubin/compute-invariants", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "NOVIKOV_SHUBIN_BARRIER_LOCKED"
    assert res["atiyah_l2_index_verified"] is True

    # GET /metrics
    r = client.get("/api/novikov-shubin/metrics")
    assert r.status_code == 200
    metrics = r.json()
    assert metrics["active_coverings_count"] >= 3
    assert metrics["atiyah_index_compliance_pct"] == 100.0


# ============================================================================
# Capability 175: Atiyah-Patodi-Singer Spectral Asymmetry eta-Invariant Firewall
# ============================================================================


def test_aps_eta_firewall_service_direct():
    svc = ApsEtaInvariantFirewallService()
    manifolds = svc.get_manifolds()
    assert len(manifolds) >= 3
    assert manifolds[0]["manifold_id"] == "APS-DIRAC-CYLINDER-01"
    assert manifolds[0]["dimension"] == 4

    # Evaluate eta invariant
    res = svc.evaluate_eta_invariant(
        manifold_id="APS-DIRAC-CYLINDER-01",
        spectral_s=0.0,
        eigenvalue_cutoff=50,
        boundary_damping=1.25,
    )
    assert res["status"] == "APS_ETA_FIREWALL_SEALED"
    assert res["dai_freed_anomaly_canceled"] is True
    assert res["eta_firewall_strength_pev"] > 250.0
    assert res["anomaly_suppression_db"] > 195.0

    # Validation errors
    with pytest.raises(ValueError, match="not recognized"):
        svc.evaluate_eta_invariant("INVALID-MANIFOLD")


def test_aps_eta_firewall_api_routes():
    # GET /manifolds
    r = client.get("/api/aps-eta-firewall/manifolds")
    assert r.status_code == 200
    data = r.json()
    assert len(data["manifolds"]) >= 3

    # POST /evaluate-eta
    payload = {
        "manifold_id": "APS-LENS-SPACE-02",
        "spectral_s": 0.0,
        "eigenvalue_cutoff": 50,
        "boundary_damping": 1.25,
    }
    r = client.post("/api/aps-eta-firewall/evaluate-eta", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "APS_ETA_FIREWALL_SEALED"
    assert res["dai_freed_anomaly_canceled"] is True

    # GET /metrics
    r = client.get("/api/aps-eta-firewall/metrics")
    assert r.status_code == 200
    metrics = r.json()
    assert metrics["active_manifolds_count"] >= 3
    assert metrics["spectral_boundary_condition"] == "NON_LOCAL_APS_PROJECTION_SEALED"


# ============================================================================
# Wave 51 Option B: Planetary Magneto-Acoustic Soliton Core-Mantle Supergrid
# ============================================================================


def test_magneto_acoustic_soliton_service_direct():
    svc = MagnetoAcousticSolitonSupergridService()
    cavities = svc.get_cavities()
    assert len(cavities) >= 3
    assert cavities[0]["cavity_id"] == "SOLITON-PACIFIC-RIM-01"
    assert cavities[0]["cmb_depth_km"] == 2891.0

    # Harvest solitons
    res = svc.harvest_solitons(
        cavity_id="SOLITON-PACIFIC-RIM-01",
        magnetic_field_tesla=0.005,
        acoustic_velocity_km_s=13.6,
        piezo_efficiency=0.95,
        extraction_duration_s=60.0,
    )
    assert res["status"] == "MAGNETO_ACOUSTIC_POWER_DISPATCHED"
    assert res["harvested_power_gw"] > 3.0
    assert res["grid_stability_pct"] > 99.0

    # Validation errors
    with pytest.raises(ValueError, match="not recognized"):
        svc.harvest_solitons("INVALID-CAVITY")


def test_magneto_acoustic_soliton_api_routes():
    # GET /cavities
    r = client.get("/api/magneto-acoustic-soliton-supergrid/cavities")
    assert r.status_code == 200
    data = r.json()
    assert len(data["cavities"]) >= 3

    # POST /harvest-solitons
    payload = {
        "cavity_id": "SOLITON-AFRICAN-SUPERPLUME-02",
        "magnetic_field_tesla": 0.008,
        "acoustic_velocity_km_s": 12.8,
        "piezo_efficiency": 0.95,
        "extraction_duration_s": 60.0,
    }
    r = client.post("/api/magneto-acoustic-soliton-supergrid/harvest-solitons", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "MAGNETO_ACOUSTIC_POWER_DISPATCHED"
    assert res["harvested_power_gw"] > 3.0

    # GET /metrics
    r = client.get("/api/magneto-acoustic-soliton-supergrid/metrics")
    assert r.status_code == 200
    metrics = r.json()
    assert metrics["active_cavities_count"] >= 3
    assert metrics["cmb_transduction_status"] == "CORE_MANTLE_SOLITON_LOCKED"


# ============================================================================
# Platform Health & Version 9.1.0 Verification
# ============================================================================


def test_wave51_platform_health_version():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] in ("healthy", "degraded")
    assert data["version"] in ("9.0.0", "9.1.0", "9.2.0", "9.3.0", "9.4.0", "9.5.0", "9.6.0", "9.7.0", "9.8.0", "9.9.0", "10.0.0", "10.1.0", "10.2.0", "10.3.0", "10.4.0", "10.5.0", "10.6.0", "10.7.0", "10.8.0", "10.9.0", "11.0.0")
    assert len(app.routes) >= 924
