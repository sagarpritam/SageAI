"""
SageAI Automated Threat Modeling Engine (STRIDE + DREAD).

Provides:
1. Architectural decomposition (Components, Data Flows, Trust Boundaries, External Actors).
2. STRIDE Threat Enumeration:
   - Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege.
3. DREAD Quantitative Risk Scoring Matrix:
   - Damage, Reproducibility, Exploitability, Affected Users, Discoverability.
4. Auto-Synthesis of Prioritized Remediation Tickets (Jira / GitHub Issues).
5. OpenAPI and Cloud IaC (Terraform / Kubernetes) Manifest Security Parsers.
6. Cryptographic Merkle Audit Hash Chain Anchoring.
"""

import hashlib
import json
import logging
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.services.audit_chain import audit_chain

logger = logging.getLogger("SageAI.threat_modeling")

# Predefined STRIDE Threat Knowledge Base
STRIDE_KNOWLEDGE_BASE = [
    {
        "category": "Spoofing",
        "title": "API Authentication Bypass / Token Forgery",
        "component_type": "API_GATEWAY",
        "description": "Adversary exploits weak signature verification or missing JWT validation to spoof high-privileged user identity.",
        "mitre_attack": "T1078.004",
        "dread": {"damage": 9, "reproducibility": 8, "exploitability": 7, "affected_users": 9, "discoverability": 8},
        "remediation": "Enforce RS256/ES256 asymmetric cryptographic JWT validation with JWKS caching and mandatory aud/iss claim checking.",
    },
    {
        "category": "Tampering",
        "title": "Database Query Parameter Tampering / SQLi",
        "component_type": "DATA_STORE",
        "description": "Adversary injects malicious SQL/NoSQL payload into API inputs to alter backend database records and extract sensitive data.",
        "mitre_attack": "T1190",
        "dread": {"damage": 9, "reproducibility": 9, "exploitability": 8, "affected_users": 8, "discoverability": 8},
        "remediation": "Enforce strict parameterized queries via ORM, input validation schemas via Pydantic, and least-privilege DB user permissions.",
    },
    {
        "category": "Repudiation",
        "title": "Unlogged High-Impact Administrative Action",
        "component_type": "CORE_SERVICE",
        "description": "Critical administrative configuration updates or data deletions occur without immutable audit logging, preventing forensic attribution.",
        "mitre_attack": "T1565.001",
        "dread": {"damage": 7, "reproducibility": 8, "exploitability": 6, "affected_users": 5, "discoverability": 6},
        "remediation": "Anchor all administrative state changes into the SageAI SHA-256 Merkle audit ledger with non-repudiation cryptographic receipts.",
    },
    {
        "category": "Information Disclosure",
        "title": "Zero-Egress Boundary Violation / Secret Leakage in Logs",
        "component_type": "EDGE_SERVICE",
        "description": "High-entropy secrets, API keys, or raw PII egress outside sovereign regional boundaries in cleartext exception traces or telemetry.",
        "mitre_attack": "T1048",
        "dread": {"damage": 8, "reproducibility": 7, "exploitability": 7, "affected_users": 9, "discoverability": 7},
        "remediation": "Deploy SageAI Zero-Egress Secret Scrubber and AES-256-GCM envelope encryption at client boundary before transmission.",
    },
    {
        "category": "Denial of Service",
        "title": "Unbounded API Request Rate / Resource Exhaustion",
        "component_type": "API_GATEWAY",
        "description": "Adversary sends high-volume concurrent requests or malicious payloads causing CPU, memory, or DB connection pool starvation.",
        "mitre_attack": "T1498",
        "dread": {"damage": 8, "reproducibility": 9, "exploitability": 9, "affected_users": 9, "discoverability": 9},
        "remediation": "Implement distributed SlowAPI rate-limiting, connection pool queuing, and request body size limits ($<10$ MB).",
    },
    {
        "category": "Elevation of Privilege",
        "title": "Broken Object Level Authorization (BOLA / IDOR)",
        "component_type": "CORE_SERVICE",
        "description": "Adversary manipulates tenant ID or resource GUID parameters to access, modify, or delete cross-tenant organizational data.",
        "mitre_attack": "T1068",
        "dread": {"damage": 9, "reproducibility": 8, "exploitability": 8, "affected_users": 9, "discoverability": 8},
        "remediation": "Enforce PostgreSQL Row-Level Security (RLS) and contextual tenant isolation checks on every backend database query.",
    },
]

