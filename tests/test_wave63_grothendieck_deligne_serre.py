"""
Unit & API Test Suite for SageAI Wave 63 Sovereign Defense Capabilities.
Capabilities 209-211 + Option B Wave 63 (v10.3.0):
- Capability 209: Grothendieck Standard Conjectures & Lefschetz Motive Shield
- Capability 210: Hodge-Deligne Mixed Hodge Structures & Griffiths Transversality Barrier
- Capability 211: Serre-Tate Canonical Lift & p-Divisible Group Firewall
- Option B Wave 63: Planetary Telluric Schumann Cavity Waveguide Supergrid
"""

import pytest
from fastapi.testclient import TestClient

from app.core.security import create_access_token
from app.main import app
from app.services.grothendieck_standard_conjectures_lefschetz_shield import (
    GrothendieckStandardConjecturesLefschetzShieldService,
)
from app.services.hodge_deligne_mixed_motives_barrier import (
    HodgeDeligneMixedMotivesBarrierService,
)
from app.services.serre_tate_canonical_lift_firewall import (
    SerreTateCanonicalLiftFirewallService,
)
from app.services.planetary_telluric_schumann_cavity_waveguide_supergrid import (
    PlanetaryTelluricSchumannCavityWaveguideSupergridService,
)

client = TestClient(app)


@pytest.fixture(autouse=True)
def auth_header():
    token = create_access_token({"sub": "test-operator", "role": "admin"})
    client.headers.update({"Authorization": f"Bearer {token}"})
    yield
    client.headers.clear()


def test_grothendieck_conjectures_service_direct():
    svc = GrothendieckStandardConjecturesLefschetzShieldService()
    motives = svc.get_motives()
    assert len(motives) >= 3
    assert motives[0]["motive_id"] == "GROTHENDIECK-CHOW-K3-01"

    res = svc.evaluate_standard_conjectures(
        motive_id="GROTHENDIECK-CHOW-K3-01",
        cycle_codimension=1,
        lefschetz_degree=2,
        shield_gain=1.25,
    )
    assert res["status"] == "GROTHENDIECK_STANDARD_CONJECTURES_LOCKED"
    assert res["semisimple_verified"] is True
    assert res["grothendieck_shield_strength_pev"] > 500.0
    assert res["cycle_equivalence_suppression_db"] > 195.0
    assert res["numerical_homological_defect"] < 0.10

    metrics = svc.get_metrics()
    assert metrics["active_motives_count"] >= 3
    assert metrics["evaluations_total"] >= 1
    assert metrics["standard_conjectures_compliance_pct"] == 100.0


def test_grothendieck_conjectures_api_routes():
    r = client.get("/api/grothendieck-standard-conjectures/motives")
    assert r.status_code == 200
    assert len(r.json()["motives"]) >= 3

    r = client.post(
        "/api/grothendieck-standard-conjectures/evaluate-standard-conjectures",
        json={
            "motive_id": "GROTHENDIECK-ABELIAN-4FOLD-02",
            "cycle_codimension": 2,
            "lefschetz_degree": 4,
            "shield_gain": 1.25,
        },
    )
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "GROTHENDIECK_STANDARD_CONJECTURES_LOCKED"
    assert res["semisimple_verified"] is True

    r = client.get("/api/grothendieck-standard-conjectures/metrics")
    assert r.status_code == 200
    assert r.json()["standard_conjectures_compliance_pct"] == 100.0


def test_hodge_deligne_service_direct():
    svc = HodgeDeligneMixedMotivesBarrierService()
    structs = svc.get_structures()
    assert len(structs) >= 3
    assert structs[0]["structure_id"] == "DELIGNE-MIXED-HODGE-01"

    res = svc.evaluate_mixed_hodge(
        structure_id="DELIGNE-MIXED-HODGE-01",
        weight_filtration_k=2,
        hodge_filtration_p=1,
        barrier_gain=1.25,
    )
    assert res["status"] == "HODGE_DELIGNE_MIXED_LOCKED"
    assert res["transversality_verified"] is True
    assert res["deligne_barrier_strength_pev"] > 500.0
    assert res["weight_leakage_suppression_db"] > 195.0
    assert res["griffiths_transversality_defect"] < 0.10

    metrics = svc.get_metrics()
    assert metrics["active_structures_count"] >= 3
    assert metrics["evaluations_total"] >= 1
    assert metrics["mixed_hodge_compliance_pct"] == 100.0


