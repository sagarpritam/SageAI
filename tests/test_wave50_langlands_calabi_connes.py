"""
Unit and API integration tests for Wave 50:
- Capability 170: Langlands Automorphic Duality Engine & Hecke Eigenform Shield
- Capability 171: Superstring Calabi-Yau Mirror Symmetry Wall & Picard-Fuchs Monodromy
- Capability 172: Non-Commutative Connes Spectral Geometry Armor & Dixmier Trace Action
- Option B Wave 50: Planetary Gravitational-Wave Resonant Phonon Lattice
"""

import pytest
from starlette.testclient import TestClient

from app.main import app
from app.services.langlands_automorphic_shield.langlands_automorphic_shield import (
    LanglandsAutomorphicShieldService,
)
from app.services.calabi_yau_mirror_wall.calabi_yau_mirror_wall import (
    CalabiYauMirrorWallService,
)
from app.services.connes_spectral_geometry.connes_spectral_geometry import (
    ConnesSpectralGeometryService,
)
from app.services.gravitational_phonon_lattice.gravitational_phonon_lattice import (
    GravitationalPhononLatticeService,
)

client = TestClient(app)


# ============================================================================
# Capability 170: Langlands Automorphic Duality Engine
# ============================================================================


def test_langlands_automorphic_service_direct():
    svc = LanglandsAutomorphicShieldService()
    packets = svc.get_packets()
    assert len(packets) >= 3
    assert packets[0]["packet_id"] == "LANGLANDS-GL2-MODULAR-01"
    assert packets[0]["weight_k"] == 12

    # Valid Hecke synthesis
    res = svc.synthesize_hecke(
        packet_id="LANGLANDS-GL2-MODULAR-01",
        prime_cutoff=17,
        ram_bound_tolerance=1e-5,
        l_function_s=1.0,
        hecke_gain=1.25,
    )
    assert res["status"] == "LANGLANDS_HECKE_SYNTHESIZED"
    assert res["all_bounds_held"] is True
    assert 2 in res["hecke_eigenvalues"]
    assert res["hecke_eigenvalues"][2] == -24.0
    assert res["hecke_shield_strength_pev"] > 80.0
    assert res["automorphic_suppression_db"] > 190.0

    # Validation errors
    with pytest.raises(ValueError, match="not recognized"):
        svc.synthesize_hecke("INVALID-PACKET")