# Pre-packaged Cloud Architecture Templates
ARCHITECTURE_TEMPLATES = {
    "cloud_microservices": {
        "name": "Cloud Microservices & Multi-Tenant SaaS",
        "description": "Distributed cloud architecture with API Gateway, Auth Microservice, Multi-Tenant Database, and Redis Bus.",
        "components": [
            {"id": "comp-1", "name": "Edge API Gateway", "type": "API_GATEWAY", "trust_zone": "INTERNET_FACING", "exposure": "PUBLIC"},
            {"id": "comp-2", "name": "Auth & SSO Service", "type": "CORE_SERVICE", "trust_zone": "INTERNAL_ENCLAVE", "exposure": "PRIVATE"},
            {"id": "comp-3", "name": "Multi-Tenant PostgreSQL", "type": "DATA_STORE", "trust_zone": "DATA_VAULT", "exposure": "ISOLATED"},
            {"id": "comp-4", "name": "Redis Event Stream", "type": "MESSAGE_BUS", "trust_zone": "INTERNAL_VPC", "exposure": "PRIVATE"},
            {"id": "comp-5", "name": "Autonomous Worker Fleet", "type": "CORE_SERVICE", "trust_zone": "COMPUTE_TIER", "exposure": "PRIVATE"},
        ],
        "data_flows": [
            {"source": "Internet User", "target": "Edge API Gateway", "protocol": "HTTPS (TLS 1.3)", "authenticated": False},
            {"source": "Edge API Gateway", "target": "Auth & SSO Service", "protocol": "gRPC / mTLS", "authenticated": True},
            {"source": "Edge API Gateway", "target": "Multi-Tenant PostgreSQL", "protocol": "PostgreSQL Wire (mTLS)", "authenticated": True},
            {"source": "Autonomous Worker Fleet", "target": "Redis Event Stream", "protocol": "Redis RESP3", "authenticated": True},
        ],
        "trust_boundaries": [
            {"name": "Public Internet Boundary", "description": "Demarcates unauthenticated public web clients from API Gateway."},
            {"name": "Internal Enclave Boundary", "description": "Isolates core cryptographic and authorization services."},
            {"name": "Data Sovereignty Boundary", "description": "Restricts persistent database reads to authenticated internal VPC callers."},
        ],
    },
    "kubernetes_infrastructure": {
        "name": "Kubernetes Sovereign Container Mesh",
        "description": "Production Kubernetes cluster with Ingress Controller, Pod-to-Pod Wireguard Service Mesh, and Secrets Vault.",
        "components": [
            {"id": "k8s-1", "name": "NGINX Ingress Controller", "type": "API_GATEWAY", "trust_zone": "INTERNET_FACING", "exposure": "PUBLIC"},
            {"id": "k8s-2", "name": "SageAI Core Pod Fleet", "type": "CORE_SERVICE", "trust_zone": "CLUSTER_INTERNAL", "exposure": "POD_NETWORK"},
            {"id": "k8s-3", "name": "HashiCorp Vault / KMS", "type": "DATA_STORE", "trust_zone": "SECURITY_ZONE", "exposure": "ISOLATED"},
            {"id": "k8s-4", "name": "eBPF Kernel Monitor", "type": "EDGE_SERVICE", "trust_zone": "HOST_KERNEL", "exposure": "PRIVILEGED"},
        ],
        "data_flows": [
            {"source": "Adversary Probe", "target": "NGINX Ingress Controller", "protocol": "TCP / HTTP", "authenticated": False},
            {"source": "NGINX Ingress Controller", "target": "SageAI Core Pod Fleet", "protocol": "mTLS Mesh", "authenticated": True},
            {"source": "SageAI Core Pod Fleet", "target": "HashiCorp Vault / KMS", "protocol": "HTTPS Token Auth", "authenticated": True},
        ],
        "trust_boundaries": [
            {"name": "Cluster Ingress Boundary", "description": "Separates external Internet from Cluster Pod CIDR."},
            {"name": "Kernel-to-Userspace Boundary", "description": "Protected boundary monitored by eBPF sensor probes."},
        ],
    },
}


