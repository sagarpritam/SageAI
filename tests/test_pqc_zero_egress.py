"""
Unit & Integration Tests for Post-Quantum Cryptography (PQC) Migration Layer:
NIST FIPS 203 (ML-KEM / Kyber) & NIST FIPS 204 (ML-DSA / Dilithium) Hybrid Key Encapsulation,
Digital Signatures, and Sovereign Zero-Egress Payloads.
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


def test_hybrid_signing_keypair_generation():
    """Verify dual classical Ed25519 and lattice ML-DSA-65 (Dilithium-3) signing keypair generation."""
    keypair = pqc_service.generate_hybrid_signing_keypair()

    assert keypair["algorithm"] == "Hybrid Ed25519 + ML-DSA-65"
    assert "RFC 8032 (Ed25519)" in keypair["standards"]
    assert "NIST FIPS 204 (ML-DSA)" in keypair["standards"]
    assert len(keypair["public_key_fingerprint"]) == 16

    classical_pub = base64.b64decode(keypair["classical_public_key"])
    classical_priv = base64.b64decode(keypair["classical_private_key"])
    ml_dsa_pub = base64.b64decode(keypair["ml_dsa_public_key"])
    ml_dsa_priv = base64.b64decode(keypair["ml_dsa_private_key"])

    assert len(classical_pub) == 32
    assert len(classical_priv) == 32
    assert len(ml_dsa_pub) == 1952
    assert len(ml_dsa_priv) == 4032


def test_hybrid_signing_and_verification():
    """Verify dual signing and verification across both classical and post-quantum layers."""
    service = PQCService()
    keys = service.generate_hybrid_signing_keypair()
    message = "SOVEREIGN_ENCLAVE_DIRECTIVE_CONFIDENTIAL_PQC_2026"

    # Sign message
    sig = service.sign_hybrid_payload(
        message=message,
        classical_private_key_b64=keys["classical_private_key"],
        ml_dsa_private_key_b64=keys["ml_dsa_private_key"],
        ml_dsa_public_key_b64=keys["ml_dsa_public_key"],
    )

    assert sig["algorithm"] == "Hybrid Ed25519 + ML-DSA-65"
    assert len(base64.b64decode(sig["classical_signature"])) == 64
    assert len(base64.b64decode(sig["ml_dsa_signature"])) == 3309

    # Verify signature
    is_valid = service.verify_hybrid_signature(
        message=message,
        hybrid_signature=sig,
        classical_public_key_b64=keys["classical_public_key"],
        ml_dsa_public_key_b64=keys["ml_dsa_public_key"],
    )
    assert is_valid is True


def test_hybrid_signature_tamper_detection():
    """Verify hybrid verification rejects tampered messages or modified signatures."""
    service = PQCService()
    keys = service.generate_hybrid_signing_keypair()
    message = "ORIGINAL_INTEGRITY_DIRECTIVE"

    sig = service.sign_hybrid_payload(
        message=message,
        classical_private_key_b64=keys["classical_private_key"],
        ml_dsa_private_key_b64=keys["ml_dsa_private_key"],
        ml_dsa_public_key_b64=keys["ml_dsa_public_key"],
    )

    # 1. Tampered message rejected
    is_valid_tampered = service.verify_hybrid_signature(
        message="TAMPERED_MALICIOUS_DIRECTIVE",
        hybrid_signature=sig,
        classical_public_key_b64=keys["classical_public_key"],
        ml_dsa_public_key_b64=keys["ml_dsa_public_key"],
    )
    assert is_valid_tampered is False

    # 2. Corrupted classical signature rejected
    bad_classical_sig = dict(sig)
    corrupted_bytes = bytearray(base64.b64decode(sig["classical_signature"]))
    corrupted_bytes[0] ^= 0xFF
    bad_classical_sig["classical_signature"] = base64.b64encode(corrupted_bytes).decode(
        "utf-8"
    )

    is_valid_corrupted_classical = service.verify_hybrid_signature(
        message=message,
        hybrid_signature=bad_classical_sig,
        classical_public_key_b64=keys["classical_public_key"],
        ml_dsa_public_key_b64=keys["ml_dsa_public_key"],
    )
    assert is_valid_corrupted_classical is False

    # 3. Corrupted ML-DSA signature rejected
    bad_ml_dsa_sig = dict(sig)
    corrupted_dsa_bytes = bytearray(base64.b64decode(sig["ml_dsa_signature"]))
    corrupted_dsa_bytes[10] ^= 0xFF
    bad_ml_dsa_sig["ml_dsa_signature"] = base64.b64encode(corrupted_dsa_bytes).decode(
        "utf-8"
    )

    is_valid_corrupted_dsa = service.verify_hybrid_signature(
        message=message,
        hybrid_signature=bad_ml_dsa_sig,
        classical_public_key_b64=keys["classical_public_key"],
        ml_dsa_public_key_b64=keys["ml_dsa_public_key"],
    )
    assert is_valid_corrupted_dsa is False


def test_zero_egress_pqc_payload_sealing_and_unsealing():
    """Verify end-to-end zero-egress sanitization, Kyber-768 encapsulation, and Dilithium-3 signature sealing."""
    service = PQCService()
    recipient_kem = service.generate_hybrid_keypair()
    sender_signing = service.generate_hybrid_signing_keypair()

    raw_payload = (
        "USER_SESSION=admin\n"
        "AWS_KEY=AKIAIOSFODNN7EXAMPLE\n"
        "DB=postgres://prod_admin:Secret99!@db.enclave.internal:5432/core\n"
        "CONTACT=auditor@sovereign.eu"
    )

    # 1. Seal payload for eu-central-1
    sealed = service.seal_zero_egress_pqc_payload(
        plaintext=raw_payload,
        destination_region="eu-central-1",
        sender_classical_signing_priv_b64=sender_signing["classical_private_key"],
        sender_ml_dsa_priv_b64=sender_signing["ml_dsa_private_key"],
        sender_ml_dsa_pub_b64=sender_signing["ml_dsa_public_key"],
        recipient_classical_pub_b64=recipient_kem["classical_public_key"],
        recipient_ml_kem_pub_b64=recipient_kem["ml_kem_public_key"],
    )

    assert sealed["status"] == "SEALED"
    assert sealed["region"] == "eu-central-1"
    assert sealed["sanitization_summary"]["tokens_replaced"] >= 3
    assert "ZERO" in sealed["sanitization_summary"]["leakage_risk_after"]
    assert "merkle_seal" in sealed
    assert sealed["merkle_seal"]["status"] == "CRYPTOGRAPHICALLY_VERIFIED"

    # Plaintext credentials must NEVER appear in ciphertext
    assert "AKIAIOSFODNN7EXAMPLE" not in sealed["ciphertext"]
    assert "Secret99!" not in sealed["ciphertext"]

    # 2. Unseal inside valid matching destination enclave (eu-central-1)
    unsealed = service.unseal_zero_egress_pqc_payload(
        pqc_envelope=sealed,
        recipient_classical_priv_b64=recipient_kem["classical_private_key"],
        recipient_ml_kem_pub_b64=recipient_kem["ml_kem_public_key"],
        sender_classical_pub_b64=sender_signing["classical_public_key"],
        sender_ml_dsa_pub_b64=sender_signing["ml_dsa_public_key"],
        current_region="eu-central-1",
    )

    assert unsealed["status"] == "UNSEALED"
    assert unsealed["signature_verified"] is True
    assert unsealed["integrity_verified"] is True
    # Sanitized tokens must be present, real raw secrets scrubbed
    assert "ENCLAVE_TOKEN_AWS_KEY" in unsealed["decrypted_plaintext"]
    assert "ENCLAVE_TOKEN_DB_URI" in unsealed["decrypted_plaintext"]
    assert "AKIAIOSFODNN7EXAMPLE" not in unsealed["decrypted_plaintext"]


def test_zero_egress_cross_region_violation_blocked():
    """Verify that a zero-egress payload bound to eu-central-1 cannot be unsealed in us-east-1."""
    service = PQCService()
    recipient_kem = service.generate_hybrid_keypair()
    sender_signing = service.generate_hybrid_signing_keypair()

    sealed = service.seal_zero_egress_pqc_payload(
        plaintext="PATIENT_HEALTH_RECORDS_GDPR_RESTRICTED",
        destination_region="eu-central-1",
        sender_classical_signing_priv_b64=sender_signing["classical_private_key"],
        sender_ml_dsa_priv_b64=sender_signing["ml_dsa_private_key"],
        sender_ml_dsa_pub_b64=sender_signing["ml_dsa_public_key"],
        recipient_classical_pub_b64=recipient_kem["classical_public_key"],
        recipient_ml_kem_pub_b64=recipient_kem["ml_kem_public_key"],
    )

    # Attempting to unseal in us-east-1 must be blocked by sovereign enclave boundary
    with pytest.raises(ValueError, match="Cross-Region Egress Violation"):
        service.unseal_zero_egress_pqc_payload(
            pqc_envelope=sealed,
            recipient_classical_priv_b64=recipient_kem["classical_private_key"],
            recipient_ml_kem_pub_b64=recipient_kem["ml_kem_public_key"],
            sender_classical_pub_b64=sender_signing["classical_public_key"],
            sender_ml_dsa_pub_b64=sender_signing["ml_dsa_public_key"],
            current_region="us-east-1",
        )


@pytest.mark.asyncio
async def test_fastapi_pqc_signing_and_zero_egress_routes():
    """Verify FastAPI PQC signature and zero-egress endpoints with Bearer token authentication."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        token = create_access_token(
            {"sub": "pqc_officer@defense.corp", "role": "admin", "org": "enclave-org"}
        )
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Generate Signing Keypair
        sign_res = await client.post("/pqc/generate-signing-keys", headers=headers)
        assert sign_res.status_code == 200
        signing_data = sign_res.json()["keypair"]
        assert signing_data["algorithm"] == "Hybrid Ed25519 + ML-DSA-65"

        # 2. Sign Payload
        sign_payload_res = await client.post(
            "/pqc/sign",
            json={
                "message": "COMMAND_DIRECTIVE_ALPHA",
                "classical_private_key": signing_data["classical_private_key"],
                "ml_dsa_private_key": signing_data["ml_dsa_private_key"],
                "ml_dsa_public_key": signing_data["ml_dsa_public_key"],
            },
            headers=headers,
        )
        assert sign_payload_res.status_code == 200
        signature = sign_payload_res.json()["signature"]

        # 3. Verify Signature
        verify_res = await client.post(
            "/pqc/verify-signature",
            json={
                "message": "COMMAND_DIRECTIVE_ALPHA",
                "hybrid_signature": signature,
                "classical_public_key": signing_data["classical_public_key"],
                "ml_dsa_public_key": signing_data["ml_dsa_public_key"],
            },
            headers=headers,
        )
        assert verify_res.status_code == 200
        assert verify_res.json()["valid"] is True

        # 4. Generate KEM keypair
        kem_res = await client.post("/pqc/generate-keys", headers=headers)
        kem_data = kem_res.json()["keypair"]

        # 5. Seal Zero-Egress Payload
        seal_res = await client.post(
            "/pqc/zero-egress/seal",
            json={
                "plaintext": "API_SECRET=sk-1234567890abcdef1234567890abcdef",
                "destination_region": "eu-central-1",
                "sender_classical_signing_priv": signing_data["classical_private_key"],
                "sender_ml_dsa_priv": signing_data["ml_dsa_private_key"],
                "sender_ml_dsa_pub": signing_data["ml_dsa_public_key"],
                "recipient_classical_pub": kem_data["classical_public_key"],
                "recipient_ml_kem_pub": kem_data["ml_kem_public_key"],
            },
            headers=headers,
        )
        assert seal_res.status_code == 200
        sealed_envelope = seal_res.json()["sealed_envelope"]
        assert sealed_envelope["status"] == "SEALED"

        # 6. Unseal in matching enclave region
        unseal_res = await client.post(
            "/pqc/zero-egress/unseal",
            json={
                "pqc_envelope": sealed_envelope,
                "recipient_classical_priv": kem_data["classical_private_key"],
                "recipient_ml_kem_pub": kem_data["ml_kem_public_key"],
                "sender_classical_pub": signing_data["classical_public_key"],
                "sender_ml_dsa_pub": signing_data["ml_dsa_public_key"],
                "current_region": "eu-central-1",
            },
            headers=headers,
        )
        assert unseal_res.status_code == 200
        unsealed_data = unseal_res.json()["unsealed_result"]
        assert unsealed_data["signature_verified"] is True
        assert "ENCLAVE_TOKEN_API_KEY" in unsealed_data["decrypted_plaintext"]
