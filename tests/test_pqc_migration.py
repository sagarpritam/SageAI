"""
Unit & Integration Tests for SageAI Post-Quantum Cryptography (PQC) & Hybrid Migration Layer.
"""

import base64
import pytest
from httpx import ASGITransport, AsyncClient

from app.core.security import create_access_token
from app.main import app
from app.services.crypto.pqc_service import PQCService, pqc_service


@pytest.fixture
def anyio_backend():
    return "asyncio"


def test_hybrid_keypair_generation():
    """Verify dual classical X25519 and lattice ML-KEM-768 hybrid keypair generation."""
    keypair = pqc_service.generate_hybrid_keypair()

    assert keypair["algorithm"] == "Hybrid X25519 + ML-KEM-768"
    assert "RFC 7748 (X25519)" in keypair["standards"]
    assert "NIST FIPS 203 (ML-KEM)" in keypair["standards"]
    assert len(keypair["public_key_fingerprint"]) == 16

    # Verify key data is valid base64
    classical_pub = base64.b64decode(keypair["classical_public_key"])
    classical_priv = base64.b64decode(keypair["classical_private_key"])
    ml_kem_pub = base64.b64decode(keypair["ml_kem_public_key"])
    ml_kem_priv = base64.b64decode(keypair["ml_kem_private_key"])

    assert len(classical_pub) == 32
    assert len(classical_priv) == 32
    assert len(ml_kem_pub) == 1184
    assert len(ml_kem_priv) == 2400


def test_hybrid_encapsulation_and_decapsulation():
    """Verify sender encapsulation and recipient decapsulation derive identical shared secrets."""
    service = PQCService()
    keypair = service.generate_hybrid_keypair()

    # Sender encapsulates shared secret using recipient public keys
    encaps = service.encapsulate_secret(
        classical_public_key_b64=keypair["classical_public_key"],
        ml_kem_public_key_b64=keypair["ml_kem_public_key"],
    )

    sender_shared_key = base64.b64decode(encaps["shared_key_b64"])
    assert len(sender_shared_key) == 32

    # Recipient decapsulates using private keys
    recipient_shared_key = service.decapsulate_secret(
        ephemeral_classical_public_b64=encaps["ephemeral_classical_public"],
        ml_kem_ciphertext_b64=encaps["ml_kem_ciphertext"],
        classical_private_key_b64=keypair["classical_private_key"],
        ml_kem_public_key_b64=keypair["ml_kem_public_key"],
        kem_randomness_enc_b64=encaps["kem_randomness_enc"],
    )

    # Both parties derive the exact same 256-bit symmetric key
    assert sender_shared_key == recipient_shared_key


def test_quantum_safe_envelope_encryption_roundtrip():
    """Verify end-to-end encryption and decryption of payload using hybrid PQC envelope."""
    service = PQCService()
    keypair = service.generate_hybrid_keypair()
    secret_text = "NIST_POST_QUANTUM_PATIENT_RECORDS_FIPS_203_COMPLIANT"

    # Encrypt
    envelope = service.encrypt_quantum_safe(
        plaintext=secret_text,
        classical_public_key_b64=keypair["classical_public_key"],
        ml_kem_public_key_b64=keypair["ml_kem_public_key"],
    )

    assert "Hybrid X25519 + ML-KEM-768" in envelope["algorithm"]
    assert envelope["quantum_guarantee"] == "HNDL_IMMUNE (NIST FIPS 203 Level 3)"
    assert secret_text not in envelope["ciphertext"]

    # Decrypt
    decrypted = service.decrypt_quantum_safe(
        envelope=envelope,
        classical_private_key_b64=keypair["classical_private_key"],
        ml_kem_public_key_b64=keypair["ml_kem_public_key"],
    )
    assert decrypted == secret_text


def test_quantum_safe_decryption_wrong_key_fails():
    """Verify decryption fails if an attacker uses the wrong private key."""
    service = PQCService()
    valid_keypair = service.generate_hybrid_keypair()
    wrong_keypair = service.generate_hybrid_keypair()

    envelope = service.encrypt_quantum_safe(
        plaintext="CONFIDENTIAL_QUANTUM_DEFENSE_PLAN",
        classical_public_key_b64=valid_keypair["classical_public_key"],
        ml_kem_public_key_b64=valid_keypair["ml_kem_public_key"],
    )

    with pytest.raises(ValueError, match="PQC Decryption failed"):
        service.decrypt_quantum_safe(
            envelope=envelope,
            classical_private_key_b64=wrong_keypair["classical_private_key"],
            ml_kem_public_key_b64=wrong_keypair["ml_kem_public_key"],
        )


def test_ciphersuite_quantum_risk_scanner():
    """Verify identification of Harvest-Now-Decrypt-Later (HNDL) quantum vulnerable ciphersuites."""
    service = PQCService()
    test_suites = [
        "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384",
        "TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256",
        "X25519Kyber768Draft00_AES256_GCM",
        "TLS_AES_256_GCM_SHA384",
    ]

    scan = service.scan_ciphersuite_quantum_risk(
        ciphersuites=test_suites,
        actor="Pytest-PQCAuditor",
        org_id="test-quantum-org",
    )

    assert scan["status"] == "COMPLETED"
    assert scan["overall_posture"] == "CRITICAL_EXPOSURE"
    assert scan["critical_hndl_count"] >= 2
    assert scan["quantum_safe_count"] >= 1
    assert "merkle_seal" in scan
    assert scan["merkle_seal"]["status"] == "CRYPTOGRAPHICALLY_VERIFIED"


@pytest.mark.asyncio
async def test_pqc_fastapi_endpoints():
    """Verify FastAPI /pqc endpoints with bearer token authentication."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = create_access_token({"sub": "ciso@enterprise.com", "role": "admin", "org": "corp-grid"})
        auth_headers = {"Authorization": f"Bearer {token}"}

        # 1. Unauthenticated request should be rejected
        unauth_res = await client.post("/pqc/generate-keys")
        assert unauth_res.status_code in (401, 403)

        # 2. Generate keys
        keygen_res = await client.post("/pqc/generate-keys", headers=auth_headers)
        assert keygen_res.status_code == 200
        key_data = keygen_res.json()["keypair"]

        # 3. Encrypt payload
        enc_res = await client.post(
            "/pqc/encrypt",
            json={
                "plaintext": "QUANTUM_SAFE_PAYLOAD_TEST",
                "classical_public_key": key_data["classical_public_key"],
                "ml_kem_public_key": key_data["ml_kem_public_key"],
            },
            headers=auth_headers,
        )
        assert enc_res.status_code == 200
        envelope = enc_res.json()["envelope"]

        # 4. Decrypt payload
        dec_res = await client.post(
            "/pqc/decrypt",
            json={
                "envelope": envelope,
                "classical_private_key": key_data["classical_private_key"],
                "ml_kem_public_key": key_data["ml_kem_public_key"],
            },
            headers=auth_headers,
        )
        assert dec_res.status_code == 200
        assert dec_res.json()["plaintext"] == "QUANTUM_SAFE_PAYLOAD_TEST"

        # 5. Scan ciphersuites risk
        scan_res = await client.post(
            "/pqc/scan-risk",
            json={"ciphersuites": ["TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384", "X25519Kyber768Draft00_AES256_GCM"]},
            headers=auth_headers,
        )
        assert scan_res.status_code == 200
        assert scan_res.json()["critical_hndl_count"] >= 1

