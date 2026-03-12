"""02 // MALTEGO: LINK ANALYSIS — Entity relationship graph builder.

Builds a Maltego-style link analysis graph from all intelligence data.
Returns nodes and edges that can be rendered in the frontend using
react-force-graph or vis.js.
"""

import logging
from app.utils.hash import deterministic_sha256

logger = logging.getLogger("sageai.intelligence.link_analysis")


def build_link_graph(target: str, target_type: str, intel_results: dict) -> dict:
    """Build a link analysis graph from all intelligence results.

    Returns a dict with:
      - nodes: list of {id, label, type, severity, data}
      - edges: list of {source, target, label, weight}
    """
    nodes = {}
    edges = []

    def _node_id(label: str) -> str:
        return deterministic_sha256(label.lower(), length=12)

    def _add_node(
        label: str, node_type: str, severity: str = "info", extra_data: dict = None
    ):
        nid = _node_id(label)
        if nid not in nodes:
            nodes[nid] = {
                "id": nid,
                "label": label,
                "type": node_type,
                "severity": severity,
                "data": extra_data or {},
            }
        return nid

    def _add_edge(source_id: str, target_id: str, label: str, weight: int = 1):
        edges.append(
            {
                "source": source_id,
                "target": target_id,
                "label": label,
                "weight": weight,
            }
        )

    # Root node (the target)
    root_type_map = {
        "domain": "domain",
        "ip": "ip",
        "email": "email",
        "username": "person",
        "phone": "phone",
    }
    root_id = _add_node(target, root_type_map.get(target_type, "unknown"))

    # Process Shodan results
    for finding in intel_results.get("shodan", []):
        if finding.get("type") == "open_ports":
            ports = finding.get("data", {}).get("ports", [])
            for port in ports[:10]:
                port_id = _add_node(
                    f"Port {port}",
                    "port",
                    "high" if port in [21, 23, 445, 3389] else "info",
                )
                _add_edge(
                    root_id, port_id, "exposes", 2 if port in [21, 23, 445, 3389] else 1
                )

        elif finding.get("type") == "known_vulnerabilities":
            cves = finding.get("data", {}).get("cve_ids", [])
            for cve in cves[:8]:
                cve_id = _add_node(cve, "vulnerability", "high")
                _add_edge(root_id, cve_id, "vulnerable_to", 3)

        elif finding.get("type") == "associated_hostnames":
            for hostname in finding.get("data", {}).get("hostnames", [])[:8]:
                hn_id = _add_node(hostname, "domain")
                _add_edge(root_id, hn_id, "associated_with")

    # Process Censys results
    for finding in intel_results.get("censys", []):
        if finding.get("type") == "certificate_transparency":
            for domain in finding.get("data", {}).get("domains", [])[:10]:
                dom_id = _add_node(domain, "domain")
                _add_edge(root_id, dom_id, "cert_includes")

        elif finding.get("type") in ("expired_certificate", "weak_tls"):
            issue_id = _add_node(
                finding.get("title", "TLS Issue"),
                "vulnerability",
                finding.get("severity", "medium"),
            )
            _add_edge(root_id, issue_id, "has_issue", 2)

    # Process IntelX / breach results
    for finding in intel_results.get("intelx", []):
        if finding.get("type") == "email_breaches":
            for breach in finding.get("data", {}).get("breaches", [])[:5]:
                breach_name = breach.get("Name", "Unknown Breach")
                br_id = _add_node(breach_name, "breach", "high")
                _add_edge(root_id, br_id, "breached_in", 3)

        elif finding.get("type") == "wayback_sensitive_paths":
            for url in finding.get("data", {}).get("sensitive_urls", [])[:5]:
                url_id = _add_node(url[:50], "sensitive_path", "medium")
                _add_edge(root_id, url_id, "archived_path", 2)

    # Process SpiderFoot results
    for finding in intel_results.get("spiderfoot", []):
        if finding.get("type") == "subdomains_discovered":
            for sub in finding.get("data", {}).get("subdomains", [])[:8]:
                sub_id = _add_node(sub, "domain")
                _add_edge(root_id, sub_id, "subdomain")

        elif finding.get("type") == "emails_discovered":
            for email in finding.get("data", {}).get("emails", [])[:5]:
                em_id = _add_node(email, "email", "medium")
                _add_edge(root_id, em_id, "email_found", 2)

        elif finding.get("type") == "ip_geolocation":
            geo = finding.get("data", {})
            loc = f"{geo.get('city', '?')}, {geo.get('country', '?')}"
            geo_id = _add_node(loc, "location")
            _add_edge(root_id, geo_id, "located_in")

    # Process Recon-ng results
    for finding in intel_results.get("recon_ng", []):
        if finding.get("type") == "subdomain_enumeration":
            for sub in finding.get("data", {}).get("subdomains", [])[:8]:
                sub_host = sub.get("hostname", sub) if isinstance(sub, dict) else sub
                sub_id = _add_node(sub_host, "domain")
                _add_edge(root_id, sub_id, "subdomain")

        elif finding.get("type") == "tech_detection":
            for tech in finding.get("data", {}).get("technologies", []):
                tech_id = _add_node(tech, "technology")
                _add_edge(root_id, tech_id, "runs")

        elif finding.get("type") == "email_harvesting":
            for email in finding.get("data", {}).get("emails", [])[:5]:
                em_id = _add_node(email, "email", "medium")
                _add_edge(root_id, em_id, "email_found", 2)

    # Process Dark Web results
    for finding in intel_results.get("darkweb", []):
        if finding.get("type") in ("tor_mentions", "paste_leaks"):
            dw_id = _add_node(
                finding.get("title", "Dark Web"),
                "darkweb",
                finding.get("severity", "high"),
            )
            _add_edge(root_id, dw_id, "mentioned_on", 3)

    # Process Identity results
    for finding in intel_results.get("identity", []):
        if finding.get("type") == "username_enumeration":
            for platform in finding.get("data", {}).get("platforms", []):
                plat_id = _add_node(
                    f"{platform.get('platform', '?')}/{target}", "social_account"
                )
                _add_edge(root_id, plat_id, "has_account", 2)

    # Process OSINT Industries results
    for finding in intel_results.get("osint_industries", []):
        if finding.get("type") == "gravatar_profile":
            name = finding.get("data", {}).get("display_name", "")
            if name:
                name_id = _add_node(name, "person")
                _add_edge(root_id, name_id, "identified_as", 3)

        elif finding.get("type") == "github_account":
            for user in finding.get("data", {}).get("github_users", []):
                gh_id = _add_node(f"GitHub/{user}", "social_account")
                _add_edge(root_id, gh_id, "has_account", 2)

    graph = {
        "nodes": list(nodes.values()),
        "edges": edges,
        "stats": {
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "node_types": {},
        },
    }

    # Count node types
    for node in graph["nodes"]:
        ntype = node["type"]
        graph["stats"]["node_types"][ntype] = (
            graph["stats"]["node_types"].get(ntype, 0) + 1
        )

    logger.info(f"Link analysis graph built: {len(nodes)} nodes, {len(edges)} edges")
    return graph
