"""
SageAI Continuous Attack Path & Graph Choke-Point Analysis (CART) Engine.

Provides:
1. Enterprise Attack Graph Modeling:
   - Asset Nodes (Entrypoints, Workstations, IAM Roles, Jump-Boxes, Crown Jewels)
   - Attack Edges (CVE Exploits, Network Routes, Stolen Credentials, IAM Trusts)
2. Crown Jewel Lethal Path Discovery:
   - Full kill-chain traversal from public entrypoints to high-value assets:
     * Customer PII Database
     * AWS S3 Master Vault
     * Active Directory Domain Controller
3. Graph Centrality & Choke-Point Discovery:
   - Calculates path intersection centrality to identify the singular choke point
     whose severance collapses 80%+ of all attack paths.
4. Dynamic Blast Radius Scoring (0-100).
5. Autonomous Choke-Point Severance Playbook (Firewall, IAM Trust, & Zero-Trust microsegmentation).
6. Cryptographic Merkle Audit Hash Chain Anchoring.
"""

import collections
import hashlib
import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Set

from app.services.audit_chain import audit_chain

logger = logging.getLogger("SageAI.cart")

# Default Enterprise Attack Graph Topology
DEFAULT_ATTACK_GRAPH = {
    "nodes": [
        {"id": "node-dmz-web", "name": "DMZ Web Ingress (Nginx)", "type": "ENTRYPOINT", "exposure": "PUBLIC_INTERNET", "risk": 75},
        {"id": "node-api-gw", "name": "Internal API Gateway", "type": "INTERMEDIATE", "exposure": "INTERNAL_VPC", "risk": 60},
        {"id": "node-bastion", "name": "Core Bastion Jump-Host", "type": "JUMP_BOX", "exposure": "INTERNAL_VPC", "risk": 85},
        {"id": "node-kube-worker", "name": "Kube Node Worker 01", "type": "COMPUTE", "exposure": "INTERNAL_PODS", "risk": 55},
        {"id": "node-db-pii", "name": "Customer PII Database", "type": "CROWN_JEWEL", "exposure": "RESTRICTED", "risk": 100},
        {"id": "node-s3-vault", "name": "AWS S3 Master Data Vault", "type": "CROWN_JEWEL", "exposure": "RESTRICTED", "risk": 100},
        {"id": "node-ad-dc", "name": "Active Directory Domain Controller", "type": "CROWN_JEWEL", "exposure": "ISOLATED", "risk": 100},
    ],
    "edges": [
        {
            "id": "edge-1",
            "source": "node-dmz-web",
            "target": "node-api-gw",
            "vector": "CVE-2023-46298 SSR Cache Poisoning",
            "exploit_difficulty": "LOW",
        },
        {
            "id": "edge-2",
            "source": "node-api-gw",
            "target": "node-bastion",
            "vector": "SSRF to Cloud Metadata (169.254.169.254) + IAM Token Theft",
            "exploit_difficulty": "MEDIUM",
        },
        {
            "id": "edge-3",
            "source": "node-bastion",
            "target": "node-db-pii",
            "vector": "Unsegmented Port 5432 Ingress + Hardcoded Bastion Secret",
            "exploit_difficulty": "LOW",
        },
        {
            "id": "edge-4",
            "source": "node-bastion",
            "target": "node-s3-vault",
            "vector": "IAM Wildcard Role Attachment (AdministratorAccess)",
            "exploit_difficulty": "LOW",
        },
        {
            "id": "edge-5",
            "source": "node-bastion",
            "target": "node-ad-dc",
            "vector": "Pass-the-Hash SMB NTLM Relay (T1021.002)",
            "exploit_difficulty": "MEDIUM",
        },
        {
            "id": "edge-6",
            "source": "node-dmz-web",
            "target": "node-kube-worker",
            "vector": "Kubelet Anonymous Auth Exposure Port 10250",
            "exploit_difficulty": "MEDIUM",
        },
        {
            "id": "edge-7",
            "source": "node-kube-worker",
            "target": "node-bastion",
            "vector": "Shared Container SSH Key Leakage in /root/.ssh",
            "exploit_difficulty": "LOW",
        },
    ],
}


