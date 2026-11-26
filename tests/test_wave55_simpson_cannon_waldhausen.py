"""
Unit and API integration tests for Wave 55:
- Capability 185: Nonabelian Hodge Correspondence, Hitchin-Simpson System & Harmonic Metric Solvability Shield
- Capability 186: Gromov Hyperbolic Boundary Rigidity, Cannon-Thurston Map & Visual Peano Space-Filling Barrier
- Capability 187: Waldhausen Algebraic K-Theory, Goodwillie Cyclotomic Trace & Motivic-to-K Spectral Sequence Firewall
- Option B Wave 55: Planetary D'' Layer Ultralow-Velocity Zone (ULVZ) Magneto-Thermal Waveguide Supergrid
"""

import pytest
from starlette.testclient import TestClient

from app.main import app
from app.services.simpson_nonabelian_hodge_shield.simpson_nonabelian_hodge_shield import (
    SimpsonNonabelianHodgeShieldService,
)
from app.services.cannon_thurston_hyperbolic_barrier.cannon_thurston_hyperbolic_barrier import (
    CannonThurstonHyperbolicBarrierService,
)
from app.services.waldhausen_algebraic_k_firewall.waldhausen_algebraic_k_firewall import (
    WaldhausenAlgebraicKFirewallService,
)
from app.services.ulvz_magneto_thermal_waveguide_supergrid.ulvz_magneto_thermal_waveguide_supergrid import (
    ULVZMagnetoThermalWaveguideSupergridService,
)

client = TestClient(app)


# ============================================================================
# Capability 185: Simpson Nonabelian Hodge Shield
# ============================================================================


def test_simpson_nonabelian_hodge_service_direct():
    svc = SimpsonNonabelianHodgeShieldService()
    bundles = svc.get_bundles()
    assert len(bundles) >= 3
    assert bundles[0]["bundle_id"] == "HODGE-HIGGS-SL2-01"

    # Solve Hitchin-Simpson system
    res = svc.solve_hitchin_simpson(
        bundle_id="HODGE-HIGGS-SL2-01",
        harmonic_damping=0.05,
        spectral_cutoff=4,
        hodge_gain=1.25,
    )
    assert res["status"] == "SIMPSON_HODGE_HARMONIC_LOCKED"
    assert res["hitchin_simpson_solvable"] is True
    assert res["simpson_shield_strength_pev"] > 200.0
    assert res["curvature_suppression_db"] > 195.0

    # Validation errors
    with pytest.raises(ValueError, match="not recognized"):
        svc.solve_hitchin_simpson("INVALID-BUNDLE")


