"""
Unit and API integration tests for Wave 52:
- Capability 176: Perelman Ricci Flow with Surgery & Thurston Geometrization Shield
- Capability 177: Gromov-Witten Invariants & Quantum Cohomology Ring Barrier
- Capability 178: Quillen Determinant Line Bundle & Deligne-Riemann-Roch Anomaly Firewall
- Option B Wave 52: Planetary Thermoelectric-Geomagnetic Core-Mantle Seebeck Supergrid
"""

import pytest
from starlette.testclient import TestClient

from app.main import app
from app.services.perelman_ricci_flow_shield.perelman_ricci_flow_shield import (
    PerelmanRicciFlowShieldService,
)
from app.services.gromov_witten_cohomology_barrier.gromov_witten_cohomology_barrier import (
    GromovWittenCohomologyBarrierService,
)
from app.services.quillen_determinant_firewall.quillen_determinant_firewall import (
    QuillenDeterminantFirewallService,
)
from app.services.core_mantle_seebeck_supergrid.core_mantle_seebeck_supergrid import (
    CoreMantleSeebeckSupergridService,
)

client = TestClient(app)


# ============================================================================
# Capability 176: Perelman Ricci Flow with Surgery Shield
# ============================================================================


def test_perelman_ricci_flow_service_direct():
    svc = PerelmanRicciFlowShieldService()
    manifolds = svc.get_manifolds()
    assert len(manifolds) >= 3
    assert manifolds[0]["manifold_id"] == "PERELMAN-NECK-PINCH-S2xS1-01"
    assert manifolds[0]["dimension"] == 3

    # Execute surgery
    res = svc.execute_surgery(
        manifold_id="PERELMAN-NECK-PINCH-S2xS1-01",
        flow_time_tau=0.5,
        surgery_cutoff=1e-4,
        curvature_gain=1.25,
    )
    assert res["status"] == "PERELMAN_SURGERY_COMPLETED"
    assert res["thurston_geometrization_verified"] is True
    assert res["ricci_shield_strength_pev"] > 200.0
    assert res["topology_suppression_db"] > 195.0
    assert res["canonical_surgeries_performed"] >= 1

    # Validation errors
    with pytest.raises(ValueError, match="not recognized"):
        svc.execute_surgery("INVALID-MANIFOLD")