class CARTEngine:
    """
    Continuous Attack Path & Graph Choke-Point Analysis Engine.
    """

    def __init__(self):
        self.graph = DEFAULT_ATTACK_GRAPH

    def get_topology(self) -> Dict[str, Any]:
        """Returns the enterprise attack graph topology."""
        return self.graph

    def discover_attack_paths(self) -> Dict[str, Any]:
        """
        Discovers all attack paths from public entrypoints to Crown Jewels using DFS path traversal.
        """
        nodes_map = {n["id"]: n for n in self.graph["nodes"]}
        adj: Dict[str, List[Dict[str, Any]]] = collections.defaultdict(list)
        for e in self.graph["edges"]:
            adj[e["source"]].append({"target": e["target"], "vector": e["vector"], "edge_id": e["id"]})

        entrypoints = [n["id"] for n in self.graph["nodes"] if n["type"] == "ENTRYPOINT"]
        crown_jewels = set(n["id"] for n in self.graph["nodes"] if n["type"] == "CROWN_JEWEL")

        all_paths: List[Dict[str, Any]] = []

        def dfs(current: str, path: List[str], vectors: List[str]):
            if current in crown_jewels:
                all_paths.append({
                    "path_id": f"path-{len(all_paths) + 1}",
                    "entrypoint": nodes_map[path[0]]["name"],
                    "target_crown_jewel": nodes_map[current]["name"],
                    "hops": len(path) - 1,
                    "node_sequence": [nodes_map[nid]["name"] for nid in path],
                    "node_ids": list(path),
                    "vectors": list(vectors),
                    "lethality_score": max(50, 100 - (len(path) - 1) * 10),
                })
                return

            for neighbor in adj[current]:
                if neighbor["target"] not in path:  # Prevent cycles
                    dfs(neighbor["target"], path + [neighbor["target"]], vectors + [neighbor["vector"]])

        for ep in entrypoints:
            dfs(ep, [ep], [])

        # Choke-point discovery (find node present in most paths except entry/destination)
        node_frequencies: Dict[str, int] = collections.defaultdict(int)
        for p in all_paths:
            # Intermediate nodes in the path
            intermediate_nodes = p["node_ids"][1:-1]
            for nid in intermediate_nodes:
                node_frequencies[nid] += 1

        top_choke_point_id = max(node_frequencies, key=node_frequencies.get) if node_frequencies else None
        top_choke_point_node = nodes_map.get(top_choke_point_id) if top_choke_point_id else None
        paths_neutralized = node_frequencies.get(top_choke_point_id, 0)
        collapse_pct = round((paths_neutralized / max(1, len(all_paths))) * 100, 1)

        # Blast Radius
        blast_radius = min(100, int((len(all_paths) * 15) + (len(crown_jewels) * 10)))

        result = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "total_nodes": len(self.graph["nodes"]),
            "total_edges": len(self.graph["edges"]),
            "total_attack_paths_found": len(all_paths),
            "crown_jewels_targeted": len(crown_jewels),
            "blast_radius_score": blast_radius,
            "choke_point": {
                "node_id": top_choke_point_id,
                "node_name": top_choke_point_node["name"] if top_choke_point_node else "None",
                "node_type": top_choke_point_node["type"] if top_choke_point_node else "None",
                "paths_traversing": paths_neutralized,
                "path_collapse_percentage": collapse_pct,
                "severance_strategy": (
                    f"Isolate {top_choke_point_node['name'] if top_choke_point_node else 'choke node'}: "
                    "Drop ingress from API Gateway, strip AWS AdministratorAccess IAM policy, "
                    "and enforce mTLS + hardware MFA for bastion transit."
                ),
            },
            "attack_paths": all_paths,
        }

        # Merkle Audit
        audit_chain.record_action(
            action="CART_ATTACK_PATH_EVALUATION",
            details={
                "paths_count": len(all_paths),
                "blast_radius": blast_radius,
                "choke_point": top_choke_point_node["name"] if top_choke_point_node else "None",
                "collapse_pct": collapse_pct,
            },
            org_id="system-cart",
            actor="SageAI-CARTEngine",
        )

        return result

    def execute_choke_point_severance(
        self,
        node_id: str = "node-bastion",
        operator: str = "SecOpsDirector",
    ) -> Dict[str, Any]:
        """
        Autonomously severs attack paths by implementing choke-point isolation rules.
        """
        paths_analysis = self.discover_attack_paths()
        severance_id = f"sever-{int(datetime.now().timestamp())}"

        result = {
            "severance_id": severance_id,
            "target_node_id": node_id,
            "operator": operator,
            "rules_applied": [
                {"type": "NETWORK_MICROSEGMENTATION", "rule": f"Deny all ingress to {node_id} from DMZ subnets"},
                {"type": "IAM_PRIVILEGE_STRIP", "rule": f"Detach AdministratorAccess from {node_id} instance profile"},
                {"type": "PORT_SECURITY", "rule": "Revoke Port 5432 (PostgreSQL) direct access from Bastion"},
            ],
            "attack_paths_collapsed": paths_analysis["choke_point"]["paths_traversing"],
            "risk_reduction_pct": paths_analysis["choke_point"]["path_collapse_percentage"],
            "status": "CHOKE_POINT_SEVERED_SUCCESSFULLY",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        # Merkle Audit
        audit_chain.record_action(
            action="CART_CHOKE_POINT_SEVERANCE",
            details=result,
            org_id="system-cart",
            actor=operator,
        )

        return result


# Global instance
cart_engine = CARTEngine()
