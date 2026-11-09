"""
SageAI Confidential Hardware Enclave Remote Attestation Module.
Supports AWS Nitro Enclaves, AMD SEV-SNP, and Intel SGX/TDX attestation.
"""

from app.services.enclave_attestation.hardware_attestation_service import (
    HardwareEnclaveAttestationService,
    hardware_attestation_service,
)

__all__ = ["HardwareEnclaveAttestationService", "hardware_attestation_service"]
