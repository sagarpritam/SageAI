"""
Unit & Integration Tests for Wave 24: Cosmological Inflationary Reheating & Baryogenesis Pump,
5D Warped Spacetime Randall-Sundrum Brane Stabilizer, Cosmic Censorship Horizon Enforcer & Deep-Crustal MHD Vault (Capabilities 92-94 + Option B).
"""

from fastapi.testclient import TestClient

from app.main import app
from app.services.cosmic_censorship_enforcer import cosmic_censorship_enforcer
from app.services.deep_crustal_mhd_vault import deep_crustal_mhd_vault
from app.services.inflaton_reheating_pump import inflaton_reheating_pump
from app.services.randall_sundrum_stabilizer import randall_sundrum_stabilizer

client = TestClient(app)


# ---------------------------------------------------------------------------
# Capability 92: Inflaton Field Chaotic Phase Reheating & Baryogenesis Pump
# ---------------------------------------------------------------------------
def test_inflaton_reheating_service():
    nodes = inflaton_reheating_pump.list_nodes()
    assert len(nodes) >= 3
    n = nodes[0]
    assert "node_id" in n
    assert "inflaton_mass_gev" in n
    assert "baryon_asymmetry_eta_b" in n

    res = inflaton_reheating_pump.trigger_reheating_cycle(
        node_id="INFLATON-PUMP-CERN-01",
        initial_amplitude_planck=0.85,
        coupling_gain=1.2,
    )
    assert res["cycle_id"].startswith("REHEAT-")
    assert res["parametric_growth_floquet_mu"] > 0.0
    assert res["thermalized_reheat_temp_gev"] > 1e11
    assert res["quenched_anomalous_entropy_nats"] > 0.0
    assert res["status"] == "CHAOTIC_REHEATING_ENTROPY_PURGED"

    metrics = inflaton_reheating_pump.get_pump_metrics()
    assert metrics["active_reheating_nodes"] >= 3
    assert metrics["completed_reheating_cycles"] >= 1
    assert metrics["status"] == "OPERATIONAL"


def test_inflaton_reheating_api():
    r_nodes = client.get("/api/inflaton-reheating/nodes")
    assert r_nodes.status_code == 200
    assert len(r_nodes.json()) >= 3

    r_cycle = client.post(
        "/api/inflaton-reheating/reheat-cycle",
        json={
            "node_id": "INFLATON-PUMP-DESY-02",
            "initial_amplitude_planck": 0.90,
            "coupling_gain": 1.1,
        },
    )
    assert r_cycle.status_code == 200
    data = r_cycle.json()
    assert data["node_id"] == "INFLATON-PUMP-DESY-02"
    assert data["thermalized_reheat_temp_gev"] > 0

    r_met = client.get("/api/inflaton-reheating/metrics")
    assert r_met.status_code == 200
    assert r_met.json()["status"] == "OPERATIONAL"


# ---------------------------------------------------------------------------
# Capability 93: 5D Warped Spacetime Randall-Sundrum Brane Metric Stabilizer
# ---------------------------------------------------------------------------
def test_randall_sundrum_service():
    branes = randall_sundrum_stabilizer.list_branes()
    assert len(branes) >= 3
    b = branes[0]
    assert "brane_id" in b
    assert "radion_mass_gev" in b
    assert "compactification_radius_rc_planck" in b

    res = randall_sundrum_stabilizer.stabilize_radion_modulus(
        brane_id="RS-BRANE-GENEVA-01",
        target_rc_planck=36.8,
        scalar_flux_boost=1.05,
    )
    assert res["stabilization_id"].startswith("RS-RADION-")
    assert res["radion_mass_eigenvalue_gev"] > 1400.0
    assert res["bulk_graviton_leakage_quench_db"] > 100.0
    assert res["status"] == "5D_WARPED_RADION_MODULUS_STABILIZED"

    metrics = randall_sundrum_stabilizer.get_stabilizer_metrics()
    assert metrics["active_randall_sundrum_branes"] >= 3
    assert metrics["completed_radion_stabilizations"] >= 1
    assert metrics["status"] == "OPERATIONAL"


def test_randall_sundrum_api():
    r_branes = client.get("/api/randall-sundrum/branes")
    assert r_branes.status_code == 200
    assert len(r_branes.json()) >= 3

    r_stab = client.post(
        "/api/randall-sundrum/stabilize-radion",
        json={
            "brane_id": "RS-BRANE-FERMILAB-02",
            "target_rc_planck": 36.5,
            "scalar_flux_boost": 1.1,
        },
    )
    assert r_stab.status_code == 200
    data = r_stab.json()
    assert data["brane_id"] == "RS-BRANE-FERMILAB-02"
    assert data["radion_mass_eigenvalue_gev"] > 0

    r_met = client.get("/api/randall-sundrum/metrics")
    assert r_met.status_code == 200
    assert r_met.json()["status"] == "OPERATIONAL"


