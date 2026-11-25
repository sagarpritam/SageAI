"""
Unit & API Test Suite for SageAI Wave 61 Sovereign Defense Capabilities.
Capabilities 203-205 + Option B Wave 61 (v10.1.0):
- Capability 203: Gaitsgory Categorical Geometric Langlands Shield
- Capability 204: Wiles-Taylor Modularity Lifting Barrier (R = T)
- Capability 205: Atiyah-Singer Index & Heat Kernel Anomaly Firewall
- Option B Wave 61: Planetary Geomagnetic Reversal & Multipole Flux Capacitor Supergrid
"""

import pytest
from fastapi.testclient import TestClient

from app.core.security import create_access_token
from app.main import app
from app.services.gaitsgory_categorical_langlands_shield import (
    GaitsgoryCategoricalLanglandsShieldService,
)
from app.services.wiles_taylor_modularity_lifting_barrier import (
    WilesTaylorModularityLiftingBarrierService,
)
from app.services.atiyah_singer_index_heat_kernel_firewall import (
    AtiyahSingerIndexHeatKernelFirewallService,
)
from app.services.planetary_geomagnetic_reversal_flux_capacitor_supergrid import (
    PlanetaryGeomagneticReversalFluxCapacitorSupergridService,
)

client = TestClient(app)


@pytest.fixture(autouse=True)
def auth_header():
    token = create_access_token({"sub": "test-operator", "role": "admin"})
    client.headers.update({"Authorization": f"Bearer {token}"})
    yield
    client.headers.clear()


def test_gaitsgory_categorical_langlands_service_direct():
    svc = GaitsgoryCategoricalLanglandsShieldService()
    functors = svc.get_functors()
    assert len(functors) >= 3
    assert functors[0]["functor_id"] == "GAITSGORY-INDCOH-SL2-01"

    res = svc.evaluate_categorical_equivalence(
        functor_id="GAITSGORY-INDCOH-SL2-01",
        dual_rank=2,
        nilpotent_orbit_dim=4,
        shield_gain=1.25,
    )
    assert res["status"] == "GAITSGORY_CATEGORICAL_LANGLANDS_LOCKED"
    assert res["categorical_equivalence_verified"] is True
    assert res["gaitsgory_shield_strength_pev"] > 500.0
    assert res["spectral_anomaly_suppression_db"] > 195.0
    assert res["whittaker_equivalence_defect"] < 0.10

    metrics = svc.get_metrics()
    assert metrics["active_functors_count"] >= 3
    assert metrics["evaluations_total"] >= 1
    assert metrics["categorical_langlands_compliance_pct"] == 100.0


def test_gaitsgory_categorical_langlands_api_routes():
    r = client.get("/api/gaitsgory-categorical-langlands/functors")
    assert r.status_code == 200
    assert len(r.json()["functors"]) >= 3

    r = client.post(
        "/api/gaitsgory-categorical-langlands/evaluate-categorical-equivalence",
        json={
            "functor_id": "GAITSGORY-WHITTAKER-GL3-02",
            "dual_rank": 3,
            "nilpotent_orbit_dim": 6,
            "shield_gain": 1.25,
        },
    )
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "GAITSGORY_CATEGORICAL_LANGLANDS_LOCKED"
    assert res["categorical_equivalence_verified"] is True

    r = client.get("/api/gaitsgory-categorical-langlands/metrics")
    assert r.status_code == 200
    assert r.json()["categorical_langlands_compliance_pct"] == 100.0


def test_wiles_taylor_modularity_service_direct():
    svc = WilesTaylorModularityLiftingBarrierService()
    rings = svc.get_rings()
    assert len(rings) >= 3
    assert rings[0]["ring_id"] == "WILES-FREY-SEMISTABLE-01"

    res = svc.evaluate_modularity_lifting(
        ring_id="WILES-FREY-SEMISTABLE-01",
        conductor_n=11,
        residue_prime=3,
        barrier_gain=1.25,
    )
    assert res["status"] == "WILES_TAYLOR_MODULARITY_LOCKED"
    assert res["modularity_lifting_verified"] is True
    assert res["wiles_barrier_strength_pev"] > 500.0
    assert res["galois_obstruction_suppression_db"] > 195.0
    assert res["r_equals_t_defect"] < 0.10

    metrics = svc.get_metrics()
    assert metrics["active_rings_count"] >= 3
    assert metrics["evaluations_total"] >= 1
    assert metrics["modularity_lifting_compliance_pct"] == 100.0


