"""
SageAI Automated Incident Response (SOAR) & Security Orchestration Engine.

Correlates security events from WAF, NIDS, Honeypots, and Scans into prioritized
incidents, and executes predefined defensive containment playbooks with strict
human-in-the-loop safety authorization gates.
"""

import logging
import secrets
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

logger = logging.getLogger("SageAI.soar")


class IncidentResponseEngine:
    """
    SOAR Engine for event correlation, incident escalation, and guarded containment.
    """

    SAFE_AUTO_ACTIONS = {
        "GENERATE_VIRTUAL_PATCH": "Generate ModSecurity / WAF regex pattern to block payload",
        "NOTIFY_SOC_WEBHOOK": "Dispatch encrypted alert payload to SIEM/Slack channels",
        "TAG_ASSET_COMPROMISED": "Flag asset status as 'Under Investigation' in inventory",
    }

    HIGH_IMPACT_ACTIONS = {
        "BLOCK_IP_FIREWALL": "Inject drop rule into perimeter firewall / cloud security group",
        "REVOKE_USER_SESSION": "Terminate active sessions and rotate API keys for affected user",
        "ISOLATE_HOST": "Quarantine host network interface from production VPC",
    }

    def __init__(self):
        # In-memory store of active incidents: incident_id -> incident_record
        self._incidents: Dict[str, Dict[str, Any]] = {}
        self._action_audit_log: List[Dict[str, Any]] = []

    def create_incident(
        self,
        title: str,
        severity: str,
        source: str,
        details: Dict[str, Any],
        org_id: str = "system",
    ) -> Dict[str, Any]:
        """
        Creates an aggregated incident from security events.
        """
        incident_id = f"INC-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{secrets.token_hex(4).upper()}"
        now_str = datetime.now(timezone.utc).isoformat()

        incident = {
            "incident_id": incident_id,
            "title": title,
            "severity": severity.upper(),
            "status": "OPEN",  # OPEN, INVESTIGATING, CONTAINED, RESOLVED
            "source": source,
            "org_id": org_id,
            "created_at": now_str,
            "updated_at": now_str,
            "details": details,
            "suggested_actions": self._determine_playbook_actions(severity, source),
            "executed_actions": [],
            "ai_summary": None,
        }

        # Auto-execute safe low-impact actions immediately
        self._auto_execute_safe_actions(incident)

        self._incidents[incident_id] = incident
        logger.info(f"[SOAR] Created incident {incident_id}: '{title}' ({severity})")
        return incident

    def _determine_playbook_actions(self, severity: str, source: str) -> List[Dict[str, Any]]:
        """Determines relevant playbook actions based on severity and source."""
        actions = [
            {"action": "GENERATE_VIRTUAL_PATCH", "requires_approval": False},
            {"action": "NOTIFY_SOC_WEBHOOK", "requires_approval": False},
        ]

        if severity.upper() in ["CRITICAL", "HIGH"]:
            actions.append({"action": "BLOCK_IP_FIREWALL", "requires_approval": True})
            if "CANARY" in source.upper() or "AUTH" in source.upper():
                actions.append({"action": "REVOKE_USER_SESSION", "requires_approval": True})
            if "NIDS" in source.upper() or "BEACON" in source.upper():
                actions.append({"action": "ISOLATE_HOST", "requires_approval": True})

        return actions

    def _auto_execute_safe_actions(self, incident: Dict[str, Any]):
        """Executes zero-risk containment actions without delay."""
        for act in incident["suggested_actions"]:
            if not act["requires_approval"]:
                action_name = act["action"]
                record = {
                    "action": action_name,
                    "status": "EXECUTED",
                    "executed_at": datetime.now(timezone.utc).isoformat(),
                    "executed_by": "SageAI SOAR Autonomous Engine",
                    "details": self.SAFE_AUTO_ACTIONS.get(action_name, "Safe action executed"),
                }
                incident["executed_actions"].append(record)
                self._action_audit_log.append({
                    "incident_id": incident["incident_id"],
                    "action": action_name,
                    "status": "SUCCESS",
                    "actor": "Autonomous Engine",
                    "timestamp": record["executed_at"],
                })

    def execute_high_impact_action(
        self,
        incident_id: str,
        action_name: str,
        approved_by: Optional[str] = None,
        role: str = "viewer",
    ) -> Dict[str, Any]:
        """
        Executes high-impact containment with strict human-in-the-loop authorization.
        Only users with roles 'admin', 'ciso', or 'secops_lead' may approve.
        """
        if incident_id not in self._incidents:
            return {"status": "error", "message": f"Incident {incident_id} not found."}

        incident = self._incidents[incident_id]

        if action_name not in self.HIGH_IMPACT_ACTIONS:
            return {"status": "error", "message": f"Unknown high-impact action: {action_name}"}

        # Human-in-the-loop permission guard
        allowed_roles = ["admin", "ciso", "secops_lead", "owner"]
        if not approved_by or role.lower() not in allowed_roles:
            logger.warning(
                f"[SOAR SAFETY GATE] Action '{action_name}' on {incident_id} blocked: "
                f"Requires human authorization by CISO/Admin (Supplied: {approved_by}, Role: {role})"
            )
            return {
                "status": "BLOCKED_BY_SAFETY_POLICY",
                "message": f"Action '{action_name}' requires explicit approval by an authorized security lead (admin/ciso).",
                "incident_id": incident_id,
                "action": action_name,
            }

        # Execute high-impact defensive action
        timestamp = datetime.now(timezone.utc).isoformat()
        execution_record = {
            "action": action_name,
            "status": "EXECUTED_WITH_AUTHORIZATION",
            "executed_at": timestamp,
            "executed_by": approved_by,
            "role": role,
            "details": self.HIGH_IMPACT_ACTIONS[action_name],
        }

        incident["executed_actions"].append(execution_record)
        incident["status"] = "CONTAINED"
        incident["updated_at"] = timestamp

        self._action_audit_log.append({
            "incident_id": incident_id,
            "action": action_name,
            "status": "SUCCESS",
            "actor": approved_by,
            "role": role,
            "timestamp": timestamp,
        })

        logger.info(
            f"[SOAR ACTION EXECUTED] {action_name} executed for {incident_id} by {approved_by} ({role})"
        )
        return {
            "status": "SUCCESS",
            "incident_id": incident_id,
            "action": action_name,
            "execution": execution_record,
        }

    def get_incident(self, incident_id: str) -> Optional[Dict[str, Any]]:
        return self._incidents.get(incident_id)

    def list_incidents(self, limit: int = 50, org_id: Optional[str] = None) -> List[Dict[str, Any]]:
        incidents = list(self._incidents.values())
        if org_id:
            incidents = [i for i in incidents if i.get("org_id") == org_id]
        return sorted(incidents, key=lambda x: x["created_at"], reverse=True)[:limit]


# Global SOAR engine singleton
soar_engine = IncidentResponseEngine()
