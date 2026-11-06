"""
Test Suite for Wave 15: Ocean Floor Sonar, Orbital Debris Deflector & Air-Gapped Exploit Swarm (v4.8.0 Milestone):
1. Capability 65: Autonomous Sub-Surface Marine Acoustic Ocean Floor Sonar Mesh (marine_acoustic_sonar_mesh)
2. Capability 66: Orbital Anti-Satellite (ASAT) Kinetic Debris Laser Ablation & Deflector (orbital_asat_debris_deflector)
3. Capability 67: Sovereign Autonomous Air-Gapped Zero-Day Exploit Reverse-Engineering Swarm (airgap_exploit_swarm)
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.security import get_current_user
from app.services.marine_sonar.marine_acoustic_mesh import marine_acoustic_sonar_mesh
from app.services.orbital_debris.orbital_debris_deflector import orbital_asat_debris_deflector
from app.services.airgap_exploit_swarm.airgap_exploit_swarm import airgap_exploit_swarm


@pytest.fixture
def client():
    return TestClient(app)


# ----------------------------------------------------
# 1. Capability 65: Marine Acoustic Sonar Mesh Tests
# ----------------------------------------------------
def test_marine_sonar_service():
    nodes = marine_acoustic_sonar_mesh.list_nodes()
    assert len(nodes) >= 3
    node_ids = [n["node_id"] for n in nodes]
    assert "sonar-node-giuk-gap-01" in node_ids
    assert "sonar-node-taiwan-strait-02" in node_ids

    # Query individual node
    giuk = marine_acoustic_sonar_mesh.get_node("sonar-node-giuk-gap-01")
    assert giuk is not None
    assert giuk["depth_meters"] > 2000.0
    assert giuk["sofar_channel_active"] is True

    # Nominal biological ocean soundscape
    nom = marine_acoustic_sonar_mesh.analyze_acoustic_telemetry(
        node_id="sonar-node-giuk-gap-01",
        sound_velocity_mps=1492.0,
        ambient_spl_db=68.5,
        spectral_peak_hz=280.0,
        acoustic_doppler_mps=1.2,
    )
    assert nom["threat_detected"] is False
    assert nom["threat_type"] == "NOMINAL_BIOLOGICAL_OCEAN_SOUNDSCAPE"
    assert nom["action_recommended"] == "CONTINUE_PASSIVE_ACOUSTIC_SURVEILLANCE"

    # Hostile uncrewed AUV cavitation detection
    auv = marine_acoustic_sonar_mesh.analyze_acoustic_telemetry(
        node_id="sonar-node-giuk-gap-01",
        sound_velocity_mps=1498.0,
        ambient_spl_db=92.0,
        spectral_peak_hz=95.0,  # 60-140 Hz cavitation peak
        acoustic_doppler_mps=14.5,  # High speed Doppler shift
    )
    assert auv["threat_detected"] is True
    assert auv["threat_type"] == "HOSTILE_UNCREWED_AUV_CAVITATION"
    assert auv["triangulation_latency_ms"] < 18.0

    # Hyperbolic TDOA Triangulation
    tdoa = marine_acoustic_sonar_mesh.triangulate_acoustic_contact(
        node_id="sonar-node-giuk-gap-01",
        bearing_deg=142.5,
        estimated_depth_m=850.0,
    )
    assert tdoa["triangulation_speed_ms"] < 18.0
    assert tdoa["position_error_radius_meters"] < 25.0
    assert tdoa["new_node_status"] == "CONTACT_TRIANGULATED_LOCKED"

    # Metrics
    metrics = marine_acoustic_sonar_mesh.get_sonar_metrics()
    assert metrics["monitored_ocean_floor_arrays"] >= 3
    assert metrics["total_hydrophone_elements"] >= 200
    assert metrics["contacts_triangulated"] >= 1


# ----------------------------------------------------
# 2. Capability 66: Orbital ASAT Debris Deflector Tests
# ----------------------------------------------------
def test_orbital_debris_service():
    platforms = orbital_asat_debris_deflector.list_platforms()
    assert len(platforms) >= 3
    platform_ids = [p["platform_id"] for p in platforms]
    assert "laser-platform-helios-01" in platform_ids
    assert "laser-platform-aegis-orbital-02" in platform_ids

    # Query individual platform
    helios = orbital_asat_debris_deflector.get_platform("laser-platform-helios-01")
    assert helios is not None
    assert helios["pulse_energy_kj"] == 10.0
    assert helios["status"] == "ASTRODYNAMIC_FIRE_CONTROL_READY"

    # Nominal conjunction pass
    nom = orbital_asat_debris_deflector.calculate_debris_conjunction(
        platform_id="laser-platform-helios-01",
        debris_size_cm=2.5,
        relative_velocity_km_s=7.5,
        miss_distance_meters=1850.0,
        collision_probability=1e-6,
    )
    assert nom["threat_detected"] is False
    assert nom["threat_type"] == "NOMINAL_ORBITAL_CONJUNCTION_PASS"

    # Imminent critical debris collision conjunction
    conjunction = orbital_asat_debris_deflector.calculate_debris_conjunction(
        platform_id="laser-platform-helios-01",
        debris_size_cm=4.5,
        relative_velocity_km_s=7.8,
        miss_distance_meters=120.0,
        collision_probability=2.5e-3,
    )
    assert conjunction["threat_detected"] is True
    assert conjunction["threat_level"] == "EXTREME_CRITICAL"
    assert conjunction["threat_type"] == "CATASTROPHIC_ASAT_KINETIC_DEBRIS_CONJUNCTION"
    assert conjunction["required_delta_v_cm_s"] >= 2.5
    assert conjunction["fire_control_latency_ms"] < 1.8

    # Discharge pulsed laser ablation bursts
    deflection = orbital_asat_debris_deflector.fire_laser_ablation_deflector(
        platform_id="laser-platform-helios-01",
        target_debris_id="DEBRIS-LEO-8821",
        pulse_count=60,
        laser_fluence_j_cm2=14.0,
    )
    assert deflection["conjunction_deflected_verified"] is True
    assert deflection["delta_v_achieved_cm_s"] >= 2.5
    assert deflection["new_miss_distance_km"] > 4.5
    assert deflection["fire_control_latency_ms"] < 1.8

    # Metrics
    metrics = orbital_asat_debris_deflector.get_debris_metrics()
    assert metrics["active_orbital_laser_platforms"] >= 3
    assert metrics["debris_conjunctions_deflected"] >= 1
    assert metrics["satellite_survival_rate_pct"] == 100.0


# ----------------------------------------------------
# 3. Capability 67: Air-Gapped Exploit Swarm Tests
# ----------------------------------------------------
def test_airgap_exploit_service():
    agents = airgap_exploit_swarm.list_enclave_agents()
    assert len(agents) == 4
    agent_ids = [a["agent_id"] for a in agents]
    assert "agent-cfg-decompiler-01" in agent_ids
    assert "agent-smt-symbolic-02" in agent_ids
    assert "agent-rop-gadget-03" in agent_ids
    assert "agent-micropatch-synth-04" in agent_ids

    # Query individual agent
    smt_agent = airgap_exploit_swarm.get_agent("agent-smt-symbolic-02")
    assert smt_agent is not None
    assert "Symbolic SMT" in smt_agent["name"]

    # Nominal binary scan
    nom = airgap_exploit_swarm.analyze_zero_day_binary(
        binary_name="libcrypto_safe.so",
        binary_hash_sha256="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        rop_gadgets_count=2,
        symbolic_path_depth=8,
        register_control_verified=False,
    )
    assert nom["threat_detected"] is False
    assert nom["threat_type"] == "BENIGN_BINARY_VALIDATED"
    assert nom["action_recommended"] == "ALLOW_EXECUTION_ENCLAVE"

    # Arbitrary code execution ROP chain zero-day exploit
    exploit = airgap_exploit_swarm.analyze_zero_day_binary(
        binary_name="zero_day_weaponized_driver.sys",
        binary_hash_sha256="7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
        rop_gadgets_count=14,
        symbolic_path_depth=28,
        register_control_verified=True,
    )
    assert exploit["threat_detected"] is True
    assert exploit["threat_type"] == "ARBITRARY_CODE_EXECUTION_ROP_CHAIN_EXPLOIT"
    assert exploit["vulnerability_class"] == "HEAP_USE_AFTER_FREE_VULNERABILITY"
    assert exploit["analysis_latency_ms"] < 35.0

    # Auto-synthesize CFI micro-patch & YARA inoculation
    patch = airgap_exploit_swarm.synthesize_exploit_micropatch(
        binary_hash_sha256="7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
        patch_strategy="SHADOW_STACK_CFI_INOCULATION",
    )
    assert patch["zero_day_neutralized"] is True
    assert patch["patch_verification_z3_proven"] is True
    assert "builtin_cfi_check" in patch["safety_ast_inserted"]
    assert "ZeroDay_Mitigation" in patch["yara_inoculation_rule"]
    assert patch["synthesis_latency_ms"] < 35.0

    # Metrics
    metrics = airgap_exploit_swarm.get_swarm_metrics()
    assert metrics["airgap_enclave_agents"] == 4
    assert metrics["smt_constraint_proof_rate_pct"] == 100.0


# ----------------------------------------------------
# 4. Wave 15 FastAPI Router Integration Tests
# ----------------------------------------------------
def test_wave15_fastapi_endpoints(client):
    app.dependency_overrides[get_current_user] = lambda: {
        "id": "test-admin",
        "username": "admin",
        "role": "ADMIN",
        "scopes": ["*"],
    }

    try:
        # Marine Sonar Router
        r1 = client.get("/marine-sonar/nodes")
        assert r1.status_code == 200
        assert r1.json()["status"] == "success"

        r2 = client.post(
            "/marine-sonar/analyze-acoustic",
            json={
                "node_id": "sonar-node-giuk-gap-01",
                "sound_velocity_mps": 1495.0,
                "ambient_spl_db": 95.0,
                "spectral_peak_hz": 95.0,
                "acoustic_doppler_mps": 12.0,
            },
        )
        assert r2.status_code == 200
        assert r2.json()["analysis"]["threat_detected"] is True

        r3 = client.post(
            "/marine-sonar/triangulate",
            json={
                "node_id": "sonar-node-giuk-gap-01",
                "bearing_deg": 142.5,
                "estimated_depth_m": 850.0,
            },
        )
        assert r3.status_code == 200
        assert r3.json()["triangulation_event"]["new_node_status"] == "CONTACT_TRIANGULATED_LOCKED"

        r4 = client.get("/marine-sonar/metrics")
        assert r4.status_code == 200

        # Orbital Debris Router
        r5 = client.get("/orbital-debris/platforms")
        assert r5.status_code == 200
        assert r5.json()["status"] == "success"

        r6 = client.post(
            "/orbital-debris/calculate-conjunction",
            json={
                "platform_id": "laser-platform-helios-01",
                "debris_size_cm": 4.5,
                "relative_velocity_km_s": 7.8,
                "miss_distance_meters": 120.0,
                "collision_probability": 2.5e-3,
            },
        )
        assert r6.status_code == 200
        assert r6.json()["conjunction"]["threat_detected"] is True

        r7 = client.post(
            "/orbital-debris/fire-deflector",
            json={
                "platform_id": "laser-platform-helios-01",
                "target_debris_id": "DEBRIS-LEO-8821",
                "pulse_count": 60,
                "laser_fluence_j_cm2": 14.0,
            },
        )
        assert r7.status_code == 200
        assert r7.json()["deflection_event"]["conjunction_deflected_verified"] is True

        r8 = client.get("/orbital-debris/metrics")
        assert r8.status_code == 200

        # Air-Gapped Exploit Swarm Router
        r9 = client.get("/airgap-exploit-swarm/agents")
        assert r9.status_code == 200
        assert r9.json()["status"] == "success"

        r10 = client.post(
            "/airgap-exploit-swarm/analyze-zero-day",
            json={
                "binary_name": "zero_day_weaponized_driver.sys",
                "binary_hash_sha256": "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
                "rop_gadgets_count": 14,
                "symbolic_path_depth": 28,
                "register_control_verified": True,
            },
        )
        assert r10.status_code == 200
        assert r10.json()["analysis"]["threat_detected"] is True

        r11 = client.post(
            "/airgap-exploit-swarm/synthesize-micropatch",
            json={
                "binary_hash_sha256": "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
                "patch_strategy": "SHADOW_STACK_CFI_INOCULATION",
            },
        )
        assert r11.status_code == 200
        assert r11.json()["patch_event"]["zero_day_neutralized"] is True

        r12 = client.get("/airgap-exploit-swarm/metrics")
        assert r12.status_code == 200

    finally:
        app.dependency_overrides.pop(get_current_user, None)