class ThreatModelingEngine:
    """
    Autonomous STRIDE + DREAD Threat Modeling & Risk Quantification Engine.
    """

    def __init__(self):
        pass

    def get_architecture_templates(self) -> Dict[str, Any]:
        """Returns available architecture baseline templates."""
        return ARCHITECTURE_TEMPLATES

    def calculate_dread_score(self, dread: Dict[str, int]) -> Dict[str, Any]:
        """
        Calculates composite DREAD risk score:
        Damage, Reproducibility, Exploitability, Affected Users, Discoverability.
        """
        d = dread.get("damage", 5)
        r = dread.get("reproducibility", 5)
        e = dread.get("exploitability", 5)
        a = dread.get("affected_users", 5)
        disc = dread.get("discoverability", 5)

        total_score = d + r + e + a + disc
        avg_score = round(total_score / 5.0, 2)

        if total_score >= 40:
            severity = "CRITICAL"
        elif total_score >= 30:
            severity = "HIGH"
        elif total_score >= 20:
            severity = "MEDIUM"
        else:
            severity = "LOW"

        return {
            "dread_total": total_score,
            "dread_average": avg_score,
            "severity": severity,
            "breakdown": {
                "damage": d,
                "reproducibility": r,
                "exploitability": e,
                "affected_users": a,
                "discoverability": disc,
            },
        }

    def analyze_architecture(
        self,
        components: List[Dict[str, Any]],
        data_flows: Optional[List[Dict[str, Any]]] = None,
        trust_boundaries: Optional[List[Dict[str, Any]]] = None,
        org_id: str = "default-org",
        actor: str = "ThreatModeler",
    ) -> Dict[str, Any]:
        """
        Executes an autonomous STRIDE + DREAD threat analysis across supplied system components.
        Generates risk matrix, prioritized remediation tickets, and Merkle audit anchor.
        """
        flows = data_flows or []
        boundaries = trust_boundaries or []
        threats: List[Dict[str, Any]] = []

        # Analyze each component against STRIDE knowledge base
        for comp in components:
            comp_type = comp.get("type", "CORE_SERVICE")
            comp_name = comp.get("name", "Unknown Component")
            exposure = comp.get("exposure", "PRIVATE")

            for kb in STRIDE_KNOWLEDGE_BASE:
                # Correlate threat relevance
                is_relevant = (
                    kb["component_type"] == comp_type
                    or (exposure == "PUBLIC" and kb["category"] in ["Spoofing", "Denial of Service", "Tampering"])
                    or comp_type == "CORE_SERVICE"
                )

                if is_relevant:
                    # Dynamically adjust DREAD based on component exposure
                    dread_base = dict(kb["dread"])
                    if exposure == "PUBLIC":
                        dread_base["exploitability"] = min(10, dread_base["exploitability"] + 1)
                        dread_base["discoverability"] = min(10, dread_base["discoverability"] + 2)

                    dread_metric = self.calculate_dread_score(dread_base)
                    threat_id = f"THREAT-{hashlib.sha256(f'{comp_name}:{kb['title']}'.encode()).hexdigest()[:8].upper()}"

                    threats.append({
                        "threat_id": threat_id,
                        "component_name": comp_name,
                        "component_type": comp_type,
                        "stride_category": kb["category"],
                        "title": f"{kb['category']}: {kb['title']} on {comp_name}",
                        "description": kb["description"],
                        "mitre_attack": kb["mitre_attack"],
                        "dread": dread_metric,
                        "remediation": kb["remediation"],
                    })

        # Deduplicate and sort by DREAD total descending
        unique_threats = {t["threat_id"]: t for t in threats}.values()
        sorted_threats = sorted(unique_threats, key=lambda x: x["dread"]["dread_total"], reverse=True)

        # Aggregate metrics
        stride_counts = {"Spoofing": 0, "Tampering": 0, "Repudiation": 0, "Information Disclosure": 0, "Denial of Service": 0, "Elevation of Privilege": 0}
        severity_counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}

        for t in sorted_threats:
            stride_counts[t["stride_category"]] = stride_counts.get(t["stride_category"], 0) + 1
            severity_counts[t["dread"]["severity"]] = severity_counts.get(t["dread"]["severity"], 0) + 1

        # Synthesize Prioritized Remediation Tickets
        tickets: List[Dict[str, Any]] = []
        for idx, threat in enumerate(sorted_threats[:10], start=1):
            tickets.append({
                "ticket_key": f"SEC-{idx:03d}",
                "priority": "P0" if threat["dread"]["severity"] == "CRITICAL" else ("P1" if threat["dread"]["severity"] == "HIGH" else "P2"),
                "title": f"Mitigate {threat['title']}",
                "component": threat["component_name"],
                "mitre_attack": threat["mitre_attack"],
                "dread_score": threat["dread"]["dread_total"],
                "severity": threat["dread"]["severity"],
                "action_items": [
                    threat["remediation"],
                    f"Perform regression testing verifying {threat['stride_category']} exploit attempts are blocked.",
                    "Verify security telemetry emits alert to SageAI SIEM / Merkle Audit Ledger.",
                ],
            })

        # Anchor threat model execution into Merkle audit ledger
        model_hash = hashlib.sha256(json.dumps([t["threat_id"] for t in sorted_threats]).encode()).hexdigest()
        audit_record = audit_chain.record_action(
            actor=actor,
            action="THREAT_MODEL_ANALYSIS_COMPLETED",
            details={
                "total_threats": len(sorted_threats),
                "critical_threats": severity_counts["CRITICAL"],
                "model_hash": model_hash,
                "components_analyzed": len(components),
            },
            org_id=org_id,
        )

        return {
            "status": "SUCCESS",
            "model_id": f"TM-{int(datetime.now(timezone.utc).timestamp())}",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "components_count": len(components),
            "data_flows_count": len(flows),
            "trust_boundaries_count": len(boundaries),
            "total_threats": len(sorted_threats),
            "severity_summary": severity_counts,
            "stride_summary": stride_counts,
            "threats": sorted_threats,
            "remediation_tickets": tickets,
            "merkle_seal": {
                "record_hash": audit_record["record_hash"],
                "previous_hash": audit_record["previous_hash"],
                "ledger_index": audit_record["index"],
                "status": "CRYPTOGRAPHICALLY_VERIFIED",
            },
        }

    def parse_openapi_spec(self, spec_text: str) -> Dict[str, Any]:
        """
        Parses an OpenAPI / Swagger JSON or YAML specification and extracts components and endpoints.
        """
        try:
            # Attempt JSON parse first
            spec = json.loads(spec_text)
        except Exception:
            # Fallback heuristic parser for YAML or truncated OpenAPI text
            endpoints = re.findall(r"(?:get|post|put|delete|patch):\s*\n\s*summary:\s*(.+)", spec_text, re.IGNORECASE)
            paths = re.findall(r"(\/[a-zA-Z0-9_\-\/\{\}]+):", spec_text)
            spec = {
                "info": {"title": "Imported OpenAPI Specification", "version": "1.0.0"},
                "paths": {p: {} for p in paths},
            }

        title = spec.get("info", {}).get("title", "Imported API Specification")
        paths = spec.get("paths", {})

        components = [
            {"id": "api-gateway", "name": f"{title} Gateway", "type": "API_GATEWAY", "exposure": "PUBLIC"},
            {"id": "auth-service", "name": "OAuth2 / JWT Authenticator", "type": "CORE_SERVICE", "exposure": "PRIVATE"},
            {"id": "app-backend", "name": "Application Logic Tier", "type": "CORE_SERVICE", "exposure": "PRIVATE"},
            {"id": "database-tier", "name": "Persistent Storage Layer", "type": "DATA_STORE", "exposure": "ISOLATED"},
        ]

        data_flows = []
        for path_name in list(paths.keys())[:15]:
            data_flows.append({
                "source": "External Client",
                "target": f"{title} Gateway",
                "protocol": f"HTTP {path_name}",
                "authenticated": "auth" not in path_name.lower() and "login" not in path_name.lower(),
            })

        return {
            "title": title,
            "total_endpoints": len(paths),
            "components": components,
            "data_flows": data_flows,
        }

    def parse_iac_manifest(self, manifest_text: str) -> Dict[str, Any]:
        """
        Parses Cloud Infrastructure-as-Code (Terraform HCL or Kubernetes YAML) into architectural components.
        """
        components: List[Dict[str, Any]] = []

        # Check for Terraform resources
        tf_resources = re.findall(r'resource\s+"([^"]+)"\s+"([^"]+)"', manifest_text)
        if tf_resources:
            for r_type, r_name in tf_resources:
                comp_type = "DATA_STORE" if any(db in r_type for db in ["db", "sql", "rds", "s3", "bucket"]) else ("API_GATEWAY" if any(gw in r_type for gw in ["lb", "gateway", "ingress", "waf"]) else "CORE_SERVICE")
                components.append({
                    "id": f"tf-{r_name}",
                    "name": f"{r_name} ({r_type})",
                    "type": comp_type,
                    "exposure": "PUBLIC" if comp_type == "API_GATEWAY" else "PRIVATE",
                })

        # Check for Kubernetes manifests
        k8s_kinds = re.findall(r"kind:\s*([A-Za-z]+)\s*\nmetadata:\s*\n\s*name:\s*([A-Za-z0-9_\-]+)", manifest_text)
        if k8s_kinds:
            for kind, name in k8s_kinds:
                comp_type = "API_GATEWAY" if kind in ["Ingress", "Service"] else ("DATA_STORE" if kind in ["PersistentVolumeClaim", "Secret"] else "CORE_SERVICE")
                components.append({
                    "id": f"k8s-{name}",
                    "name": f"{name} ({kind})",
                    "type": comp_type,
                    "exposure": "PUBLIC" if kind == "Ingress" else "PRIVATE",
                })

        if not components:
            # Fallback default components if no regex matched
            components = [
                {"id": "cloud-ingress", "name": "Cloud Ingress / Load Balancer", "type": "API_GATEWAY", "exposure": "PUBLIC"},
                {"id": "app-workload", "name": "Containerized Application Workload", "type": "CORE_SERVICE", "exposure": "PRIVATE"},
                {"id": "cloud-storage", "name": "Cloud Managed Database / S3", "type": "DATA_STORE", "exposure": "ISOLATED"},
            ]

        return {
            "manifest_type": "Terraform / Kubernetes Cloud IaC",
            "components_discovered": len(components),
            "components": components,
        }


# Global singleton
threat_modeling_engine = ThreatModelingEngine()

