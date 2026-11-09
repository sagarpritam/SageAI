"""
Unit & Integration Tests for SageAI Multi-Region Zero Data Egress Edge Enclave.

Verifies:
1. Sovereign Regional Enclaves catalog (US FedRAMP, EU GDPR, APAC PDPA/MAS TRM).
2. AES-256-GCM envelope encryption with HKDF-SHA256 key derivation.
3. Cryptographic authenticated associated data (AAD) anti-tamper and cross-region isolation.
4. Zero-egress credential scrubber and tokenization engine.
5. Multi-region sovereignty verification drill with Merkle audit chain seal.
6. FastAPI endpoints with bearer token authentication and error handling.
"""

import pytest
from httpx import ASGITransport, AsyncClient

from app.core.security import create_access_token
from app.main import app
from app.services.enclave.zero_egress_service import (
    ZeroEgressEnclaveService,
    zero_egress_service,
)


@pytest.fixture
def anyio_backend():
    return "asyncio"


def test_enclave_regions_catalog():
    """Verify all 3 sovereign regional enclaves are cataloged with compliance standards."""
    regions = zero_egress_service.get_enclave_regions()
    assert len(regions) == 3

    region_ids = {r["region_id"] for r in regions}
    expected_ids = {"us-east-1", "eu-central-1", "ap-southeast-1"}
    assert region_ids == expected_ids

    for r in regions:
        assert r["status"] == "HEALTHY"
        assert len(r["compliance_frameworks"]) >= 2
        assert r["latency_ms"] > 0
        assert "egress_boundary" in r
        assert "crypto_standard" in r


def test_envelope_encryption_and_decryption():
    """Verify AES-256-GCM envelope encryption and successful decryption with matching passphrase."""
    service = ZeroEgressEnclaveService()
    secret_text = (
        "DATABASE_URL=postgresql://root:ultra_secret_pw@db.prod.internal:5432/main"
    )
    passphrase = "EnterpriseVaultPassphrase2026!"
    region = "eu-central-1"

    # Encrypt
    envelope = service.encrypt_payload(
        plaintext=secret_text,
        enclave_key=passphrase,
        region=region,
    )

    assert envelope["algorithm"] == "AES-256-GCM-HKDF-SHA256"
    assert envelope["region"] == region
    assert "salt" in envelope
    assert "nonce" in envelope
    assert "ciphertext" in envelope
    assert "envelope_hash" in envelope
    assert envelope["associated_data"] == f"region:{region}|sovereignty:enforced|v:2.5"

    # Ciphertext must not contain plaintext
    assert secret_text not in envelope["ciphertext"]

    # Decrypt
    decrypted = service.decrypt_payload(
        envelope=envelope,
        enclave_key=passphrase,
    )
    assert decrypted == secret_text


def test_encryption_wrong_key_rejection():
    """Verify decryption fails when supplied with an invalid passphrase."""
    service = ZeroEgressEnclaveService()
    secret_text = "API_KEY_SECRET_48291"
    correct_passphrase = "ValidMasterPassphrase99!"
    wrong_passphrase = "WrongPassphrase12345!"

    envelope = service.encrypt_payload(
        plaintext=secret_text,
        enclave_key=correct_passphrase,
        region="us-east-1",
    )

    with pytest.raises(ValueError, match="Enclave cryptographic verification failed"):
        service.decrypt_payload(
            envelope=envelope,
            enclave_key=wrong_passphrase,
        )


def test_cross_region_tamper_blocking():
    """Verify that tampering with region in associated data blocks cross-region data egress."""
    service = ZeroEgressEnclaveService()
    secret_text = "SOVEREIGN_EU_PATIENT_RECORDS"
    passphrase = "EUSovereignVaultPassphrase!"

    envelope = service.encrypt_payload(
        plaintext=secret_text,
        enclave_key=passphrase,
        region="eu-central-1",
    )

    # Tamper with the region tag to attempt cross-region egress to us-east-1
    tampered_envelope = dict(envelope)
    tampered_envelope["region"] = "us-east-1"
    tampered_envelope["associated_data"] = "region:us-east-1|sovereignty:enforced|v:2.5"

    with pytest.raises(ValueError, match="Enclave cryptographic verification failed"):
        service.decrypt_payload(
            envelope=tampered_envelope,
            enclave_key=passphrase,
        )


