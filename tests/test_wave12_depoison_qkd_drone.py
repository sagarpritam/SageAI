"""
Test Suite for Wave 12: Sovereign AI Model De-Poisoning, Space-Ground QKD Mesh & Kinetic Drone Swarm Shield (v4.5.0 Milestone):
1. Capability 56: Autonomous Sovereign AI Model De-Poisoning & LoRA Backdoor Extraction Engine (ai_model_depoison_engine)
2. Capability 57: Space-Ground Quantum Key Distribution (QKD) Entanglement Swapping Network (space_ground_qkd_mesh)
3. Capability 58: Autonomous Air-Defense & Kinetic Drone Swarm RF/Optical Directed-Energy Shield (kinetic_drone_shield)
"""

import pytest
from fastapi.testclient import TestClient

from app.core.security import get_current_user
from app.main import app
from app.services.ai_depoison.ai_depoison_engine import ai_model_depoison_engine
from app.services.drone_swarm_shield.kinetic_drone_shield import kinetic_drone_shield
from app.services.space_ground_qkd.space_ground_qkd_mesh import space_ground_qkd_mesh


@pytest.fixture
def client():
    return TestClient(app)


# ----------------------------------------------------
# 1. Capability 56: AI Model De-Poisoning Tests
# ----------------------------------------------------
def test_ai_model_depoison_service():
    adapters = ai_model_depoison_engine.list_adapters()
    assert len(adapters) >= 3
    adapter_ids = [a["adapter_id"] for a in adapters]
    assert "lora-finance-analyst-v2" in adapter_ids
    assert "lora-code-coder-deepseek" in adapter_ids

    # Query individual adapter
    clean_ad = ai_model_depoison_engine.get_adapter("lora-code-coder-deepseek")
    assert clean_ad is not None
    assert clean_ad["status"] == "VERIFIED_CLEAN"
    assert clean_ad["anomaly_sparsity_pct"] < 10.0

    # Scan clean adapter
    clean_scan = ai_model_depoison_engine.scan_adapter_for_poison(
        adapter_id="lora-code-coder-deepseek",
        anomaly_threshold=10.0,
    )
    assert clean_scan["poison_detected"] is False
    assert clean_scan["verdict"] == "CLEAN_WEIGHTS_CONFIRMED"
    assert clean_scan["recommended_action"] == "PASS_TO_PRODUCTION"

    # Scan poisoned adapter
    poison_scan = ai_model_depoison_engine.scan_adapter_for_poison(
        adapter_id="lora-finance-analyst-v2",
        anomaly_threshold=10.0,
    )
    assert poison_scan["poison_detected"] is True
    assert poison_scan["backdoor_signature"] == "SleeperAgent_TaxAvoidancePayload"
    assert poison_scan["verdict"] == "BACKDOOR_TROJAN_ISOLATED"
    assert poison_scan["recommended_action"] == "SURGICAL_RANK1_NEURON_ABLATION"

    # Surgical rank-1 weight excision
    excision = ai_model_depoison_engine.excise_backdoor_weights(
        "lora-finance-analyst-v2"
    )
    assert excision["new_status"] == "DEPOISONED_VERIFIED"
    assert excision["utility_retention_pct"] > 99.8
    assert excision["excision_latency_ms"] < 50.0

    updated_ad = ai_model_depoison_engine.get_adapter("lora-finance-analyst-v2")
    assert updated_ad["status"] == "DEPOISONED_VERIFIED"
    assert updated_ad["backdoor_trigger_detected"] == "NEUTRALIZED_ABLATED"

    # Metrics
    metrics = ai_model_depoison_engine.get_depoison_metrics()
    assert metrics["total_adapters_monitored"] >= 3
    assert metrics["models_surgically_depoisoned"] >= 1


