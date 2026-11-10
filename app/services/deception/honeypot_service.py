"""
SageAI Deception Technology & Honeypot Service.

Deploys controlled honey-endpoints, canary tokens, and decoy services to detect
unauthorized exploration, capture attacker behavior, and trigger immediate high-priority alerts.
Fulfills Pillar V of the Master Plan.
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
        {
            "path": "/wp-login.php",
            "type": "WordPress Admin Decoy",
            "lure": "CMS Login",
            "category": "web",
        },
        {
            "path": "/.env",
            "type": "Configuration Decoy",
            "lure": "Secrets Disclosure",
            "category": "web",
        },
        {
            "path": "/admin/phpmyadmin",
            "type": "Database Interface Decoy",
            "lure": "DB Management",
            "category": "web",
        },
        {
            "path": "/actuator/env",
            "type": "Spring Actuator Decoy",
            "lure": "Microservice Secrets",
            "category": "web",
        },
        {
            "path": "/.git/config",
            "type": "Source Code Repo Decoy",
            "lure": "Git Repository",
            "category": "web",
        },
        {
            "path": "/api/v1/debug/keys",
            "type": "API Key Exposure Decoy",
            "lure": "API Tokens",
            "category": "web",
        },
        {
            "path": "/.aws/credentials",
            "type": "Cloud Credentials Decoy",
            "lure": "AWS Secret Keys",
            "category": "cloud",
        },
        {
            "path": "/.kube/config",
            "type": "Kubernetes Cluster Decoy",
            "lure": "K8s Admin Token",
            "category": "cloud",
        },
        {
            "path": "/id_rsa",
            "type": "SSH Private Key Decoy",
            "lure": "Server Shell Access",
            "category": "network",
        },
        {
            "path": "tcp://0.0.0.0:2222",
            "type": "SSH Honeypot Listener",
            "lure": "Interactive SSH Decoy",
            "category": "network",
        },
        {
            "path": "tcp://0.0.0.0:6379",
            "type": "Redis Honeypot Listener",
            "lure": "Unauthenticated In-Memory DB",
            "category": "network",
        },
        {
            "path": "tcp://0.0.0.0:5432",
            "type": "Postgres Honeypot Listener",
            "lure": "Database Connection Probe",
            "category": "network",
        },
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
        Any usage of this token proves credential leakage or compromise with 100% confidence.
        """
        token_id = secrets.token_hex(8)

        if token_type == "aws_key":
            canary_value = f"AKIA{secrets.token_hex(8).upper()}"
            secret_component = secrets.token_urlsafe(32)
        elif token_type == "jwt_token":
            canary_value = f"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbl9jYW5hcnkiLCJpZCI6InRva2VuX3t0b2tlbl9pZH0ifQ.{secrets.token_hex(16)}"
            secret_component = None
        elif token_type == "db_uri":
            canary_value = f"postgresql://canary_admin:{secrets.token_hex(6)}@db.internal.defense:5432/prod"
            secret_component = None
        elif token_type == "dns_token":
            canary_value = f"canary-{token_id}.auth.sageai.internal"
            secret_component = None
        else:
            canary_value = f"sage_honey_live_{secrets.token_urlsafe(24)}"
            secret_component = None

        token_record = {
            "token_id": token_id,
            "canary_value": canary_value,
            "secret_component": secret_component,
            "token_type": token_type,
            "label": label,
            "org_id": org_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "triggered": False,
            "trigger_count": 0,
            "last_triggered_by": None,
            "last_triggered_at": None,
        }
        self._canary_tokens[canary_value] = token_record
        return token_record

    def list_canary_tokens(self, org_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Returns registered canary tokens, optionally scoped to an organization."""
        if org_id is not None:
            return [
                t for t in self._canary_tokens.values() if t.get("org_id") == org_id
            ]
        return list(self._canary_tokens.values())

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
        fingerprint = hashlib.sha256(
            f"{source_ip}:{user_agent}".encode("utf-8")
        ).hexdigest()[:16]

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

    def verify_canary_access(
        self, token_value: str, source_ip: str, user_agent: str = "unknown"
    ) -> Optional[Dict[str, Any]]:
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
                "token_type": record["token_type"],
                "source_ip": source_ip,
                "user_agent": user_agent,
                "token_id": record["token_id"],
                "timestamp": record["last_triggered_at"],
                "confidence": "100% (Zero False Positive)",
                "threat_verdict": f"Canary token '{record['label']}' was exercised by external IP {source_ip}. Internal breach or credential leak confirmed.",
                "alert": f"Canary token '{record['label']}' was exercised by external IP {source_ip}. Internal breach or credential leak confirmed.",
            }
            self._interaction_log.append(alert)
            return alert
        return None

    def simulate_attacker_journey(
        self,
        decoy_path: str = "/.env",
        attacker_ip: str = "198.51.100.42",
        org_id: str = "system",
    ) -> Dict[str, Any]:
        """
        Simulates an end-to-end attacker deception journey:
        1. Attacker reconnaissance on decoy endpoint (e.g. /.env)
        2. Planted canary token (AKIA...) leaked to attacker
        3. Attacker exercises canary token
        4. SageAI flags confirmed breach and auto-escalates to SOAR containment.
        """
        from app.services.incident_response.soar_engine import soar_engine

        # Step 1: Hit decoy endpoint
        decoy_hit = self.record_decoy_hit(
            path=decoy_path,
            source_ip=attacker_ip,
            user_agent="Mozilla/5.0 (Hydra/v9.5; Attacker Recon)",
            payload="GET /.env HTTP/1.1",
            org_id=org_id,
        )

        # Step 2: Generate realistic canary token planted in that decoy
        canary = self.generate_canary_token(
            token_type="aws_key",
            label=f"Planted Decoy Key in {decoy_path}",
            org_id=org_id,
        )

        # Step 3: Attacker attempts to use the canary key
        canary_alert = self.verify_canary_access(
            token_value=canary["canary_value"],
            source_ip=attacker_ip,
            user_agent="aws-cli/2.15.0 Python/3.11",
        )

        # Step 4: Escalate to SOAR
        incident = soar_engine.create_incident(
            title=f"Deception Alert: Attacker exercised canary key from {decoy_path}",
            severity="CRITICAL",
            source="Deception Honeypot Mesh",
            details={
                "decoy_hit": decoy_hit,
                "canary_token": canary["token_id"],
                "attacker_ip": attacker_ip,
                "alert": canary_alert,
            },
            org_id=org_id,
        )

        return {
            "status": "SIMULATION_COMPLETE",
            "journey": [
                {
                    "step": 1,
                    "action": f"Attacker accessed decoy {decoy_path}",
                    "event_id": decoy_hit["event_id"],
                },
                {
                    "step": 2,
                    "action": f"Canary token generated & planted ({canary['canary_value'][:12]}...)",
                },
                {
                    "step": 3,
                    "action": f"Attacker invoked API using canary token from {attacker_ip}",
                },
                {
                    "step": 4,
                    "action": f"SOAR Incident created ({incident['incident_id']}) with automated containment playbooks",
                },
            ],
            "incident": incident,
        }

    def get_recent_alerts(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Returns the most recent deception alerts."""
        return self._interaction_log[-limit:]


# Global deception service singleton
honeypot_service = DeceptionHoneypotService()
deception_service = honeypot_service
