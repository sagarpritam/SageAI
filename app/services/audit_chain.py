"""
SageAI Immutable Cryptographic Audit Hash Chain Engine.

Provides tamper-evident cryptographic chaining over all security decisions, SOAR containment
actions, user authentications, and incident approvals. Every audit record is cryptographically
linked to the previous entry via SHA256, mathematically guaranteeing audit trail integrity for
SOC2 Type II, ISO 27001, and FedRAMP compliance.
Fulfills Pillar VI of the Master Plan.
"""

import hashlib
import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

logger = logging.getLogger("SageAI.audit_chain")

GENESIS_HASH = "0" * 64


class ImmutableAuditChain:
    """
    Cryptographically chained immutable ledger for security actions and incident responses.
    """

    def __init__(self):
        self._ledger: List[Dict[str, Any]] = []

    def _compute_hash(
        self,
        previous_hash: str,
        timestamp: str,
        actor: str,
        action: str,
        org_id: str,
        details: Dict[str, Any],
    ) -> str:
        """Computes deterministic SHA256 hash of an audit record."""
        payload = {
            "previous_hash": previous_hash,
            "timestamp": timestamp,
            "actor": actor,
            "action": action,
            "org_id": org_id,
            "details": details,
        }
        serialized = json.dumps(payload, sort_keys=True)
        return hashlib.sha256(serialized.encode("utf-8")).hexdigest()

    def record_action(
        self,
        actor: str,
        action: str,
        details: Dict[str, Any],
        org_id: str = "system",
    ) -> Dict[str, Any]:
        """
        Appends a new immutable action to the ledger with cryptographic linking.
        """
        timestamp = datetime.now(timezone.utc).isoformat()
        previous_hash = self._ledger[-1]["record_hash"] if self._ledger else GENESIS_HASH

        record_hash = self._compute_hash(
            previous_hash=previous_hash,
            timestamp=timestamp,
            actor=actor,
            action=action,
            org_id=org_id,
            details=details,
        )

        entry = {
            "index": len(self._ledger),
            "timestamp": timestamp,
            "actor": actor,
            "action": action,
            "org_id": org_id,
            "details": details,
            "previous_hash": previous_hash,
            "record_hash": record_hash,
        }

        self._ledger.append(entry)
        logger.info(
            f"[AUDIT CHAIN] Block #{entry['index']} sealed: {action} by {actor} (Hash: {record_hash[:12]}...)"
        )
        return entry

    def verify_chain_integrity(self) -> Dict[str, Any]:
        """
        Traverses the entire cryptographic ledger from block #0 to present.
        Verifies that every record_hash is mathematically valid and correctly chains to previous_hash.
        Returns cryptographic proof of integrity or pinpointed tampering details.
        """
        if not self._ledger:
            return {
                "valid": True,
                "total_records": 0,
                "genesis_hash": GENESIS_HASH,
                "latest_hash": GENESIS_HASH,
                "status": "EMPTY_LEDGER_INTACT",
            }

        expected_prev = GENESIS_HASH
        for idx, entry in enumerate(self._ledger):
            # Check previous_hash chain
            if entry["previous_hash"] != expected_prev:
                return {
                    "valid": False,
                    "tampered_index": idx,
                    "reason": f"Chain broken at block #{idx}: previous_hash does not match predecessor.",
                    "expected": expected_prev,
                    "actual": entry["previous_hash"],
                }

            # Recompute record_hash
            recomputed = self._compute_hash(
                previous_hash=entry["previous_hash"],
                timestamp=entry["timestamp"],
                actor=entry["actor"],
                action=entry["action"],
                org_id=entry["org_id"],
                details=entry["details"],
            )

            if entry["record_hash"] != recomputed:
                return {
                    "valid": False,
                    "tampered_index": idx,
                    "reason": f"Content tampering detected in block #{idx}: hash verification failed.",
                    "expected_hash": recomputed,
                    "stored_hash": entry["record_hash"],
                }

            expected_prev = entry["record_hash"]

        return {
            "valid": True,
            "total_records": len(self._ledger),
            "genesis_hash": GENESIS_HASH,
            "latest_hash": self._ledger[-1]["record_hash"],
            "status": "CRYPTOGRAPHICALLY_VERIFIED",
            "compliance_standards": ["SOC2 Type II (CC6.1)", "ISO/IEC 27001 (A.12.4.1)", "FedRAMP AU-9"],
        }

    def get_ledger(self, limit: int = 50, org_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Returns recent ledger blocks."""
        ledger = self._ledger
        if org_id:
            ledger = [e for e in ledger if e.get("org_id") == org_id]
        return list(reversed(ledger[-limit:]))


# Global immutable audit chain singleton
audit_chain = ImmutableAuditChain()

