"""
Tests for SageAI Wave 6 Phase 6.1: Confidential Hardware Enclave Remote Attestation.
"""

import base64
import json

from app.services.enclave_attestation.hardware_attestation_service import (
    hardware_attestation_service,
)


def test_get_golden_measurements():
    res = hardware_attestation_service.get_golden_measurements()
    assert res["status"] == "success"
    assert "AWS_NITRO" in res["golden_measurements"]
    assert "AMD_SEV_SNP" in res["golden_measurements"]
    assert "INTEL_SGX" in res["golden_measurements"]
    assert "PCR0" in res["golden_measurements"]["AWS_NITRO"]


def test_register_golden_measurement():
    new_hash = "1111222233334444555566667777888899990000aaaabbbbccccddddeeeeffff"
    res = hardware_attestation_service.register_golden_measurement(
        platform="AWS_NITRO",
        measurement_key="PCR0",
        expected_hash=new_hash,
        operator="TestSecOpsLead",
    )
    assert res["status"] == "success"
    assert res["golden_measurements"]["PCR0"] == new_hash

    # Restore default
    hardware_attestation_service.register_golden_measurement(
        platform="AWS_NITRO",
        measurement_key="PCR0",
        expected_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    )


def test_verify_nitro_attestation_success():
    # Valid doc matching Golden Reference PCRs
    doc = {
        "module_id": "i-nitro-valid-01",
        "pcrs": {
            "0": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "1": "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
            "2": "4e1243bd22c66e76c2ba9eddc1f91394e57f9f835f15d7f1d3c01bf68595305f",
        },
    }
    doc_b64 = base64.b64encode(json.dumps(doc).encode()).decode()
    res = hardware_attestation_service.verify_nitro_attestation(doc_b64)

    assert res["valid"] is True
    assert res["verification_status"] == "HARDWARE_ATTESTED_GENUINE"
    assert res["pcr_results"]["pcr0_valid"] is True


def test_verify_nitro_attestation_tampering():
    # Tampered PCR0 simulating attacker injected kernel module
    doc = {
        "module_id": "i-nitro-tampered-01",
        "pcrs": {
            "0": "badbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbad0",
            "1": "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
        },
    }
    doc_b64 = base64.b64encode(json.dumps(doc).encode()).decode()
    res = hardware_attestation_service.verify_nitro_attestation(doc_b64)

    assert res["valid"] is False
    assert res["verification_status"] == "ATTESTATION_TAMPERING_DETECTED"
    assert res["pcr_results"]["pcr0_valid"] is False


def test_verify_amd_sev_snp_success():
    meas = "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b73b5ee0e02c525f24ec4472d7f8d6899"
    res = hardware_attestation_service.verify_amd_sev_snp(meas)
    assert res["valid"] is True
    assert res["verification_status"] == "HARDWARE_SEV_SNP_VALIDATED"
    assert res["measurement_valid"] is True


def test_verify_amd_sev_snp_tampering():
    bad_meas = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
    res = hardware_attestation_service.verify_amd_sev_snp(bad_meas)
    assert res["valid"] is False
    assert res["verification_status"] == "SEV_SNP_MEASUREMENT_MISMATCH"


def test_verify_intel_sgx_quote():
    mrenclave = "b6589fc6ab0dc82cf12099d1c2d40ab994e8410c"
    res = hardware_attestation_service.verify_intel_sgx_quote(mrenclave)
    assert res["valid"] is True
    assert res["verification_status"] == "INTEL_PCS_QUOTE_VERIFIED"


def test_unseal_secret_genuine_enclave():
    doc = {
        "module_id": "i-nitro-valid-01",
        "pcrs": {
            "0": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "1": "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
        },
    }
    doc_b64 = base64.b64encode(json.dumps(doc).encode()).decode()

    res = hardware_attestation_service.unseal_secret_with_attestation(
        platform="AWS_NITRO",
        attestation_payload={"attestation_doc_b64": doc_b64},
        secret_id="sovereign-vault-master-key",
    )
    assert res["status"] == "UNSEALED_SUCCESSFULLY"
    assert "SOV_AES256" in res["secret_value"]
    assert res["attestation_seal"]["enclave_status"] == "HARDWARE_ATTESTED_GENUINE"


def test_unseal_secret_tampered_enclave_rejected():
    doc = {
        "module_id": "i-nitro-bad-01",
        "pcrs": {
            "0": "tampered_pcr_attacker_controlled_hash_000000000000000000000000",
            "1": "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
        },
    }
    doc_b64 = base64.b64encode(json.dumps(doc).encode()).decode()

    res = hardware_attestation_service.unseal_secret_with_attestation(
        platform="AWS_NITRO",
        attestation_payload={"attestation_doc_b64": doc_b64},
        secret_id="sovereign-vault-master-key",
    )
    assert res["status"] == "DENIED"
    assert "Secret release aborted" in res["reason"]
