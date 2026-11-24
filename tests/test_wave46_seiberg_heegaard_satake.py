"""
Wave 46 Tests: Seiberg-Witten Monopole Invariants & Spin^c 4-Manifold Shield (Cap 158),
Heegaard Floer Homology & Bordered Contact Firewall (Cap 159),
Geometric Satake Equivalence & Affine Springer Shield (Cap 160),
and Option B Wave 46: Planetary Room-Temperature LK-99 Diamagnetic Supergrid.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.geometric_satake_affine import (
    get_geometric_satake_affine_shield,
)
from app.services.heegaard_floer_bordered import (
    get_heegaard_floer_bordered_firewall,
)
from app.services.room_temp_diamagnetic_supergrid import (
    get_room_temp_diamagnetic_supergrid,
)
from app.services.seiberg_witten_monopole import (
    get_seiberg_witten_monopole_shield,
)

client = TestClient(app)


def test_seiberg_witten_monopole_endpoints():
    res = client.get("/api/seiberg-witten-monopole/monopoles")
    assert res.status_code == 200
    monopoles = res.json()["monopoles"]
    assert len(monopoles) == 3

    seal = client.post(
        "/api/seiberg-witten-monopole/seal-sw",
        json={
            "monopole_id": monopoles[0]["monopole_id"],
            "spinor_rank": 4,
            "dirac_degree": 6,
            "moduli_chamber_depth": 8,
            "sw_gain": 1.6,
        },
    )
    assert seal.status_code == 200
    body = seal.json()
    assert body["status"] == "SEIBERG_WITTEN_SEALED"
    assert body["monopole_moduli_locked"] is True
    assert body["dirac_unitarity_pct"] > 99.99

    metrics = client.get("/api/seiberg-witten-monopole/metrics")
    assert metrics.status_code == 200
    assert metrics.json()["active_sw_monopoles"] == 3


def test_heegaard_floer_bordered_endpoints():
    res = client.get("/api/heegaard-floer-bordered/diagrams")
    assert res.status_code == 200
    diagrams = res.json()["diagrams"]
    assert len(diagrams) == 3

    seal = client.post(
        "/api/heegaard-floer-bordered/seal-hf",
        json={
            "diagram_id": diagrams[0]["diagram_id"],
            "grid_rank": 4,
            "contact_depth": 12,
            "bordered_algebra_dim": 6,
            "hf_gain": 1.6,
        },
    )
    assert seal.status_code == 200
    body = seal.json()
    assert body["status"] == "HEEGAARD_FLOER_SEALED"
    assert body["heegaard_bordered_locked"] is True
    assert body["contact_unitarity_pct"] > 99.99

    metrics = client.get("/api/heegaard-floer-bordered/metrics")
    assert metrics.status_code == 200
    assert metrics.json()["active_heegaard_diagrams"] == 3


def test_geometric_satake_affine_endpoints():
    res = client.get("/api/geometric-satake-affine/stacks")
    assert res.status_code == 200
    stacks = res.json()["stacks"]
    assert len(stacks) == 3

    seal = client.post(
        "/api/geometric-satake-affine/seal-satake",
        json={
            "stack_id": stacks[0]["stack_id"],
            "group_rank": 4,
            "strata_dimension": 12,
            "springer_fiber_depth": 6,
            "satake_gain": 1.6,
        },
    )
    assert seal.status_code == 200
    body = seal.json()
    assert body["status"] == "GEOMETRIC_SATAKE_SEALED"
    assert body["geometric_satake_locked"] is True
    assert body["automorphic_unitarity_pct"] > 99.99

    metrics = client.get("/api/geometric-satake-affine/metrics")
    assert metrics.status_code == 200
    assert metrics.json()["active_satake_stacks"] == 3


def test_room_temp_diamagnetic_supergrid_endpoints():
    res = client.get("/api/room-temp-diamagnetic-supergrid/arrays")
    assert res.status_code == 200
    arrays = res.json()["arrays"]
    assert len(arrays) == 3

    harvest = client.post(
        "/api/room-temp-diamagnetic-supergrid/harvest-diamagnetic",
        json={
            "array_id": arrays[0]["array_id"],
            "meissner_field_tesla": 14.5,
            "levitation_gain": 1.6,
        },
    )
    assert harvest.status_code == 200
    body = harvest.json()
    assert body["status"] == "DIAMAGNETIC_SUPERGRID_OPTIMAL"
    assert body["zero_fossil_carbon"] is True
    assert body["zero_fissile_waste"] is True
    assert body["net_grid_output_gw"] > 300.0

    metrics = client.get("/api/room-temp-diamagnetic-supergrid/metrics")
    assert metrics.status_code == 200
    assert metrics.json()["active_diamagnetic_arrays"] == 3
    assert metrics.json()["zero_fossil_carbon"] is True


def test_direct_wave46_services():
    sw = get_seiberg_witten_monopole_shield()
    sw_res = sw.seal_seiberg_witten("SW-K3-SPINC-01", 4, 6, 8, 1.6)
    assert sw_res["status"] == "SEIBERG_WITTEN_SEALED"
    assert sw_res["monopole_moduli_locked"] is True

    hf = get_heegaard_floer_bordered_firewall()
    hf_res = hf.seal_heegaard_floer("HF-POINCARE-SPHERE-01", 4, 12, 6, 1.6)
    assert hf_res["status"] == "HEEGAARD_FLOER_SEALED"
    assert hf_res["heegaard_bordered_locked"] is True

    sat = get_geometric_satake_affine_shield()
    sat_res = sat.seal_geometric_satake("SATAKE-PGL2-GR-01", 4, 12, 6, 1.6)
    assert sat_res["status"] == "GEOMETRIC_SATAKE_SEALED"
    assert sat_res["geometric_satake_locked"] is True

    diamag = get_room_temp_diamagnetic_supergrid()
    d_res = diamag.harvest_diamagnetic_baseload("DIAMAGNETIC-LK99-ARRAY-01", 14.5, 1.6)
    assert d_res["status"] == "DIAMAGNETIC_SUPERGRID_OPTIMAL"
    assert d_res["zero_fossil_carbon"] is True


def test_wave46_validation_guards():
    sw = get_seiberg_witten_monopole_shield()
    with pytest.raises(ValueError):
        sw.seal_seiberg_witten("INVALID-SW", 4, 6, 8, 1.6)

    hf = get_heegaard_floer_bordered_firewall()
    with pytest.raises(ValueError):
        hf.seal_heegaard_floer("INVALID-HF", 4, 12, 6, 1.6)

    sat = get_geometric_satake_affine_shield()
    with pytest.raises(ValueError):
        sat.seal_geometric_satake("INVALID-SATAKE", 4, 12, 6, 1.6)

    diamag = get_room_temp_diamagnetic_supergrid()
    with pytest.raises(ValueError):
        diamag.harvest_diamagnetic_baseload("INVALID-ARRAY", 14.5, 1.6)
