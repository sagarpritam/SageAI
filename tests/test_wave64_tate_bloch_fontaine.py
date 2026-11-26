"""
Unit & API Test Suite for SageAI Wave 64 Sovereign Defense Capabilities.
Capabilities 212-214 + Option B Wave 64 (v10.4.0):
- Capability 212: Tate-Shafarevich Group & Selmer Descent Shield
- Capability 213: Bloch-Kato Tamagawa Number & Euler System Barrier
- Capability 214: Fontaine-Mazur Galois Geometricity Firewall
- Option B Wave 64: Planetary Piezoelectric Tectonic Subduction Supergrid
"""

import pytest
from fastapi.testclient import TestClient

from app.core.security import create_access_token
from app.main import app
from app.services.tate_shafarevich_selmer_descent_shield import (
    TateShafarevichSelmerDescentShieldService,
)
from app.services.bloch_kato_tamagawa_number_barrier import (
    BlochKatoTamagawaNumberBarrierService,
)
from app.services.fontaine_mazur_galois_geometricity_firewall import (
    FontaineMazurGaloisGeometricityFirewallService,
)
from app.services.planetary_piezoelectric_tectonic_subduction_supergrid import (
    PlanetaryPiezoelectricTectonicSubductionSupergridService,
)

client = TestClient(app)


@pytest.fixture(autouse=True)
def auth_header():
    token = create_access_token({"sub": "test-operator", "role": "admin"})
    client.headers.update({"Authorization": f"Bearer {token}"})
    yield
    client.headers.clear()


def test_tate_shafarevich_service_direct():
    svc = TateShafarevichSelmerDescentShieldService()
    curves = svc.get_curves()
    assert len(curves) >= 3
    assert curves[0]["curve_id"] == "SHA-BSD-RANK1-01"

    res = svc.evaluate_selmer_descent(
        curve_id="SHA-BSD-RANK1-01",
        selmer_rank=1,
        sha_order=1,
        shield_gain=1.25,
    )
    assert res["status"] == "TATE_SHAFAREVICH_SELMER_LOCKED"
    assert res["descent_verified"] is True
    assert res["tate_shield_strength_pev"] > 500.0
    assert res["sha_obstruction_suppression_db"] > 195.0
    assert res["selmer_descent_defect"] < 0.10

    metrics = svc.get_metrics()
    assert metrics["active_curves_count"] >= 3
    assert metrics["evaluations_total"] >= 1
    assert metrics["selmer_descent_compliance_pct"] == 100.0


def test_tate_shafarevich_api_routes():
    r = client.get("/api/tate-shafarevich-selmer/curves")
    assert r.status_code == 200
    assert len(r.json()["curves"]) >= 3

    r = client.post(
        "/api/tate-shafarevich-selmer/evaluate-selmer-descent",
        json={"curve_id": "SHA-HEEGNER-POINT-02", "selmer_rank": 1, "sha_order": 4, "shield_gain": 1.25},
    )
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "TATE_SHAFAREVICH_SELMER_LOCKED"
    assert res["descent_verified"] is True

    r = client.get("/api/tate-shafarevich-selmer/metrics")
    assert r.status_code == 200
    assert r.json()["selmer_descent_compliance_pct"] == 100.0


def test_bloch_kato_tamagawa_service_direct():
    svc = BlochKatoTamagawaNumberBarrierService()
    systems = svc.get_systems()
    assert len(systems) >= 3
    assert systems[0]["system_id"] == "TAMAGAWA-CYCLOTOMIC-Z-01"

    res = svc.evaluate_tamagawa_number(
        system_id="TAMAGAWA-CYCLOTOMIC-Z-01",
        motive_weight=2,
        tamagawa_product=1,
        barrier_gain=1.25,
    )
    assert res["status"] == "BLOCH_KATO_TAMAGAWA_LOCKED"
    assert res["tamagawa_verified"] is True
    assert res["tamagawa_barrier_strength_pev"] > 500.0
    assert res["euler_system_suppression_db"] > 195.0
    assert res["l_value_regulator_defect"] < 0.10

    metrics = svc.get_metrics()
    assert metrics["active_systems_count"] >= 3
    assert metrics["evaluations_total"] >= 1
    assert metrics["tamagawa_compliance_pct"] == 100.0


