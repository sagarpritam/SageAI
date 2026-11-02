"""
SageAI Deception Technology & Honeypot Service.

Deploys controlled honey-endpoints, canary tokens, and decoy services to detect
unauthorized exploration, capture attacker behavior, and trigger immediate high-priority alerts.
"""

import hashlib
import logging
import secrets
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

logger = logging.getLogger("SageAI.deception")


class DeceptionHoneypotService:
    """
    Manages controlled deception decoys and canary credentials.
    Access to any honeypot resource is treated as a confirmed intrusion attempt (0% false positives).
    """

    DECOY_ENDPOINTS = [
        {"path": "/wp-login.php", "type": "WordPress Admin Decoy", "lure": "CMS Login"},
        {"path": "/.env", "type": "Configuration Decoy", "lure": "Secrets Disclosure"},
        {"path": "/admin/phpmyadmin", "type": "Database Interface Decoy", "lure": "DB Management"},
        {"path": "/actuator/env", "type": "Spring Actuator Decoy", "lure": "Microservice Secrets"},
        {"path": "/.git/config", "type": "Source Code Repo Decoy", "lure": "Git Repository"},
        {"path": "/api/v1/debug/keys", "type": "API Key Exposure Decoy", "lure": "API Tokens"},
    ]

    def __init__(self):
        self._interaction_log: List[Dict[str, Any]] = []
        self._canary_tokens: Dict[str, Dict[str, Any]] = {}

    def get_decoy_endpoints(self) -> List[Dict[str, Any]]:
        """Returns registered decoy endpoint definitions."""
        return self.DECOY_ENDPOINTS

    def generate_canary_token(
        self,
        token_type: str = "api_key",
        label: str = "Production Cloud DB Key",
        org_id: str = "system",
    ) -> Dict[str, Any]:
        """
        Generates realistic decoy credentials (honey-token).
        Any usage of this token proves credential leakage or compromise.
        """
        token_id = secrets.token_hex(8)
        if token_type == "aws_key":
            canary_value = f"AKIA{secrets.token_hex(8).upper()}"
        else:
            canary_value = f"sage_honey_live_{secrets.token_urlsafe(24)}"

        token_record = {
            "token_id": token_id,
            "canary_value": canary_value,
            "token_type": token_type,
            "label": label,
            "org_id": org_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "triggered": False,
            "trigger_count": 0,
        }
        self._canary_tokens[canary_value] = token_record
        return token_record

    def record_decoy_hit(
        self,
        path: str,
        source_ip: str,
        user_agent: str = "unknown",
        headers: Optional[Dict[str, str]] = None,
        payload: Optional[str] = None,
        org_id: str = "system",
    ) -> Dict[str, Any]:
        """
        Records an unauthorized probe against a decoy endpoint.
        """
        timestamp = datetime.now(timezone.utc).isoformat()
        fingerprint = hashlib.sha256(f"{source_ip}:{user_agent}".encode("utf-8")).hexdigest()[:16]

        event = {
            "event_id": f"decoy_{secrets.token_hex(6)}",
            "type": "HONEYPOT_DECOY_TRIGGERED",
            "severity": "CRITICAL",
            "path": path,
            "source_ip": source_ip,
            "user_agent": user_agent,
            "fingerprint": fingerprint,
            "headers": headers or {},
            "payload_snippet": (payload or "")[:200],
            "timestamp": timestamp,
            "org_id": org_id,
            "confidence": "100% (Zero False Positive)",
            "threat_verdict": f"Unauthorized probe on decoy endpoint '{path}' from {source_ip}",
        }

        self._interaction_log.append(event)
        logger.warning(
            f"[DECEPTION ALERT] Decoy endpoint {path} hit by {source_ip} (Fingerprint: {fingerprint})"
        )
        return event

    def verify_canary_access(self, token_value: str, source_ip: str) -> Optional[Dict[str, Any]]:
        """
        Checks if an observed token matches a registered honey-token.
        """
        if token_value in self._canary_tokens:
            record = self._canary_tokens[token_value]
            record["triggered"] = True
            record["trigger_count"] += 1
            record["last_triggered_by"] = source_ip
            record["last_triggered_at"] = datetime.now(timezone.utc).isoformat()

            alert = {
                "event_id": f"canary_{secrets.token_hex(6)}",
                "type": "CANARY_TOKEN_COMPROMISED",
                "severity": "CRITICAL",
                "label": record["label"],
                "source_ip": source_ip,
                "token_id": record["token_id"],
                "timestamp": record["last_triggered_at"],
                "confidence": "100%",
                "alert": f"Canary token '{record['label']}' was exercised by external IP {source_ip}. Internal breach or credential leak confirmed.",
            }
            self._interaction_log.append(alert)
            return alert
        return None

    def get_recent_alerts(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Returns the most recent deception alerts."""
        return self._interaction_log[-limit:]


# Global deception service singleton
honeypot_service = DeceptionHoneypotService()