def test_zero_egress_secret_scrubbing_and_tokenization():
    """Verify zero-egress sanitizer scrubs AWS keys, private keys, database URIs, JWTs, and PII."""
    service = ZeroEgressEnclaveService()
    dirty_payload = (
        "Deployment failed for dev@enterprise.com with AWS Key AKIAIOSFODNN7EXAMPLE "
        "and Secret DB postgresql://admin:secret123@aws-db.us-east-1.rds.amazonaws.com:5432/core. "
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.doNotLeakThisToken "
        "-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0\n-----END RSA PRIVATE KEY-----"
    )

    result = service.sanitize_and_tokenize(dirty_payload)
    assert result["tokens_replaced"] >= 4
    assert result["leakage_risk_before"] == "CRITICAL"
    assert "ZERO" in result["leakage_risk_after"]

    sanitized = result["sanitized_text"]
    # Check that none of the secrets appear in sanitized output
    assert "AKIAIOSFODNN7EXAMPLE" not in sanitized
    assert "postgresql://admin:secret123" not in sanitized
    assert "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" not in sanitized
    assert "-----BEGIN RSA PRIVATE KEY-----" not in sanitized
    assert "dev@enterprise.com" not in sanitized

    # Check placeholder tokens
    assert "[ENCLAVE_TOKEN_AWS_KEY:" in sanitized
    assert "[ENCLAVE_TOKEN_DB_URI:" in sanitized
    assert "[ENCLAVE_TOKEN_JWT:" in sanitized
    assert "[ENCLAVE_TOKEN_PII_EMAIL:" in sanitized


@pytest.mark.asyncio
async def test_enclave_sovereignty_drill_execution():
    """Verify autonomous multi-region sovereignty drill and cryptographic Merkle seal."""
    service = ZeroEgressEnclaveService()
    drill = await service.verify_regional_sovereignty(
        org_id="test-sovereign-org",
        actor="Pytest-EnclaveAuditor",
    )

    assert drill["status"] == "PASS"
    assert drill["enclaves_tested"] == 3
    assert len(drill["enclave_results"]) == 3

    for r in drill["enclave_results"]:
        assert r["encryption_verified"] is True
        assert r["cross_region_tamper_blocked"] is True
        assert r["compliance_status"] == "COMPLIANT"

    merkle = drill["merkle_seal"]
    assert merkle["status"] == "CRYPTOGRAPHICALLY_VERIFIED"
    assert len(merkle["record_hash"]) == 64
    assert len(merkle["previous_hash"]) == 64
    assert merkle["ledger_index"] >= 0


@pytest.mark.asyncio
async def test_enclave_fastapi_endpoints():
    """Verify FastAPI /enclave endpoints with token authentication."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = create_access_token(
            {
                "sub": "ciso@enterprise.com",
                "role": "admin",
                "org": "corp-grid",
            }
        )
        auth_headers = {"Authorization": f"Bearer {token}"}

        # 1. Unauthenticated request should be rejected (401 or 403 depending on header)
        unauth_res = await client.get("/enclave/regions")
        assert unauth_res.status_code in (401, 403)

        # 2. Get regions
        regions_res = await client.get("/enclave/regions", headers=auth_headers)
        assert regions_res.status_code == 200
        regions_data = regions_res.json()
        assert regions_data["status"] == "success"
        assert regions_data["total_enclaves"] == 3

        # 3. Encrypt payload
        enc_res = await client.post(
            "/enclave/encrypt",
            json={
                "plaintext": "CONFIDENTIAL_PAYLOAD_DATA_123",
                "enclave_key": "MasterKeySecret2026!",
                "region": "eu-central-1",
            },
            headers=auth_headers,
        )
        assert enc_res.status_code == 200
        enc_data = enc_res.json()
        assert enc_data["status"] == "success"
        envelope = enc_data["envelope"]
        assert envelope["region"] == "eu-central-1"

        # 4. Decrypt payload
        dec_res = await client.post(
            "/enclave/decrypt",
            json={
                "envelope": envelope,
                "enclave_key": "MasterKeySecret2026!",
            },
            headers=auth_headers,
        )
        assert dec_res.status_code == 200
        assert dec_res.json()["plaintext"] == "CONFIDENTIAL_PAYLOAD_DATA_123"

        # 5. Decrypt with invalid key should return 403
        dec_fail_res = await client.post(
            "/enclave/decrypt",
            json={
                "envelope": envelope,
                "enclave_key": "IncorrectKey12345!",
            },
            headers=auth_headers,
        )
        assert dec_fail_res.status_code == 403

        # 6. Sanitize payload for egress
        san_res = await client.post(
            "/enclave/sanitize-egress",
            json={
                "text": "Send secret to dev@org.internal with token AKIAIOSFODNN7EXAMPLE"
            },
            headers=auth_headers,
        )
        assert san_res.status_code == 200
        san_data = san_res.json()
        assert "AKIAIOSFODNN7EXAMPLE" not in san_data["sanitized_text"]
        assert san_data["tokens_replaced"] >= 1

        # 7. Execute sovereignty verification drill
        drill_res = await client.post(
            "/enclave/verify-sovereignty",
            headers=auth_headers,
        )
        assert drill_res.status_code == 200
        drill_data = drill_res.json()
        assert drill_data["status"] == "PASS"
        assert drill_data["enclaves_tested"] == 3
        assert "merkle_seal" in drill_data