def test_bloch_kato_tamagawa_api_routes():
    r = client.get("/api/bloch-kato-tamagawa/systems")
    assert r.status_code == 200
    assert len(r.json()["systems"]) >= 3

    r = client.post(
        "/api/bloch-kato-tamagawa/evaluate-tamagawa-number",
        json={"system_id": "TAMAGAWA-MODULAR-FORM-02", "motive_weight": 4, "tamagawa_product": 2, "barrier_gain": 1.25},
    )
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "BLOCH_KATO_TAMAGAWA_LOCKED"
    assert res["tamagawa_verified"] is True

    r = client.get("/api/bloch-kato-tamagawa/metrics")
    assert r.status_code == 200
    assert r.json()["tamagawa_compliance_pct"] == 100.0


def test_fontaine_mazur_service_direct():
    svc = FontaineMazurGaloisGeometricityFirewallService()
    reps = svc.get_representations()
    assert len(reps) >= 3
    assert reps[0]["rep_id"] == "FONTAINE-MAZUR-GL2-DE-RHAM-01"

    res = svc.evaluate_galois_geometricity(
        rep_id="FONTAINE-MAZUR-GL2-DE-RHAM-01",
        prime_p=5,
        hodge_tate_span=2,
        firewall_gain=1.25,
    )
    assert res["status"] == "FONTAINE_MAZUR_GEOMETRIC_LOCKED"
    assert res["geometric_verified"] is True
    assert res["fontaine_firewall_strength_pev"] > 500.0
    assert res["non_geometric_suppression_db"] > 195.0
    assert res["de_rham_ramification_defect"] < 0.10

    metrics = svc.get_metrics()
    assert metrics["active_representations_count"] >= 3
    assert metrics["evaluations_total"] >= 1
    assert metrics["geometric_compliance_pct"] == 100.0


def test_fontaine_mazur_api_routes():
    r = client.get("/api/fontaine-mazur-geometricity/representations")
    assert r.status_code == 200
    assert len(r.json()["representations"]) >= 3

    r = client.post(
        "/api/fontaine-mazur-geometricity/evaluate-galois-geometricity",
        json={"rep_id": "FONTAINE-MAZUR-KISIN-POTENTIAL-02", "prime_p": 7, "hodge_tate_span": 4, "firewall_gain": 1.25},
    )
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "FONTAINE_MAZUR_GEOMETRIC_LOCKED"
    assert res["geometric_verified"] is True

    r = client.get("/api/fontaine-mazur-geometricity/metrics")
    assert r.status_code == 200
    assert r.json()["geometric_compliance_pct"] == 100.0


def test_piezo_subduction_service_direct():
    svc = PlanetaryPiezoelectricTectonicSubductionSupergridService()
    slabs = svc.get_slabs()
    assert len(slabs) >= 3
    assert slabs[0]["slab_id"] == "SUBDUCTION-CASCADIA-MEGATHRUST-01"

    res = svc.harvest_tectonic_piezo_power(
        slab_id="SUBDUCTION-CASCADIA-MEGATHRUST-01",
        strain_multiplier=1.05,
        piezo_efficiency=0.982,
        dispatch_duration_s=60.0,
    )
    assert res["status"] == "TECTONIC_PIEZO_POWER_DISPATCHED"
    assert res["harvested_power_gw"] >= 9.0
    assert res["piezo_flux_mw"] > 500.0
    assert res["grid_stability_pct"] > 99.0

    metrics = svc.get_metrics()
    assert metrics["active_slabs_count"] >= 3
    assert metrics["harvest_events_total"] >= 1
    assert metrics["subduction_coupling_status"] == "PIEZO_SUBDUCTION_STRESS_LOCKED"


def test_piezo_subduction_api_routes():
    r = client.get("/api/planetary-piezoelectric-tectonic-subduction/slabs")
    assert r.status_code == 200
    assert len(r.json()["slabs"]) >= 3

    r = client.post(
        "/api/planetary-piezoelectric-tectonic-subduction/harvest-tectonic-piezo-power",
        json={"slab_id": "SUBDUCTION-MARIANA-TRENCH-03", "strain_multiplier": 1.05, "piezo_efficiency": 0.982, "dispatch_duration_s": 60.0},
    )
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "TECTONIC_PIEZO_POWER_DISPATCHED"
    assert res["harvested_power_gw"] >= 8.5

    r = client.get("/api/planetary-piezoelectric-tectonic-subduction/metrics")
    assert r.status_code == 200
    assert r.json()["subduction_coupling_status"] == "PIEZO_SUBDUCTION_STRESS_LOCKED"


def test_wave64_health_version():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["version"] in ("10.3.0", "10.4.0", "10.5.0", "10.6.0")
    assert data["status"] in ("healthy", "degraded")