# ---------------------------------------------------------------------------
# Capability 94: Penrose Cosmic Censorship Spacetime Horizon Enforcer
# ---------------------------------------------------------------------------
def test_cosmic_censorship_service():
    nodes = cosmic_censorship_enforcer.list_nodes()
    assert len(nodes) >= 3
    n = nodes[0]
    assert "node_id" in n
    assert "spin_parameter_a_over_m" in n
    assert "outer_horizon_radius_km" in n

    res = cosmic_censorship_enforcer.enforce_cosmic_censorship(
        node_id="CENSORSHIP-NODE-CYGNUS-X1-02",
        simulated_overspin_torque_pct=2.0,
        compensatory_damping_gain=1.2,
    )
    assert res["enforcement_id"].startswith("CENSOR-ENFORCE-")
    assert (
        res["post_enforcement_extremality_ratio"]
        < res["pre_enforcement_extremality_ratio"]
    )
    assert res["trapped_surface_closed"] is True
    assert res["naked_singularity_prevented"] is True
    assert res["status"] == "COSMIC_CENSORSHIP_ENFORCED_HORIZON_CLOAKED"

    metrics = cosmic_censorship_enforcer.get_enforcer_metrics()
    assert metrics["monitored_singularities"] >= 3
    assert metrics["naked_singularities_detected"] == 0
    assert metrics["status"] == "OPERATIONAL"


def test_cosmic_censorship_api():
    r_sing = client.get("/api/cosmic-censorship/singularities")
    assert r_sing.status_code == 200
    assert len(r_sing.json()) >= 3

    r_enf = client.post(
        "/api/cosmic-censorship/enforce-horizon",
        json={
            "node_id": "CENSORSHIP-NODE-LAB-SINGULARITY-03",
            "simulated_overspin_torque_pct": 1.5,
            "compensatory_damping_gain": 1.0,
        },
    )
    assert r_enf.status_code == 200
    data = r_enf.json()
    assert data["node_id"] == "CENSORSHIP-NODE-LAB-SINGULARITY-03"
    assert data["naked_singularity_prevented"] is True

    r_met = client.get("/api/cosmic-censorship/metrics")
    assert r_met.status_code == 200
    assert r_met.json()["status"] == "OPERATIONAL"


# ---------------------------------------------------------------------------
# Option B: Subterranean Deep-Crustal MHD Geothermal Power & Kinetic Vault
# ---------------------------------------------------------------------------
def test_deep_crustal_mhd_service():
    vaults = deep_crustal_mhd_vault.list_vaults()
    assert len(vaults) >= 3
    v = vaults[0]
    assert "vault_id" in v
    assert "geothermal_brine_temp_celsius" in v
    assert "rated_mhd_output_mw" in v

    res = deep_crustal_mhd_vault.generate_mhd_baseload(
        vault_id="MHD-VAULT-ICELAND-01",
        brine_velocity_factor=1.1,
        load_factor=0.9,
    )
    assert res["discharge_id"].startswith("MHD-POWER-")
    assert res["generated_mhd_power_mw"] > 800.0
    assert res["sovereign_grid_export_mw"] > 0
    assert res["subterranean_isolation_confirmed"] is True
    assert res["status"] == "MHD_SUPERCRITICAL_BASELOAD_ACTIVE"

    metrics = deep_crustal_mhd_vault.get_vault_metrics()
    assert metrics["active_mhd_vaults"] >= 3
    assert metrics["completed_power_discharges"] >= 1
    assert metrics["status"] == "OPERATIONAL"


def test_deep_crustal_mhd_api():
    r_v = client.get("/api/deep-crustal-mhd/vaults")
    assert r_v.status_code == 200
    assert len(r_v.json()) >= 3

    r_gen = client.post(
        "/api/deep-crustal-mhd/generate-power",
        json={
            "vault_id": "MHD-VAULT-NEVADA-02",
            "brine_velocity_factor": 1.0,
            "load_factor": 0.85,
        },
    )
    assert r_gen.status_code == 200
    data = r_gen.json()
    assert data["vault_id"] == "MHD-VAULT-NEVADA-02"
    assert data["generated_mhd_power_mw"] > 0

    r_met = client.get("/api/deep-crustal-mhd/metrics")
    assert r_met.status_code == 200
    assert r_met.json()["status"] == "OPERATIONAL"