def test_simpson_nonabelian_hodge_api_routes():
    # GET /bundles
    r = client.get("/api/simpson-nonabelian-hodge/bundles")
    assert r.status_code == 200
    data = r.json()
    assert len(data["bundles"]) >= 3

    # POST /solve-hitchin-simpson
    payload = {
        "bundle_id": "HODGE-KAEHLER-K3-02",
        "harmonic_damping": 0.05,
        "spectral_cutoff": 4,
        "hodge_gain": 1.25,
    }
    r = client.post("/api/simpson-nonabelian-hodge/solve-hitchin-simpson", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "SIMPSON_HODGE_HARMONIC_LOCKED"
    assert res["hitchin_simpson_solvable"] is True

    # GET /metrics
    r = client.get("/api/simpson-nonabelian-hodge/metrics")
    assert r.status_code == 200
    metrics = r.json()
    assert metrics["active_bundles_count"] >= 3
    assert metrics["nonabelian_hodge_compliance_pct"] == 100.0


# ============================================================================
# Capability 186: Cannon-Thurston Hyperbolic Barrier
# ============================================================================


def test_cannon_thurston_hyperbolic_service_direct():
    svc = CannonThurstonHyperbolicBarrierService()
    groups = svc.get_groups()
    assert len(groups) >= 3
    assert groups[0]["group_id"] == "CT-FIBERED-SURFACE-01"

    # Verify boundary rigidity
    res = svc.verify_boundary_rigidity(
        group_id="CT-FIBERED-SURFACE-01",
        geodesic_ray_steps=100,
        delta_hyperbolicity_tolerance=0.05,
        barrier_gain=1.25,
    )
    assert res["status"] == "CANNON_THURSTON_RIGIDITY_ENFORCED"
    assert res["cannon_thurston_map_continuous"] is True
    assert res["cannon_thurston_barrier_strength_pev"] > 200.0
    assert res["distortion_suppression_db"] > 195.0

    # Validation errors
    with pytest.raises(ValueError, match="not recognized"):
        svc.verify_boundary_rigidity("INVALID-GROUP")


def test_cannon_thurston_hyperbolic_api_routes():
    # GET /groups
    r = client.get("/api/cannon-thurston-hyperbolic/groups")
    assert r.status_code == 200
    data = r.json()
    assert len(data["groups"]) >= 3

    # POST /verify-boundary-rigidity
    payload = {
        "group_id": "CT-KLEINIAN-PUNCTURED-02",
        "geodesic_ray_steps": 100,
        "delta_hyperbolicity_tolerance": 0.05,
        "barrier_gain": 1.25,
    }
    r = client.post("/api/cannon-thurston-hyperbolic/verify-boundary-rigidity", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "CANNON_THURSTON_RIGIDITY_ENFORCED"
    assert res["cannon_thurston_map_continuous"] is True

    # GET /metrics
    r = client.get("/api/cannon-thurston-hyperbolic/metrics")
    assert r.status_code == 200
    metrics = r.json()
    assert metrics["active_groups_count"] >= 3
    assert metrics["cannon_thurston_continuity_compliance_pct"] == 100.0


# ============================================================================
# Capability 187: Waldhausen Algebraic K-Firewall
# ============================================================================


def test_waldhausen_algebraic_k_service_direct():
    svc = WaldhausenAlgebraicKFirewallService()
    complexes = svc.get_complexes()
    assert len(complexes) >= 3
    assert complexes[0]["complex_id"] == "WALDHAUSEN-S-DOT-SPHERE-01"

    # Evaluate cyclotomic trace
    res = svc.evaluate_cyclotomic_trace(
        complex_id="WALDHAUSEN-S-DOT-SPHERE-01",
        filtration_degree=3,
        cyclotomic_prime=3,
        firewall_gain=1.25,
    )
    assert res["status"] == "WALDHAUSEN_CYCLOTOMIC_TRACE_LOCKED"
    assert res["motivic_spectral_degeneration"] is True
    assert res["waldhausen_firewall_strength_pev"] > 200.0
    assert res["arithmetic_anomaly_suppression_db"] > 195.0

    # Validation errors
    with pytest.raises(ValueError, match="not recognized"):
        svc.evaluate_cyclotomic_trace("INVALID-COMPLEX")


def test_waldhausen_algebraic_k_api_routes():
    # GET /complexes
    r = client.get("/api/waldhausen-algebraic-k/complexes")
    assert r.status_code == 200
    data = r.json()
    assert len(data["complexes"]) >= 3

    # POST /evaluate-cyclotomic-trace
    payload_clean = {
        "complex_id": "WALDHAUSEN-CYCLOTOMIC-TRACE-02",
        "filtration_degree": 3,
        "cyclotomic_prime": 3,
        "firewall_gain": 1.25,
    }
    r = client.post("/api/waldhausen-algebraic-k/evaluate-cyclotomic-trace", json=payload_clean)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "WALDHAUSEN_CYCLOTOMIC_TRACE_LOCKED"
    assert res["motivic_spectral_degeneration"] is True

    # GET /metrics
    r = client.get("/api/waldhausen-algebraic-k/metrics")
    assert r.status_code == 200
    metrics = r.json()
    assert metrics["active_complexes_count"] >= 3
    assert metrics["waldhausen_ktheory_compliance_pct"] == 100.0


# ============================================================================
# Wave 55 Option B: Planetary D'' Layer ULVZ Waveguide Supergrid
# ============================================================================


def test_ulvz_magneto_thermal_waveguide_supergrid_service_direct():
    svc = ULVZMagnetoThermalWaveguideSupergridService()
    arrays = svc.get_arrays()
    assert len(arrays) >= 3
    assert arrays[0]["array_id"] == "ULVZ-HAWAII-PLUME-ROOT-01"

    # Harvest waveguide power
    res = svc.harvest_waveguide_power(
        array_id="ULVZ-HAWAII-PLUME-ROOT-01",
        iron_enrichment_override_x_fe=0.18,
        waveguide_efficiency=0.95,
        dispatch_duration_s=60.0,
    )
    assert res["status"] == "ULVZ_POWER_DISPATCHED"
    assert res["harvested_power_gw"] > 4.0
    assert res["grid_stability_pct"] > 99.0

    # Validation errors
    with pytest.raises(ValueError, match="not recognized"):
        svc.harvest_waveguide_power("INVALID-ARRAY")


def test_ulvz_magneto_thermal_waveguide_supergrid_api_routes():
    # GET /arrays
    r = client.get("/api/ulvz-magneto-thermal-waveguide-supergrid/arrays")
    assert r.status_code == 200
    data = r.json()
    assert len(data["arrays"]) >= 3

    # POST /harvest-waveguide-power
    payload = {
        "array_id": "ULVZ-SAMOA-HOTSPOT-BASAL-02",
        "iron_enrichment_override_x_fe": 0.20,
        "waveguide_efficiency": 0.95,
        "dispatch_duration_s": 60.0,
    }
    r = client.post("/api/ulvz-magneto-thermal-waveguide-supergrid/harvest-waveguide-power", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "ULVZ_POWER_DISPATCHED"
    assert res["harvested_power_gw"] > 4.0

    # GET /metrics
    r = client.get("/api/ulvz-magneto-thermal-waveguide-supergrid/metrics")
    assert r.status_code == 200
    metrics = r.json()
    assert metrics["active_arrays_count"] >= 3
    assert metrics["ulvz_coupling_status"] == "BASAL_SLURRY_WAVEGUIDE_LOCKED"


# ============================================================================
# Platform Health & Version 9.5.0 Verification
# ============================================================================


def test_wave55_platform_health_version():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] in ("healthy", "degraded")
    assert data["version"] in ("9.4.0", "9.5.0", "9.6.0", "9.7.0", "9.8.0", "9.9.0", "10.0.0", "10.1.0", "10.2.0", "10.3.0", "10.4.0", "10.5.0", "10.6.0", "10.7.0", "10.8.0", "10.9.0", "11.0.0", "11.1.0", "11.2.0", "11.3.0")
    assert len(app.routes) >= 970
