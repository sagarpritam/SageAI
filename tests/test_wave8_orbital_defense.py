"""
Test Suite for Wave 8: Autonomous Orbital & Quantum-Entangled Infrastructure Defense (v4.1 Milestone):
1. Capability 44: PQC Kyber/Dilithium Encrypted Mesh VPN Gateway (kyber_mesh_vpn_service)
2. Capability 45: AI-Synthesized Autonomous Honeynet Labyrinths (labyrinth_honeynet_service)
3. Capability 46: Sovereign Air-Gapped Offline LLM Ingestion (airgap_llm_guard_service)
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.airgap_llm_guard.airgap_llm_guard_service import (
    airgap_llm_guard_service,
)
from app.services.kyber_mesh_vpn.kyber_mesh_vpn_service import kyber_mesh_vpn_service
from app.services.labyrinth_honeynet.labyrinth_honeynet_service import (
    labyrinth_honeynet_service,
)


@pytest.fixture
def client():
    return TestClient(app)


# ----------------------------------------------------
# 1. PQC Kyber/Dilithium Mesh VPN Tests
# ----------------------------------------------------
def test_kyber_mesh_vpn_service():
    peers = kyber_mesh_vpn_service.list_peers()
    assert len(peers) >= 3
    peer_ids = [p["peer_id"] for p in peers]
    assert "pqc-peer-us-vault" in peer_ids
    assert "pqc-peer-orbital-relay" in peer_ids

    # Register new peer
    new_peer = kyber_mesh_vpn_service.register_peer(
        node_name="Tokyo High-Sec AI Inference Enclave",
        endpoint="203.0.113.190:51820",
        overlay_ip="10.220.0.15/32",
    )
    assert new_peer["status"] == "ESTABLISHED"
    assert "kyber768_pk_" in new_peer["kyber_public_key"]
    assert "mldsa65_id_" in new_peer["dilithium_identity"]

    # Execute handshake
    hs = kyber_mesh_vpn_service.initiate_pqc_handshake(new_peer["peer_id"])
    assert hs["status"] == "HANDSHAKE_ESTABLISHED"
    assert hs["dilithium_verified"] is True
    assert hs["quantum_immunity_bits"] == 192

    # WireGuard configuration generation
    conf = kyber_mesh_vpn_service.generate_wireguard_conf(new_peer["peer_id"])
    assert "[Interface]" in conf
    assert "[Peer]" in conf
    assert "PresharedKey" in conf
    assert "ML-KEM-768" in conf

    # Metrics
    metrics = kyber_mesh_vpn_service.get_mesh_metrics()
    assert metrics["total_mesh_peers"] >= 4
    assert metrics["ephemeral_rekey_interval_sec"] == 120


# ----------------------------------------------------
# 2. AI-Synthesized Labyrinth Honeynet Tests
# ----------------------------------------------------
def test_labyrinth_honeynet_service():
    mazes = labyrinth_honeynet_service.list_labyrinths()
    assert len(mazes) >= 3
    arch_types = [m["architecture_type"] for m in mazes]
    assert "FINANCIAL_CORE" in arch_types
    assert "CLOUD_INFRASTRUCTURE" in arch_types
    assert "AI_INTELLECTUAL_PROPERTY" in arch_types

    # Create new labyrinth
    new_maze = labyrinth_honeynet_service.create_labyrinth(
        name="Decoy Defense Industrial Base SCADA Controller",
        architecture_type="INDUSTRIAL_SCADA",
        depth_levels=6,
        deception_persona="PLC Siemens S7-1500 Controller",
    )
    assert new_maze["depth_levels"] == 6
    maze_id = new_maze["labyrinth_id"]

    # Trap adversary command: shadow file access
    trap1 = labyrinth_honeynet_service.trap_adversary_interaction(
        labyrinth_id=maze_id,
        adversary_ip="198.51.100.99",
        probe_command="cat /etc/shadow",
        protocol="SSH",
    )
    assert trap1["status"] == "ADVERSARY_TRAPPED_IN_LABYRINTH"
    assert "synthetic-root-creds-hash" in trap1["canary_token_seeded"]
    assert trap1["delay_injected_sec"] > 0

    # Trap adversary command: kubectl get
    trap2 = labyrinth_honeynet_service.trap_adversary_interaction(
        labyrinth_id=maze_id,
        adversary_ip="198.51.100.99",
        probe_command="kubectl get pods -A",
        protocol="HTTPS",
    )
    assert trap2["current_depth"] > trap1["current_depth"]

    # Retrieve session telemetry
    session = labyrinth_honeynet_service.get_adversary_session("198.51.100.99")
    assert session is not None
    assert len(session["commands_executed"]) == 2
    assert session["depth_reached"] >= 2

    # Metrics
    metrics = labyrinth_honeynet_service.get_labyrinth_metrics()
    assert metrics["total_active_labyrinths"] >= 4
    assert metrics["total_adversaries_trapped"] >= 1


# ----------------------------------------------------
# 3. Sovereign Air-Gapped Offline LLM Ingestion Tests
# ----------------------------------------------------
def test_airgap_llm_guard_service():
    models = airgap_llm_guard_service.list_models()
    assert len(models) >= 2
    model_ids = [m["model_id"] for m in models]
    assert "model-nemotron-70b" in model_ids

    # Scan a new model artifact
    scanned = airgap_llm_guard_service.scan_model_artifact(
        model_name="Llama-3.3-70B-Sovereign-Audit",
        format_type="SAFETENSORS",
        base_architecture="Llama3-70B",
        parameters_billions=70.0,
    )
    assert scanned["safety_status"] == "SCANNED_READY_FOR_AIRGAP"
    assert scanned["backdoor_scan_verdict"] == "CLEAN_ZERO_TROJANS"
    model_id = scanned["model_id"]

    # Validate differential privacy: valid budget (epsilon < 1.0)
    dp_valid = airgap_llm_guard_service.validate_lora_privacy(
        model_id=model_id, lora_rank=32, epsilon=0.75, delta=1e-6
    )
    assert dp_valid["dp_compliant"] is True
    assert dp_valid["verdict"] == "APPROVED_DIFFERENTIAL_PRIVACY_MET"

    # Validate differential privacy: invalid budget (epsilon >= 1.0)
    dp_invalid = airgap_llm_guard_service.validate_lora_privacy(
        model_id=model_id, lora_rank=64, epsilon=2.5, delta=1e-4
    )
    assert dp_invalid["dp_compliant"] is False
    assert dp_invalid["verdict"] == "REJECTED_PRIVACY_BUDGET_EXCEEDED"

    # Seal and authorize for air-gapped enclave loading
    seal_res = airgap_llm_guard_service.seal_and_authorize_enclave_load(model_id)
    assert seal_res["status"] == "SEALED_AND_AUTHORIZED"
    assert seal_res["airgap_enforcement"] == "HARDWARE_ZERO_EGRESS_VERIFIED"
    assert "cert_serial" in seal_res

    # Metrics
    metrics = airgap_llm_guard_service.get_airgap_metrics()
    assert metrics["total_ingested_models"] >= 3
    assert metrics["sealed_authorized_models"] >= 3


# ----------------------------------------------------
# 4. Wave 8 FastAPI Routers TestClient Tests
# ----------------------------------------------------
def test_wave8_fastapi_routers(client):
    from app.core.security import get_current_user

    app.dependency_overrides[get_current_user] = lambda: {
        "sub": "OrbitalSecOpsAdmin",
        "org": "enterprise",
        "email": "orbital@sageai.internal",
    }

    try:
        # PQC Kyber Mesh VPN
        res = client.get("/kyber-mesh-vpn/peers")
        assert res.status_code == 200
        first_peer_id = res.json()["peers"][0]["peer_id"]

        res_reg = client.post(
            "/kyber-mesh-vpn/register-peer",
            json={
                "node_name": "Canberra Deep Space Station Ground Node",
                "endpoint": "192.0.2.140:51820",
                "overlay_ip": "10.220.0.50/32",
            },
        )
        assert res_reg.status_code == 200
        new_peer_id = res_reg.json()["peer"]["peer_id"]

        res_hs = client.post("/kyber-mesh-vpn/handshake", json={"peer_id": new_peer_id})
        assert res_hs.status_code == 200
        assert res_hs.json()["handshake"]["status"] == "HANDSHAKE_ESTABLISHED"

        res_conf = client.get(f"/kyber-mesh-vpn/wireguard-config/{first_peer_id}")
        assert res_conf.status_code == 200
        assert "[Peer]" in res_conf.json()["config"]

        res_vpn_met = client.get("/kyber-mesh-vpn/metrics")
        assert res_vpn_met.status_code == 200

        # Labyrinth Honeynet
        res = client.get("/labyrinth-honeynet/mazes")
        assert res.status_code == 200
        assert len(res.json()["mazes"]) >= 3
        first_maze_id = res.json()["mazes"][0]["labyrinth_id"]

        res_trap = client.post(
            "/labyrinth-honeynet/trap-adversary",
            json={
                "labyrinth_id": first_maze_id,
                "adversary_ip": "198.51.100.44",
                "probe_command": "SELECT * FROM fedwire_vault;",
                "protocol": "POSTGRESQL",
            },
        )
        assert res_trap.status_code == 200
        assert res_trap.json()["trap"]["status"] == "ADVERSARY_TRAPPED_IN_LABYRINTH"

        res_adv = client.get("/labyrinth-honeynet/adversary/198.51.100.44")
        assert res_adv.status_code == 200
        assert res_adv.json()["session"]["adversary_ip"] == "198.51.100.44"

        res_maze_met = client.get("/labyrinth-honeynet/metrics")
        assert res_maze_met.status_code == 200

        # Air-Gapped LLM Guard
        res = client.get("/airgap-llm-guard/models")
        assert res.status_code == 200
        assert len(res.json()["models"]) >= 2

        res_scan = client.post(
            "/airgap-llm-guard/scan-artifact",
            json={
                "model_name": "DeepSeek-V3-Sovereign-MoE",
                "format_type": "SAFETENSORS",
                "base_architecture": "DeepSeek-V3-MoE",
                "parameters_billions": 671.0,
            },
        )
        assert res_scan.status_code == 200
        scanned_model_id = res_scan.json()["model"]["model_id"]

        res_lora = client.post(
            "/airgap-llm-guard/validate-lora",
            json={
                "model_id": scanned_model_id,
                "lora_rank": 16,
                "epsilon": 0.82,
                "delta": 1e-6,
            },
        )
        assert res_lora.status_code == 200
        assert res_lora.json()["validation"]["dp_compliant"] is True

        res_seal = client.post(
            "/airgap-llm-guard/seal-enclave", json={"model_id": scanned_model_id}
        )
        assert res_seal.status_code == 200
        assert res_seal.json()["seal"]["status"] == "SEALED_AND_AUTHORIZED"

        res_llm_met = client.get("/airgap-llm-guard/metrics")
        assert res_llm_met.status_code == 200

    finally:
        app.dependency_overrides.clear()
