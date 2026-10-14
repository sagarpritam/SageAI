from typing import Any, Dict, List


def generate_attack_graph(findings: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Parses a list of findings to generate a node/edge JSON graph representing the attack surface.
    """
    nodes = []
    edges = []

    # Track unique IDs to avoid duplicate nodes
    added_nodes = set()

    for finding in findings:
        if "error" in finding:
            continue

        target = finding.get("discovered_on_target", "unknown")
        vuln_name = finding.get("name", "Unknown Vulnerability")
        severity = finding.get("severity", "info")

        # Add target node
        if target not in added_nodes:
            nodes.append(
                {"id": target, "label": target, "type": "target", "group": "asset"}
            )
            added_nodes.add(target)

        # Add vulnerability node
        vuln_id = f"{target}_{vuln_name}"
        if vuln_id not in added_nodes:
            nodes.append(
                {
                    "id": vuln_id,
                    "label": vuln_name,
                    "type": "vulnerability",
                    "group": severity.lower(),
                }
            )
            added_nodes.add(vuln_id)

            # Connect the vulnerability to the target
            edges.append(
                {"source": target, "target": vuln_id, "label": "has_vulnerability"}
            )

    return {"nodes": nodes, "edges": edges}