# ----------------------------------------------------
# 2. Capability 57: Space-Ground QKD Mesh Tests
# ----------------------------------------------------
def test_space_ground_qkd_service():
    links = space_ground_qkd_mesh.list_links()
    assert len(links) >= 3
    link_ids = [link["link_id"] for link in links]
    assert "link-qkd-svalbard-01" in link_ids
    assert "link-qkd-canary-02" in link_ids

    # Query individual link
    svalbard = space_ground_qkd_mesh.get_link("link-qkd-svalbard-01")
    assert svalbard is not None
    assert svalbard["protocol"] == "BBM92_ENTANGLED_PHOTONS"
    assert svalbard["entangled_photon_rate_hz"] > 10_000_000

    # Nominal QBER evaluation (< 11.0%)
    nominal_eval = space_ground_qkd_mesh.evaluate_qber_and_eavesdropping(
        link_id="link-qkd-svalbard-01",
        measured_qber_pct=2.4,
    )
    assert nominal_eval["threat_detected"] is False
    assert nominal_eval["threat_type"] == "NOMINAL_QUANTUM_COHERENCE"
    assert nominal_eval["action_recommended"] == "CONTINUOUS_QUANTUM_KEY_EXPANSION"

    # Eavesdropping adversary detection (QBER > 11.0%)
    eavesdrop_eval = space_ground_qkd_mesh.evaluate_qber_and_eavesdropping(
        link_id="link-qkd-svalbard-01",
        measured_qber_pct=14.6,
    )
    assert eavesdrop_eval["threat_detected"] is True
    assert (
        eavesdrop_eval["threat_type"] == "QUANTUM_BEAM_SPLITTING_EAVESDROPPER_DETECTED"
    )
    assert eavesdrop_eval["action_recommended"] == "IMMEDIATE_PHOTON_SHUTTER_ABORT"

    updated_link = space_ground_qkd_mesh.get_link("link-qkd-svalbard-01")
    assert updated_link["status"] == "ABORTED_EAVESDROPPER_ISOLATED"
    assert updated_link["eavesdropping_aborts"] >= 1

    # Entanglement swapping (BSM)
    swap = space_ground_qkd_mesh.execute_entanglement_swap("link-qkd-canary-02")
    assert swap["swapping_fidelity"] > 0.95
    assert swap["extended_distance_km"] > 1200.0
    assert swap["unconditional_key_bits_generated"] >= 1000000

    # Metrics
    metrics = space_ground_qkd_mesh.get_qkd_metrics()
    assert metrics["active_space_ground_quantum_links"] >= 3
    assert metrics["total_entanglement_swaps_completed"] >= 1


# ----------------------------------------------------
# 3. Capability 58: Kinetic Drone Swarm Shield Tests
# ----------------------------------------------------
def test_kinetic_drone_shield_service():
    sites = kinetic_drone_shield.list_protected_sites()
    assert len(sites) >= 3
    site_ids = [s["site_id"] for s in sites]
    assert "site-subsea-landing-bude" in site_ids
    assert "site-datacenter-virginia-01" in site_ids

    # Query site
    bude = kinetic_drone_shield.get_site("site-subsea-landing-bude")
    assert bude is not None
    assert bude["status"] == "AIRSPACE_SECURED"
    assert bude["coverage_radius_km"] > 5.0

    # Nominal clear airspace
    nominal_air = kinetic_drone_shield.detect_drone_swarm(
        site_id="site-subsea-landing-bude",
        radar_rcs_m2=0.001,
        swarm_size=0,
        optical_confirmed=False,
        rf_spectrum_anomaly=False,
        approach_velocity_mps=5.0,
    )
    assert nominal_air["threat_detected"] is False
    assert nominal_air["threat_type"] == "NOMINAL_CLEAR_AIRSPACE"

    # Hostile saturation drone swarm detection
    swarm_air = kinetic_drone_shield.detect_drone_swarm(
        site_id="site-subsea-landing-bude",
        radar_rcs_m2=0.08,
        swarm_size=8,
        optical_confirmed=True,
        rf_spectrum_anomaly=True,
        approach_velocity_mps=72.0,
    )
    assert swarm_air["threat_detected"] is True
    assert swarm_air["threat_type"] == "COORDINATED_SATURATION_DRONE_SWARM"
    assert swarm_air["threat_level"] == "CRITICAL"
    assert swarm_air["recommended_countermeasure"] == "HIGH_POWER_MICROWAVE_HPM"
    assert swarm_air["time_to_impact_sec"] < 15.0

    # Execute High-Power Microwave (HPM) burst
    burst = kinetic_drone_shield.fire_directed_energy_burst(
        site_id="site-subsea-landing-bude",
        weapon_type="HIGH_POWER_MICROWAVE_HPM",
        burst_duration_ms=3.8,
    )
    assert burst["electronic_avionic_kill_confirmed"] is True
    assert burst["swarm_kill_ratio_pct"] == 100.0
    assert burst["pulse_power_megawatts"] >= 200.0
    assert burst["new_site_status"] == "AIRSPACE_SECURED"

    # Metrics
    metrics = kinetic_drone_shield.get_drone_shield_metrics()
    assert metrics["protected_airspace_sites"] >= 3
    assert metrics["directed_energy_bursts_fired"] >= 1
    assert metrics["interception_success_rate_pct"] == 100.0