def test_wiles_taylor_modularity_api_routes():
    r = client.get("/api/wiles-taylor-modularity-lifting/rings")
    assert r.status_code == 200
    assert len(r.json()["rings"]) >= 3

    r = client.post(
        "/api/wiles-taylor-modularity-lifting/evaluate-modularity-lifting",
        json={
            "ring_id": "WILES-TAYLOR-PATCHING-GL2-02",
            "conductor_n": 37,
            "residue_prime": 5,
            "barrier_gain": 1.25,
        },
    )
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "WILES_TAYLOR_MODULARITY_LOCKED"
    assert res["modularity_lifting_verified"] is True

    r = client.get("/api/wiles-taylor-modularity-lifting/metrics")
    assert r.status_code == 200
    assert r.json()["modularity_lifting_compliance_pct"] == 100.0


def test_atiyah_singer_index_service_direct():
    svc = AtiyahSingerIndexHeatKernelFirewallService()
    ops = svc.get_operators()
    assert len(ops) >= 3
    assert ops[0]["operator_id"] == "ATIYAH-SINGER-DIRAC-SPIN4-01"

    res = svc.evaluate_index_heat_kernel(
        operator_id="ATIYAH-SINGER-DIRAC-SPIN4-01",
        manifold_dimension=4,
        chern_rank=2,
        firewall_gain=1.25,
    )
    assert res["status"] == "ATIYAH_SINGER_INDEX_LOCKED"
    assert res["index_theorem_verified"] is True
    assert res["atiyah_firewall_strength_pev"] > 500.0
    assert res["topological_anomaly_suppression_db"] > 195.0
    assert res["heat_kernel_anomaly_defect"] < 0.10

    metrics = svc.get_metrics()
    assert metrics["active_operators_count"] >= 3
    assert metrics["evaluations_total"] >= 1
    assert metrics["index_theorem_compliance_pct"] == 100.0


def test_atiyah_singer_index_api_routes():
    r = client.get("/api/atiyah-singer-index-heat-kernel/operators")
    assert r.status_code == 200
    assert len(r.json()["operators"]) >= 3

    r = client.post(
        "/api/atiyah-singer-index-heat-kernel/evaluate-index-heat-kernel",
        json={
            "operator_id": "ATIYAH-GETZLER-HEAT-KERNEL-02",
            "manifold_dimension": 6,
            "chern_rank": 3,
            "firewall_gain": 1.25,
        },
    )
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "ATIYAH_SINGER_INDEX_LOCKED"
    assert res["index_theorem_verified"] is True

    r = client.get("/api/atiyah-singer-index-heat-kernel/metrics")
    assert r.status_code == 200
    assert r.json()["index_theorem_compliance_pct"] == 100.0


def test_geomagnetic_flux_capacitor_service_direct():
    svc = PlanetaryGeomagneticReversalFluxCapacitorSupergridService()
    caps = svc.get_capacitors()
    assert len(caps) >= 3
    assert caps[0]["capacitor_id"] == "GEOMAG-SOUTH-ATLANTIC-ANOMALY-01"

    res = svc.harvest_geomagnetic_reversal_power(
        capacitor_id="GEOMAG-SOUTH-ATLANTIC-ANOMALY-01",
        multipole_order_override=3,
        lorentz_coupling_efficiency=0.97,
        dispatch_duration_s=60.0,
    )
    assert res["status"] == "GEOMAGNETIC_FLUX_POWER_DISPATCHED"
    assert res["harvested_power_gw"] >= 8.0
    assert res["secular_flux_mw"] > 500.0
    assert res["grid_stability_pct"] > 99.0

    metrics = svc.get_metrics()
    assert metrics["active_capacitors_count"] >= 3
    assert metrics["harvest_events_total"] >= 1
    assert metrics["geomagnetic_coupling_status"] == "MULTIPOLE_FLUX_CAPACITOR_LOCKED"


def test_geomagnetic_flux_capacitor_api_routes():
    r = client.get("/api/planetary-geomagnetic-reversal-flux-capacitor/capacitors")
    assert r.status_code == 200
    assert len(r.json()["capacitors"]) >= 3

    r = client.post(
        "/api/planetary-geomagnetic-reversal-flux-capacitor/harvest-geomagnetic-reversal-power",
        json={
            "capacitor_id": "GEOMAG-EXCURSION-FLUX-CAPACITOR-03",
            "multipole_order_override": 4,
            "lorentz_coupling_efficiency": 0.97,
            "dispatch_duration_s": 60.0,
        },
    )
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "GEOMAGNETIC_FLUX_POWER_DISPATCHED"
    assert res["harvested_power_gw"] >= 7.0

    r = client.get("/api/planetary-geomagnetic-reversal-flux-capacitor/metrics")
    assert r.status_code == 200
    assert r.json()["geomagnetic_coupling_status"] == "MULTIPOLE_FLUX_CAPACITOR_LOCKED"


def test_wave61_health_version():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["version"] in ("10.0.0", "10.1.0")
    assert data["status"] in ("healthy", "degraded")