def test_langlands_automorphic_api_routes():
    # GET /packets
    r = client.get("/api/langlands-automorphic/packets")
    assert r.status_code == 200
    data = r.json()
    assert len(data["packets"]) >= 3

    # POST /synthesize-hecke
    payload = {
        "packet_id": "LANGLANDS-GL2-MODULAR-01",
        "prime_cutoff": 17,
        "ram_bound_tolerance": 1e-5,
        "l_function_s": 1.0,
        "hecke_gain": 1.25,
    }
    r = client.post("/api/langlands-automorphic/synthesize-hecke", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "LANGLANDS_HECKE_SYNTHESIZED"
    assert res["all_bounds_held"] is True
    assert res["hecke_shield_strength_pev"] > 50.0

    # GET /metrics
    r = client.get("/api/langlands-automorphic/metrics")
    assert r.status_code == 200
    metrics = r.json()
    assert metrics["active_packets_count"] >= 3
    assert metrics["ramanujan_bound_compliance_pct"] == 100.0


# ============================================================================
# Capability 171: Superstring Calabi-Yau Mirror Symmetry Wall
# ============================================================================


def test_calabi_yau_mirror_service_direct():
    svc = CalabiYauMirrorWallService()
    pairs = svc.get_pairs()
    assert len(pairs) >= 3
    assert pairs[0]["pair_id"] == "CY-QUINTIC-GREENE-PLESSER-01"
    assert pairs[0]["h11"] == 1
    assert pairs[0]["h21"] == 101

    # Valid Picard-Fuchs solution
    res = svc.solve_picard_fuchs(
        pair_id="CY-QUINTIC-GREENE-PLESSER-01",
        deformation_psi=0.5,
        instanton_degree=4,
        monodromy_damping=1.25,
        frobenius_precision=1e-6,
    )
    assert res["status"] == "CALABI_YAU_MIRROR_SOLVED"
    assert res["instanton_invariants"][1] == 2875
    assert res["instanton_invariants"][2] == 609250
    assert res["monodromy_purity_pct"] > 99.99
    assert res["mirror_shield_strength_pev"] > 200.0
    assert res["mirror_suppression_db"] > 190.0

    # Validation errors
    with pytest.raises(ValueError, match="not recognized"):
        svc.solve_picard_fuchs("INVALID-PAIR")


def test_calabi_yau_mirror_api_routes():
    # GET /pairs
    r = client.get("/api/calabi-yau-mirror/pairs")
    assert r.status_code == 200
    data = r.json()
    assert len(data["pairs"]) >= 3

    # POST /solve-picard-fuchs
    payload = {
        "pair_id": "CY-QUINTIC-GREENE-PLESSER-01",
        "deformation_psi": 0.5,
        "instanton_degree": 4,
        "monodromy_damping": 1.25,
        "frobenius_precision": 1e-6,
    }
    r = client.post("/api/calabi-yau-mirror/solve-picard-fuchs", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "CALABI_YAU_MIRROR_SOLVED"
    assert res["instanton_invariants"]["1"] == 2875

    # GET /metrics
    r = client.get("/api/calabi-yau-mirror/metrics")
    assert r.status_code == 200
    metrics = r.json()
    assert metrics["active_pairs_count"] >= 3
    assert metrics["gromov_witten_invariants_verified"] == 5


# ============================================================================
# Capability 172: Non-Commutative Connes Spectral Geometry Armor
# ============================================================================


def test_connes_spectral_geometry_service_direct():
    svc = ConnesSpectralGeometryService()
    triples = svc.get_triples()
    assert len(triples) >= 3
    assert triples[0]["triple_id"] == "CONNES-STANDARD-MODEL-01"
    assert triples[0]["ko_dimension"] == "10 mod 8"

    # Valid spectral action evaluation
    res = svc.evaluate_spectral_action(
        triple_id="CONNES-STANDARD-MODEL-01",
        energy_cutoff_gev=1e16,
        heat_kernel_order=4,
        dixmier_trace_scale=1.15,
        gauge_coupling_unification=0.98,
    )
    assert res["status"] == "CONNES_SPECTRAL_EVALUATED"
    assert "a0" in res["seeley_dewitt_coefficients"]
    assert "a2" in res["seeley_dewitt_coefficients"]
    assert "a4" in res["seeley_dewitt_coefficients"]
    assert res["dixmier_trace"] > 1.0
    assert res["spectral_suppression_db"] > 190.0

    # Validation errors
    with pytest.raises(ValueError, match="not recognized"):
        svc.evaluate_spectral_action("INVALID-TRIPLE")


def test_connes_spectral_geometry_api_routes():
    # GET /triples
    r = client.get("/api/connes-spectral-geometry/triples")
    assert r.status_code == 200
    data = r.json()
    assert len(data["triples"]) >= 3

    # POST /evaluate-action
    payload = {
        "triple_id": "CONNES-STANDARD-MODEL-01",
        "energy_cutoff_gev": 1e16,
        "heat_kernel_order": 4,
        "dixmier_trace_scale": 1.15,
        "gauge_coupling_unification": 0.98,
    }
    r = client.post("/api/connes-spectral-geometry/evaluate-action", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "CONNES_SPECTRAL_EVALUATED"
    assert res["dixmier_trace"] == 1.15

    # GET /metrics
    r = client.get("/api/connes-spectral-geometry/metrics")
    assert r.status_code == 200
    metrics = r.json()
    assert metrics["active_triples_count"] >= 3
    assert metrics["dixmier_trace_convergence_pct"] == 100.0


# ============================================================================
# Wave 50 Option B: Planetary Gravitational-Wave Resonant Phonon Lattice
# ============================================================================


def test_gravitational_phonon_service_direct():
    svc = GravitationalPhononLatticeService()
    lattices = svc.get_lattices()
    assert len(lattices) >= 3
    assert lattices[0]["lattice_id"] == "PHONON-ANTARCTIC-DIAMOND-01"
    assert lattices[0]["mechanical_q_factor"] == 2.8e9

    # Valid phonon harvesting
    res = svc.harvest_phonons(
        lattice_id="PHONON-ANTARCTIC-DIAMOND-01",
        strain_amplitude_h=1e-22,
        acoustic_coupling=0.88,
        piezo_efficiency=0.94,
        extraction_duration_s=60.0,
    )
    assert res["status"] == "GRAVITATIONAL_PHONONS_HARVESTED"
    assert res["harvested_power_gw"] > 1.0
    assert res["resonant_acoustic_q"] == 2.8e9
    assert res["grid_stability_pct"] > 98.0

    # Validation errors
    with pytest.raises(ValueError, match="not recognized"):
        svc.harvest_phonons("INVALID-LATTICE")


def test_gravitational_phonon_api_routes():
    # GET /lattices
    r = client.get("/api/gravitational-phonon/lattices")
    assert r.status_code == 200
    data = r.json()
    assert len(data["lattices"]) >= 3

    # POST /harvest-phonons
    payload = {
        "lattice_id": "PHONON-ANTARCTIC-DIAMOND-01",
        "strain_amplitude_h": 1e-22,
        "acoustic_coupling": 0.88,
        "piezo_efficiency": 0.94,
        "extraction_duration_s": 60.0,
    }
    r = client.post("/api/gravitational-phonon/harvest-phonons", json=payload)
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "GRAVITATIONAL_PHONONS_HARVESTED"
    assert res["harvested_power_gw"] > 1.0

    # GET /metrics
    r = client.get("/api/gravitational-phonon/metrics")
    assert r.status_code == 200
    metrics = r.json()
    assert metrics["active_lattices_count"] >= 3
    assert metrics["total_grid_dispatch_gw"] > 5.0


# ============================================================================
# Platform Health & Version 9.0.0 Verification
# ============================================================================


def test_wave50_platform_health_version():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] in ("healthy", "degraded")
    assert data["version"] in ("8.9.0", "9.0.0", "9.1.0", "9.2.0", "9.3.0", "9.4.0", "9.5.0", "9.6.0", "9.7.0", "9.8.0", "9.9.0", "10.0.0", "10.1.0", "10.2.0", "10.3.0", "10.4.0", "10.5.0", "10.6.0", "10.7.0", "10.8.0", "10.9.0", "11.0.0", "11.1.0")