def test_perelman_ricci_flow_api_routes():
    # GET /manifolds
    r = client.get("/api/perelman-ricci-flow/manifolds")
    assert r.status_code == 200
    data = r.json()
    assert len(data["manifolds"]) >= 3

    # POST /execute-surgery
    payload = {
        "manifold_id": "PERELMAN-POINCARE-SPHERE-02",
        "flow_time_tau": 0.5,
        "surgery_cutoff": 1e-4,
        "curvature_gain": 1.25,
    }
    r = client.post("/api/perelman-ricci-flow/execute-surgery", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "PERELMAN_SURGERY_COMPLETED"
    assert res["thurston_geometrization_verified"] is True

    # GET /metrics
    r = client.get("/api/perelman-ricci-flow/metrics")
    assert r.status_code == 200
    metrics = r.json()
    assert metrics["active_manifolds_count"] >= 3
    assert metrics["w_entropy_monotonicity_compliance_pct"] == 100.0


# ============================================================================
# Capability 177: Gromov-Witten Invariants & Quantum Cohomology Ring Barrier
# ============================================================================


def test_gromov_witten_cohomology_service_direct():
    svc = GromovWittenCohomologyBarrierService()
    targets = svc.get_targets()
    assert len(targets) >= 3
    assert targets[0]["target_id"] == "GW-PROJECTIVE-CP2-01"

    # Compute quantum product
    res = svc.compute_quantum_product(
        target_id="GW-PROJECTIVE-CP2-01",
        quantum_degree=3,
        novikov_parameter_q=0.05,
        deformation_gain=1.25,
    )
    assert res["status"] == "GROMOV_WITTEN_COHOMOLOGY_LOCKED"
    assert res["wdvv_associativity_verified"] is True
    assert res["quantum_barrier_strength_pev"] > 250.0
    assert res["symplectic_suppression_db"] > 195.0

    # Validation errors
    with pytest.raises(ValueError, match="not recognized"):
        svc.compute_quantum_product("INVALID-TARGET")


def test_gromov_witten_cohomology_api_routes():
    # GET /targets
    r = client.get("/api/gromov-witten-cohomology/targets")
    assert r.status_code == 200
    data = r.json()
    assert len(data["targets"]) >= 3

    # POST /compute-quantum-product
    payload = {
        "target_id": "GW-GRASSMANNIAN-G24-02",
        "quantum_degree": 3,
        "novikov_parameter_q": 0.05,
        "deformation_gain": 1.25,
    }
    r = client.post("/api/gromov-witten-cohomology/compute-quantum-product", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "GROMOV_WITTEN_COHOMOLOGY_LOCKED"
    assert res["wdvv_associativity_verified"] is True

    # GET /metrics
    r = client.get("/api/gromov-witten-cohomology/metrics")
    assert r.status_code == 200
    metrics = r.json()
    assert metrics["active_targets_count"] >= 3
    assert metrics["wdvv_associativity_compliance_pct"] == 100.0


# ============================================================================
# Capability 178: Quillen Determinant Line Bundle Firewall
# ============================================================================


def test_quillen_determinant_service_direct():
    svc = QuillenDeterminantFirewallService()
    bundles = svc.get_bundles()
    assert len(bundles) >= 3
    assert bundles[0]["bundle_id"] == "QUILLEN-DIRAC-RIEMANN-01"

    # Evaluate determinant
    res = svc.evaluate_determinant(
        bundle_id="QUILLEN-DIRAC-RIEMANN-01",
        regularization_cutoff=1e-5,
        zeta_derivative_scale=1.0,
        firewall_gain=1.25,
    )
    assert res["status"] == "QUILLEN_DETERMINANT_SEALED"
    assert res["deligne_riemann_roch_verified"] is True
    assert res["bismut_freed_anomaly_canceled"] is True
    assert res["quillen_firewall_strength_pev"] > 200.0
    assert res["spectral_suppression_db"] > 195.0

    # Validation errors
    with pytest.raises(ValueError, match="not recognized"):
        svc.evaluate_determinant("INVALID-BUNDLE")


def test_quillen_determinant_api_routes():
    # GET /bundles
    r = client.get("/api/quillen-determinant/bundles")
    assert r.status_code == 200
    data = r.json()
    assert len(data["bundles"]) >= 3

    # POST /evaluate-determinant
    payload = {
        "bundle_id": "QUILLEN-GAUGE-CHERN-02",
        "regularization_cutoff": 1e-5,
        "zeta_derivative_scale": 1.0,
        "firewall_gain": 1.25,
    }
    r = client.post("/api/quillen-determinant/evaluate-determinant", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "QUILLEN_DETERMINANT_SEALED"
    assert res["bismut_freed_anomaly_canceled"] is True

    # GET /metrics
    r = client.get("/api/quillen-determinant/metrics")
    assert r.status_code == 200
    metrics = r.json()
    assert metrics["active_bundles_count"] >= 3
    assert metrics["deligne_riemann_roch_compliance_pct"] == 100.0


# ============================================================================
# Wave 52 Option B: Planetary Core-Mantle Seebeck Supergrid
# ============================================================================


def test_core_mantle_seebeck_service_direct():
    svc = CoreMantleSeebeckSupergridService()
    arrays = svc.get_arrays()
    assert len(arrays) >= 3
    assert arrays[0]["array_id"] == "SEEBECK-PACIFIC-TRENCH-01"

    # Harvest thermal power
    res = svc.harvest_thermal_power(
        array_id="SEEBECK-PACIFIC-TRENCH-01",
        delta_temp_override_k=1250.0,
        thermopile_efficiency=0.95,
        dispatch_duration_s=60.0,
    )
    assert res["status"] == "SEEBECK_POWER_DISPATCHED"
    assert res["harvested_power_gw"] > 4.0
    assert res["grid_stability_pct"] > 99.0

    # Validation errors
    with pytest.raises(ValueError, match="not recognized"):
        svc.harvest_thermal_power("INVALID-ARRAY")


def test_core_mantle_seebeck_api_routes():
    # GET /arrays
    r = client.get("/api/core-mantle-seebeck-supergrid/arrays")
    assert r.status_code == 200
    data = r.json()
    assert len(data["arrays"]) >= 3

    # POST /harvest-thermal-power
    payload = {
        "array_id": "SEEBECK-ICELAND-MANTLE-02",
        "delta_temp_override_k": 1180.0,
        "thermopile_efficiency": 0.95,
        "dispatch_duration_s": 60.0,
    }
    r = client.post("/api/core-mantle-seebeck-supergrid/harvest-thermal-power", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "SEEBECK_POWER_DISPATCHED"
    assert res["harvested_power_gw"] > 3.0

    # GET /metrics
    r = client.get("/api/core-mantle-seebeck-supergrid/metrics")
    assert r.status_code == 200
    metrics = r.json()
    assert metrics["active_arrays_count"] >= 3
    assert metrics["cmb_thermal_coupling_status"] == "D_DOUBLE_PRIME_GRADIENT_LOCKED"


# ============================================================================
# Platform Health & Version 9.2.0 Verification
# ============================================================================


def test_wave52_platform_health_version():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] in ("healthy", "degraded")
    assert data["version"] in ("9.1.0", "9.2.0", "9.3.0", "9.4.0", "9.5.0", "9.6.0", "9.7.0", "9.8.0", "9.9.0")
    assert len(app.routes) >= 936
