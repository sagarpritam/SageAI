"""
Tests for Pillar V: Deception Mesh & Dynamic Honeytokens (DeceptionHoneypotService).
Verifies:
1. Decoy endpoint registry (web, cloud, network decoys)
2. Dynamic canary token generation (AWS, JWT, DB URI, API Key)
3. Decoy hit recording and fingerprinting
4. Canary access verification (100% confidence breach alerts)
5. Attacker journey simulation and SOAR incident escalation
"""

from app.services.deception.honeypot_service import DeceptionHoneypotService


def test_deception_decoy_endpoints():
    service = DeceptionHoneypotService()
    decoys = service.get_decoy_endpoints()

    assert len(decoys) >= 8
    paths = [d["path"] for d in decoys]
    assert "/.env" in paths
    assert "/wp-login.php" in paths
    assert "/.aws/credentials" in paths
    assert "tcp://0.0.0.0:2222" in paths


def test_generate_canary_tokens_multiple_types():
    service = DeceptionHoneypotService()

    # AWS Key
    aws_token = service.generate_canary_token(token_type="aws_key", label="AWS Prod S3")
    assert aws_token["canary_value"].startswith("AKIA")
    assert aws_token["token_type"] == "aws_key"

    # JWT Token
    jwt_token = service.generate_canary_token(token_type="jwt_token", label="Admin JWT")
    assert jwt_token["canary_value"].startswith("eyJ")

    # DB URI
    db_token = service.generate_canary_token(
        token_type="db_uri", label="Internal Postgres"
    )
    assert db_token["canary_value"].startswith("postgresql://")


def test_record_decoy_hit():
    service = DeceptionHoneypotService()

    event = service.record_decoy_hit(
        path="/.env",
        source_ip="198.51.100.99",
        user_agent="sqlmap/1.7",
        payload="GET /.env",
    )

    assert event["type"] == "HONEYPOT_DECOY_TRIGGERED"
    assert event["severity"] == "CRITICAL"
    assert event["source_ip"] == "198.51.100.99"
    assert event["confidence"] == "100% (Zero False Positive)"
    assert len(event["fingerprint"]) == 16


def test_verify_canary_compromised():
    service = DeceptionHoneypotService()

    # Generate canary
    canary = service.generate_canary_token(
        token_type="api_key", label="Leaked API Token"
    )
    token_val = canary["canary_value"]

    # Attacker tries to use it
    alert = service.verify_canary_access(
        token_val, source_ip="203.0.113.88", user_agent="curl/8.0"
    )

    assert alert is not None
    assert alert["type"] == "CANARY_TOKEN_COMPROMISED"
    assert alert["source_ip"] == "203.0.113.88"
    assert alert["label"] == "Leaked API Token"

    # Check that canary status is triggered
    tokens = service.list_canary_tokens()
    t = next(x for x in tokens if x["token_id"] == canary["token_id"])
    assert t["triggered"] is True
    assert t["trigger_count"] == 1


def test_simulate_attacker_journey_and_soar_escalation():
    service = DeceptionHoneypotService()

    res = service.simulate_attacker_journey(
        decoy_path="/.env",
        attacker_ip="198.51.100.42",
        org_id="test_org",
    )

    assert res["status"] == "SIMULATION_COMPLETE"
    assert len(res["journey"]) == 4

    incident = res["incident"]
    assert incident["severity"] == "CRITICAL"
    assert "Deception Alert" in incident["title"]
    assert incident["status"] == "OPEN"
    # Verify auto-executed safe actions
    executed_action_names = [a["action"] for a in incident["executed_actions"]]
    assert "GENERATE_VIRTUAL_PATCH" in executed_action_names
    assert "NOTIFY_SOC_WEBHOOK" in executed_action_names