# ----------------------------------------------------
# 4. Wave 12 Authenticated FastAPI Endpoints Integration
# ----------------------------------------------------
def test_wave12_api_routes(client):
    app.dependency_overrides[get_current_user] = lambda: {
        "user_id": "usr-sovereign-operator-01",
        "email": "operator@sovereign.defense.gov",
        "role": "SOVEREIGN_ADMIN",
    }

    try:
        # AI De-Poisoning routes
        res = client.get("/ai-depoison/adapters")
        assert res.status_code == 200
        assert len(res.json()["adapters"]) >= 3

        res_scan = client.post(
            "/ai-depoison/scan",
            json={
                "adapter_id": "lora-kinetic-scada-edge",
                "anomaly_threshold": 10.0,
            },
        )
        assert res_scan.status_code == 200
        assert res_scan.json()["scan"]["poison_detected"] is True

        res_exc = client.post(
            "/ai-depoison/excise-backdoor",
            json={
                "adapter_id": "lora-kinetic-scada-edge",
            },
        )
        assert res_exc.status_code == 200
        assert res_exc.json()["excision"]["new_status"] == "DEPOISONED_VERIFIED"

        res_dep_met = client.get("/ai-depoison/metrics")
        assert res_dep_met.status_code == 200

        # Space-Ground QKD routes
        res = client.get("/space-ground-qkd/links")
        assert res.status_code == 200
        assert len(res.json()["links"]) >= 3

        res_qber = client.post(
            "/space-ground-qkd/evaluate-qber",
            json={
                "link_id": "link-qkd-hawaii-03",
                "measured_qber_pct": 13.2,
                "photon_coincidence_window_ns": 1.2,
            },
        )
        assert res_qber.status_code == 200
        assert res_qber.json()["evaluation"]["threat_detected"] is True

        res_swap = client.post(
            "/space-ground-qkd/swap",
            json={
                "link_id": "link-qkd-hawaii-03",
            },
        )
        assert res_swap.status_code == 200
        assert res_swap.json()["swap"]["swapping_fidelity"] > 0.9

        res_qkd_met = client.get("/space-ground-qkd/metrics")
        assert res_qkd_met.status_code == 200

        # Kinetic Drone Swarm Shield routes
        res = client.get("/drone-swarm-shield/sites")
        assert res.status_code == 200
        assert len(res.json()["sites"]) >= 3

        res_drone = client.post(
            "/drone-swarm-shield/detect-swarm",
            json={
                "site_id": "site-datacenter-virginia-01",
                "radar_rcs_m2": 0.05,
                "swarm_size": 6,
                "optical_confirmed": True,
                "rf_spectrum_anomaly": True,
                "approach_velocity_mps": 85.0,
            },
        )
        assert res_drone.status_code == 200
        assert res_drone.json()["detection"]["threat_detected"] is True

        res_burst = client.post(
            "/drone-swarm-shield/fire-directed-energy",
            json={
                "site_id": "site-datacenter-virginia-01",
                "weapon_type": "HIGH_POWER_MICROWAVE_HPM",
                "burst_duration_ms": 4.0,
            },
        )
        assert res_burst.status_code == 200
        assert (
            res_burst.json()["interception"]["electronic_avionic_kill_confirmed"]
            is True
        )

        res_drone_met = client.get("/drone-swarm-shield/metrics")
        assert res_drone_met.status_code == 200
    finally:
        app.dependency_overrides.clear()
