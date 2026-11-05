"""
SageAI Zero-Trust Workload Identity Fabric Module (SPIFFE/SPIRE & Cilium eBPF L7).
"""

from app.services.workload_identity.spiffe_spire_service import (
    SpiffeSpireIdentityService,
    spiffe_spire_service,
)

__all__ = ["SpiffeSpireIdentityService", "spiffe_spire_service"]

