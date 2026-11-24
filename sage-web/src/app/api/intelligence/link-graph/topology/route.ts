import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_TOPOLOGY = {
  total_nodes: 20,
  total_edges: 16,
  active_links: 16,
  severed_links: 0,
  nodes: [
    { id: "node-actor-fin8", label: "APT-FIN8", type: "THREAT_ACTOR", severity: "CRITICAL", category: "Financial Threat Group", country: "Eastern Europe", status: "TRACKED_ACTIVE" },
    { id: "node-actor-apt41", label: "APT-41", type: "THREAT_ACTOR", severity: "CRITICAL", category: "State-Sponsored Espionage", country: "East Asia", status: "TRACKED_ACTIVE" },
    { id: "node-actor-lazarus", label: "Lazarus Group", type: "THREAT_ACTOR", severity: "CRITICAL", category: "State-Sponsored Cyber Division", country: "East Asia (DPRK)", status: "TRACKED_ACTIVE" },
    { id: "node-actor-apt28", label: "APT-28", type: "THREAT_ACTOR", severity: "CRITICAL", category: "Military Intelligence (GRU)", country: "Eastern Europe", status: "TRACKED_ACTIVE" },
    { id: "node-c2-fin8", label: "194.26.29.114", type: "C2_INFRASTRUCTURE", severity: "CRITICAL", category: "AS44477 Dancom Ltd (St. Petersburg)", country: "Russia", status: "ACTIVE_C2" },
    { id: "node-c2-apt41", label: "103.145.13.88", type: "C2_INFRASTRUCTURE", severity: "HIGH", category: "AS13335 Cloud Network China (Chengdu)", country: "China", status: "ACTIVE_C2" },
    { id: "node-c2-lazarus", label: "185.220.101.5", type: "C2_INFRASTRUCTURE", severity: "CRITICAL", category: "AS208323 Pyongyang Tor Gateway", country: "North Korea (Proxy)", status: "ACTIVE_C2" },
    { id: "node-c2-apt28", label: "91.240.118.201", type: "C2_INFRASTRUCTURE", severity: "CRITICAL", category: "AS51659 GlavNII Special Comm (Moscow)", country: "Russia", status: "ACTIVE_C2" },
    { id: "node-bait-apex", label: "CANARY-STS-APEX-771", type: "CANARY_BAIT", severity: "INFO", category: "Canary AWS STS Token", country: "BreachForums", status: "ARMED_BAIT" },
    { id: "node-bait-nexus", label: "CANARY-FHIR-NEXUS-902", type: "CANARY_BAIT", severity: "INFO", category: "Synthetic FHIR FastQ Token", country: "XSS Underground Forum", status: "ARMED_BAIT" },
    { id: "node-bait-hyper", label: "CANARY-KUBE-HYPER-314", type: "CANARY_BAIT", severity: "INFO", category: "Canary Kubeconfig Beacon", country: "Dread Onion Network", status: "ARMED_BAIT" },
    { id: "node-bait-vanguard", label: "CANARY-SCADA-VANGUARD-108", type: "CANARY_BAIT", severity: "INFO", category: "SCADA mTLS Client Cert", country: "Sovereign Threat Feed", status: "ARMED_BAIT" },
    { id: "node-domain-apex", label: "apex-securities.io", type: "ENTERPRISE_DOMAIN", severity: "INFO", category: "Apex Global Securities ($240K ARR)", country: "us-east-1", status: "PROTECTED" },
    { id: "node-domain-nexus", label: "nexusbiohealth.com", type: "ENTERPRISE_DOMAIN", severity: "INFO", category: "Nexus BioHealth Global ($180K ARR)", country: "eu-central-1", status: "PROTECTED" },
    { id: "node-domain-hyper", label: "hyperscale.dev", type: "ENTERPRISE_DOMAIN", severity: "INFO", category: "HyperScale Cloud Systems ($200K ARR)", country: "us-central1", status: "PROTECTED" },
    { id: "node-domain-vanguard", label: "vanguard-aero.def", type: "ENTERPRISE_DOMAIN", severity: "INFO", category: "Vanguard Aerospace ($220K ARR)", country: "us-gov-west-1", status: "AIRGAP_CONTAINED" },
    { id: "node-ebpf-apex", label: "BPF-POL-PREDICT-APEX", type: "EBPF_SHIELD", severity: "INFO", category: "Zero-Copy XDP Ingress Filter (36ns)", country: "Equinix Ashburn DC21", status: "ACTIVE_FILTER" },
    { id: "node-ebpf-nexus", label: "BPF-PREDICT-7A9B1C", type: "EBPF_SHIELD", severity: "INFO", category: "FastQ Exfil Clamp Filter (34ns)", country: "Interxion Frankfurt FRA4", status: "ACTIVE_FILTER" },
    { id: "node-ebpf-hyper", label: "BPF-POL-PREDICT-HYPER", type: "EBPF_SHIELD", severity: "INFO", category: "Seccomp Pod Escape Filter (38ns)", country: "CoreSite Chicago CH1", status: "ACTIVE_FILTER" },
    { id: "node-ebpf-vanguard", label: "BPF-POL-PREDICT-VANGUARD", type: "EBPF_SHIELD", severity: "INFO", category: "Airgap SCADA Ingress Guard (32ns)", country: "GovCloud SCIF Gateway", status: "ACTIVE_FILTER" },
  ],
  edges: [
    { id: "edge-fin8-c2", source: "node-actor-fin8", target: "node-c2-fin8", relation: "OPERATES_C2", status: "ACTIVE_LINK", latency_ns: 45 },
    { id: "edge-apt41-c2", source: "node-actor-apt41", target: "node-c2-apt41", relation: "OPERATES_C2", status: "ACTIVE_LINK", latency_ns: 42 },
    { id: "edge-lazarus-c2", source: "node-actor-lazarus", target: "node-c2-lazarus", relation: "OPERATES_C2", status: "ACTIVE_LINK", latency_ns: 48 },
    { id: "edge-apt28-c2", source: "node-actor-apt28", target: "node-c2-apt28", relation: "OPERATES_C2", status: "ACTIVE_LINK", latency_ns: 39 },
    { id: "edge-c2-bait-apex", source: "node-c2-fin8", target: "node-bait-apex", relation: "INTERCEPTED_PROBE", status: "ACTIVE_LINK", latency_ns: 110 },
    { id: "edge-c2-bait-nexus", source: "node-c2-apt41", target: "node-bait-nexus", relation: "INTERCEPTED_PROBE", status: "ACTIVE_LINK", latency_ns: 118 },
    { id: "edge-c2-bait-hyper", source: "node-c2-lazarus", target: "node-bait-hyper", relation: "INTERCEPTED_PROBE", status: "ACTIVE_LINK", latency_ns: 135 },
    { id: "edge-c2-bait-vanguard", source: "node-c2-apt28", target: "node-bait-vanguard", relation: "INTERCEPTED_PROBE", status: "ACTIVE_LINK", latency_ns: 98 },
    { id: "edge-domain-ebpf-apex", source: "node-domain-apex", target: "node-ebpf-apex", relation: "SHIELDED_BY", status: "ACTIVE_LINK", latency_ns: 36 },
    { id: "edge-domain-ebpf-nexus", source: "node-domain-nexus", target: "node-ebpf-nexus", relation: "SHIELDED_BY", status: "ACTIVE_LINK", latency_ns: 34 },
    { id: "edge-domain-ebpf-hyper", source: "node-domain-hyper", target: "node-ebpf-hyper", relation: "SHIELDED_BY", status: "ACTIVE_LINK", latency_ns: 38 },
    { id: "edge-domain-ebpf-vanguard", source: "node-domain-vanguard", target: "node-ebpf-vanguard", relation: "SHIELDED_BY", status: "ACTIVE_LINK", latency_ns: 32 },
    { id: "edge-ebpf-clamp-apex", source: "node-ebpf-apex", target: "node-c2-fin8", relation: "EBPF_SEVERS_TRAFFIC", status: "ACTIVE_LINK", latency_ns: 12 },
    { id: "edge-ebpf-clamp-nexus", source: "node-ebpf-nexus", target: "node-c2-apt41", relation: "EBPF_SEVERS_TRAFFIC", status: "ACTIVE_LINK", latency_ns: 10 },
    { id: "edge-ebpf-clamp-hyper", source: "node-ebpf-hyper", target: "node-c2-lazarus", relation: "EBPF_SEVERS_TRAFFIC", status: "ACTIVE_LINK", latency_ns: 14 },
    { id: "edge-ebpf-clamp-vanguard", source: "node-ebpf-vanguard", target: "node-c2-apt28", relation: "EBPF_SEVERS_TRAFFIC", status: "ACTIVE_LINK", latency_ns: 8 },
  ],
  last_synced_at: Date.now() / 1000,
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const actor = searchParams.get("actor");

  let fallback = FALLBACK_TOPOLOGY;
  if (actor && actor !== "ALL") {
    const relevantActor = FALLBACK_TOPOLOGY.nodes.find((n) => n.label === actor);
    if (relevantActor) {
      const relevantNodeIds = new Set([relevantActor.id]);
      const filteredEdges = [];
      for (const e of FALLBACK_TOPOLOGY.edges) {
        if (relevantNodeIds.has(e.source) || relevantNodeIds.has(e.target)) {
          filteredEdges.push(e);
          relevantNodeIds.add(e.source);
          relevantNodeIds.add(e.target);
        }
      }
      fallback = {
        ...FALLBACK_TOPOLOGY,
        nodes: FALLBACK_TOPOLOGY.nodes.filter((n) => relevantNodeIds.has(n.id)),
        edges: filteredEdges,
        total_nodes: relevantNodeIds.size,
        total_edges: filteredEdges.length,
      };
    }
  }

  try {
    const query = actor ? `?actor=${encodeURIComponent(actor)}` : "";
    const res = await fetchBackend(`${BACKEND}/api/intelligence/link-graph/topology${query}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(fallback);
    }
    const data = await safeUpstreamJson(res, fallback);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(fallback);
  }
}
