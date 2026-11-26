"""
Unit & API Test Suite for SageAI Wave 60 Sovereign Defense Capabilities.
Capabilities 200-202 + Option B Wave 60 (Bicentennial Milestone v10.0.0):
- Capability 200 (Bicentennial Landmark): Fargues-Fontaine Curve Vector Bundle Shield & Bun_G Geometrization
- Capability 201: Voevodsky Bloch-Kato Motivic Barrier & Norm Residue Isomorphism
- Capability 202: Donaldson Gauge Moduli Firewall & Exotic Smooth Topology Detection
- Option B Wave 60: Planetary Coupled Dynasphere Resonance Supergrid (0.1-10 mHz Bullen Standing Wave Modes)
"""

import pytest
from fastapi.testclient import TestClient

from app.core.security import create_access_token
from app.main import app
from app.services.fargues_fontaine_curve_shield import (
    FarguesFontaineCurveShieldService,
    get_fargues_fontaine_curve_shield_service,
)
from app.services.voevodsky_bloch_kato_barrier import (
    VoevodskyBlochKatoBarrierService,
    get_voevodsky_bloch_kato_barrier_service,
)
from app.services.donaldson_gauge_moduli_firewall import (
    DonaldsonGaugeModuliFirewallService,
    get_donaldson_gauge_moduli_firewall_service,
)
from app.services.planetary_coupled_dynasphere_resonance_supergrid import (
    PlanetaryCoupledDynasphereResonanceSupergridService,
    get_planetary_coupled_dynasphere_resonance_supergrid_service,
)

client = TestClient(app)


@pytest.fixture(autouse=True)
def auth_header():
    token = create_access_token({"sub": "test-operator", "role": "admin"})
    client.headers.update({"Authorization": f"Bearer {token}"})
    yield
    client.headers.clear()


# =====================================================================
# Capability 200: Fargues-Fontaine Curve Vector Bundle Shield
# =====================================================================

def test_fargues_fontaine_service_direct():
    svc = FarguesFontaineCurveShieldService()
    bundles = svc.get_bundles()
    assert len(bundles) >= 3
    assert bundles[0]["bundle_id"] == "FF-CURVE-RANK2-SLOPE0-01"

    # Evaluate vector bundle slope
    res = svc.evaluate_vector_bundle_slope(
        bundle_id="FF-CURVE-RANK2-SLOPE0-01",
        bundle_rank=2,
        bundle_degree=0,
        shield_gain=1.25,
    )
    assert res["status"] == "FARGUES_FONTAINE_SLOPE_LOCKED"
    assert res["harder_narasimhan_verified"] is True
    assert res["fargues_shield_strength_pev"] > 500.0
    assert res["slope_leakage_suppression_db"] > 195.0
    assert res["slope_semistability_defect"] < 0.10

    metrics = svc.get_metrics()
    assert metrics["active_bundles_count"] >= 3
    assert metrics["evaluations_total"] >= 1
    assert metrics["harder_narasimhan_compliance_pct"] == 100.0