def test_hodge_deligne_api_routes():
    r = client.get("/api/hodge-deligne-mixed-motives/structures")
    assert r.status_code == 200
    assert len(r.json()["structures"]) >= 3

    r = client.post(
        "/api/hodge-deligne-mixed-motives/evaluate-mixed-hodge",
        json={
            "structure_id": "DELIGNE-GRIFFITHS-VHS-02",
            "weight_filtration_k": 3,
            "hodge_filtration_p": 2,
            "barrier_gain": 1.25,
        },
    )
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "HODGE_DELIGNE_MIXED_LOCKED"
    assert res["transversality_verified"] is True

    r = client.get("/api/hodge-deligne-mixed-motives/metrics")
    assert r.status_code == 200
    assert r.json()["mixed_hodge_compliance_pct"] == 100.0


def test_serre_tate_service_direct():
    svc = SerreTateCanonicalLiftFirewallService()
    lifts = svc.get_lifts()
    assert len(lifts) >= 3
    assert lifts[0]["lift_id"] == "SERRE-TATE-WITT-LIFT-01"

    res = svc.evaluate_canonical_lift(
        lift_id="SERRE-TATE-WITT-LIFT-01",
        prime_p=5,
        abelian_dimension_g=2,
        firewall_gain=1.25,
    )
    assert res["status"] == "SERRE_TATE_CANONICAL_LIFT_LOCKED"
    assert res["canonical_lift_verified"] is True
    assert res["serre_tate_firewall_strength_pev"] > 500.0
    assert res["p_divisible_suppression_db"] > 195.0
    assert res["witt_deformation_defect"] < 0.10

    metrics = svc.get_metrics()
    assert metrics["active_lifts_count"] >= 3
    assert metrics["evaluations_total"] >= 1
    assert metrics["canonical_lift_compliance_pct"] == 100.0


def test_serre_tate_api_routes():
    r = client.get("/api/serre-tate-canonical-lift/lifts")
    assert r.status_code == 200
    assert len(r.json()["lifts"]) >= 3

    r = client.post(
        "/api/serre-tate-canonical-lift/evaluate-canonical-lift",
        json={
            "lift_id": "SERRE-TATE-BARSOTTI-TATE-02",
            "prime_p": 7,
            "abelian_dimension_g": 3,
            "firewall_gain": 1.25,
        },
    )
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "SERRE_TATE_CANONICAL_LIFT_LOCKED"
    assert res["canonical_lift_verified"] is True

    r = client.get("/api/serre-tate-canonical-lift/metrics")
    assert r.status_code == 200
    assert r.json()["canonical_lift_compliance_pct"] == 100.0


def test_schumann_cavity_service_direct():
    svc = PlanetaryTelluricSchumannCavityWaveguideSupergridService()
    cavs = svc.get_cavities()
    assert len(cavs) >= 3
    assert cavs[0]["cavity_id"] == "SCHUMANN-FUNDAMENTAL-783HZ-01"

    res = svc.harvest_schumann_cavity_power(
        cavity_id="SCHUMANN-FUNDAMENTAL-783HZ-01",
        q_factor_multiplier=1.05,
        waveguide_efficiency=0.98,
        dispatch_duration_s=60.0,
    )
    assert res["status"] == "SCHUMANN_CAVITY_POWER_DISPATCHED"
    assert res["harvested_power_gw"] >= 8.5
    assert res["cavity_flux_mw"] > 500.0
    assert res["grid_stability_pct"] > 99.0

    metrics = svc.get_metrics()
    assert metrics["active_cavities_count"] >= 3
    assert metrics["harvest_events_total"] >= 1
    assert metrics["schumann_coupling_status"] == "SCHUMANN_CAVITY_RESONANCE_LOCKED"


def test_schumann_cavity_api_routes():
    r = client.get("/api/planetary-telluric-schumann-cavity/cavities")
    assert r.status_code == 200
    assert len(r.json()["cavities"]) >= 3

    r = client.post(
        "/api/planetary-telluric-schumann-cavity/harvest-schumann-cavity-power",
        json={
            "cavity_id": "SCHUMANN-THIRD-HARMONIC-208HZ-03",
            "q_factor_multiplier": 1.05,
            "waveguide_efficiency": 0.98,
            "dispatch_duration_s": 60.0,
        },
    )
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "SCHUMANN_CAVITY_POWER_DISPATCHED"
    assert res["harvested_power_gw"] >= 8.0

    r = client.get("/api/planetary-telluric-schumann-cavity/metrics")
    assert r.status_code == 200
    assert r.json()["schumann_coupling_status"] == "SCHUMANN_CAVITY_RESONANCE_LOCKED"


def test_wave63_health_version():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["version"] in ("10.2.0", "10.3.0", "10.4.0", "10.5.0", "10.6.0", "10.7.0", "10.8.0", "10.9.0", "11.0.0", "11.1.0", "11.2.0", "11.3.0", "11.4.0", "11.5.0", "11.6.0", "11.7.0")
    assert data["status"] in ("healthy", "degraded")