def test_fargues_fontaine_api_routes():
    # GET /bundles
    r = client.get("/api/fargues-fontaine-curve/bundles")
    assert r.status_code == 200
    data = r.json()
    assert len(data["bundles"]) >= 3

    # POST /evaluate-vector-bundle-slope
    payload = {
        "bundle_id": "FF-CURVE-STABLE-SLOPE-HALF-02",
        "bundle_rank": 2,
        "bundle_degree": 1,
        "shield_gain": 1.25,
    }
    r = client.post("/api/fargues-fontaine-curve/evaluate-vector-bundle-slope", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "FARGUES_FONTAINE_SLOPE_LOCKED"
    assert res["harder_narasimhan_verified"] is True

    # GET /metrics
    r = client.get("/api/fargues-fontaine-curve/metrics")
    assert r.status_code == 200
    m = r.json()
    assert m["harder_narasimhan_compliance_pct"] == 100.0


# =====================================================================
# Capability 201: Voevodsky Bloch-Kato Motivic Barrier
# =====================================================================

def test_voevodsky_bloch_kato_service_direct():
    svc = VoevodskyBlochKatoBarrierService()
    complexes = svc.get_complexes()
    assert len(complexes) >= 3
    assert complexes[0]["complex_id"] == "VOEVODSKY-MILNOR-K3-01"

    # Evaluate norm residue isomorphism
    res = svc.evaluate_norm_residue_isomorphism(
        complex_id="VOEVODSKY-MILNOR-K3-01",
        prime_l=2,
        weight_n=3,
        barrier_gain=1.25,
    )
    assert res["status"] == "VOEVODSKY_BLOCH_KATO_LOCKED"
    assert res["norm_residue_verified"] is True
    assert res["voevodsky_barrier_strength_pev"] > 500.0
    assert res["galois_torsion_suppression_db"] > 195.0
    assert res["norm_residue_defect"] < 0.10

    metrics = svc.get_metrics()
    assert metrics["active_complexes_count"] >= 3
    assert metrics["evaluations_total"] >= 1
    assert metrics["bloch_kato_compliance_pct"] == 100.0


def test_voevodsky_bloch_kato_api_routes():
    # GET /complexes
    r = client.get("/api/voevodsky-bloch-kato/complexes")
    assert r.status_code == 200
    data = r.json()
    assert len(data["complexes"]) >= 3

    # POST /evaluate-norm-residue-isomorphism
    payload = {
        "complex_id": "VOEVODSKY-MOTIVIC-K4-02",
        "prime_l": 3,
        "weight_n": 4,
        "barrier_gain": 1.25,
    }
    r = client.post("/api/voevodsky-bloch-kato/evaluate-norm-residue-isomorphism", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "VOEVODSKY_BLOCH_KATO_LOCKED"
    assert res["norm_residue_verified"] is True

    # GET /metrics
    r = client.get("/api/voevodsky-bloch-kato/metrics")
    assert r.status_code == 200
    m = r.json()
    assert m["bloch_kato_compliance_pct"] == 100.0


# =====================================================================
# Capability 202: Donaldson Gauge Moduli Firewall
# =====================================================================

def test_donaldson_gauge_service_direct():
    svc = DonaldsonGaugeModuliFirewallService()
    manifolds = svc.get_manifolds()
    assert len(manifolds) >= 3
    assert manifolds[0]["manifold_id"] == "DONALDSON-K3-SURFACE-01"

    # Evaluate Donaldson invariants
    res = svc.evaluate_donaldson_invariants(
        manifold_id="DONALDSON-K3-SURFACE-01",
        second_chern_number=2,
        b2_plus=3,
        firewall_gain=1.25,
    )
    assert res["status"] == "DONALDSON_GAUGE_MODULI_LOCKED"
    assert res["smoothness_verified"] is True
    assert res["donaldson_firewall_strength_pev"] > 500.0
    assert res["exotic_topology_suppression_db"] > 195.0
    assert res["gauge_moduli_defect"] < 0.10

    metrics = svc.get_metrics()
    assert metrics["active_manifolds_count"] >= 3
    assert metrics["evaluations_total"] >= 1
    assert metrics["donaldson_moduli_compliance_pct"] == 100.0


def test_donaldson_gauge_api_routes():
    # GET /manifolds
    r = client.get("/api/donaldson-gauge-moduli/manifolds")
    assert r.status_code == 200
    data = r.json()
    assert len(data["manifolds"]) >= 3

    # POST /evaluate-donaldson-invariants
    payload = {
        "manifold_id": "DONALDSON-EXOTIC-CP2-NINE-02",
        "second_chern_number": 3,
        "b2_plus": 1,
        "firewall_gain": 1.25,
    }
    r = client.post("/api/donaldson-gauge-moduli/evaluate-donaldson-invariants", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "DONALDSON_GAUGE_MODULI_LOCKED"
    assert res["smoothness_verified"] is True

    # GET /metrics
    r = client.get("/api/donaldson-gauge-moduli/metrics")
    assert r.status_code == 200
    m = r.json()
    assert m["donaldson_moduli_compliance_pct"] == 100.0


# =====================================================================
# Option B Wave 60: Planetary Coupled Dynasphere Resonance Supergrid
# =====================================================================

def test_coupled_dynasphere_service_direct():
    svc = PlanetaryCoupledDynasphereResonanceSupergridService()
    nodes = svc.get_nodes()
    assert len(nodes) >= 3
    assert nodes[0]["node_id"] == "DYNASPHERE-WHOLE-EARTH-RESONATOR-01"

    # Harvest dynasphere resonance power
    res = svc.harvest_dynasphere_resonance_power(
        node_id="DYNASPHERE-WHOLE-EARTH-RESONATOR-01",
        resonance_multiplier_override=1.05,
        telluric_waveguide_efficiency=0.96,
        dispatch_duration_s=60.0,
    )
    assert res["status"] == "DYNASPHERE_POWER_DISPATCHED"
    assert res["harvested_power_gw"] >= 7.5
    assert res["standing_wave_flux_mw"] > 400.0
    assert res["grid_stability_pct"] > 99.0

    metrics = svc.get_metrics()
    assert metrics["active_nodes_count"] >= 3
    assert metrics["harvest_events_total"] >= 1
    assert metrics["dynasphere_coupling_status"] == "COUPLED_DYNASPHERE_RESONANCE_LOCKED"


def test_coupled_dynasphere_api_routes():
    # GET /nodes
    r = client.get("/api/planetary-coupled-dynasphere-resonance/nodes")
    assert r.status_code == 200
    data = r.json()
    assert len(data["nodes"]) >= 3

    # POST /harvest-dynasphere-resonance-power
    payload = {
        "node_id": "DYNASPHERE-CMB-ICB-INTERFERENCE-02",
        "resonance_multiplier_override": 1.10,
        "telluric_waveguide_efficiency": 0.96,
        "dispatch_duration_s": 60.0,
    }
    r = client.post("/api/planetary-coupled-dynasphere-resonance/harvest-dynasphere-resonance-power", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "DYNASPHERE_POWER_DISPATCHED"
    assert res["harvested_power_gw"] >= 4.0

    # GET /metrics
    r = client.get("/api/planetary-coupled-dynasphere-resonance/metrics")
    assert r.status_code == 200
    m = r.json()
    assert m["dynasphere_coupling_status"] == "COUPLED_DYNASPHERE_RESONANCE_LOCKED"


# =====================================================================
# Wave 60 Root Health & Bicentennial Milestone Check
# =====================================================================

def test_wave60_health_version():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["version"] in ("9.9.0", "10.0.0", "10.1.0", "10.2.0", "10.3.0", "10.4.0", "10.5.0", "10.6.0", "10.7.0", "10.8.0", "10.9.0", "11.0.0", "11.1.0")
    assert data["status"] in ("healthy", "degraded")
