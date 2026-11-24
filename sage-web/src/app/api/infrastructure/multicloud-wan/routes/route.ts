import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_ROUTES = [
  {
    id: "WAN-RT-AWS-GCP-01",
    source: "AWS Direct Connect (us-east-1)",
    destination: "GCP Cloud Interconnect (us-central1)",
    latency_ms: 7.4,
    jitter_ms: 0.06,
    throughput_gbps: 94.5,
    egress_fee_status: "ZERO_EGRESS_PEER_DIRECT",
    bgp_asn: "AS64512 <-> AS16550",
    status: "ACTIVE_PRIMARY",
  },
  {
    id: "WAN-RT-GCP-AZURE-02",
    source: "GCP Cloud Interconnect (europe-west1)",
    destination: "Azure ExpressRoute (germanywestcentral)",
    latency_ms: 5.2,
    jitter_ms: 0.04,
    throughput_gbps: 88.0,
    egress_fee_status: "ZERO_EGRESS_PEER_DIRECT",
    bgp_asn: "AS16550 <-> AS12076",
    status: "ACTIVE_PRIMARY",
  },
  {
    id: "WAN-RT-AWS-AZURE-03",
    source: "AWS Direct Connect (us-west-2)",
    destination: "Azure ExpressRoute (westus2)",
    latency_ms: 6.8,
    jitter_ms: 0.05,
    throughput_gbps: 91.2,
    egress_fee_status: "ZERO_EGRESS_PEER_DIRECT",
    bgp_asn: "AS64512 <-> AS12076",
    status: "ACTIVE_PRIMARY",
  },
  {
    id: "WAN-RT-CF-MAGIC-04",
    source: "Cloudflare Magic WAN Global Anycast",
    destination: "Multi-Cloud Origin Fabric",
    latency_ms: 4.1,
    jitter_ms: 0.03,
    throughput_gbps: 120.0,
    egress_fee_status: "ZERO_EGRESS_BANDWIDTH_ALLIANCE",
    bgp_asn: "AS13335 (Anycast Mesh)",
    status: "ACTIVE_PRIMARY",
  },
];

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/infrastructure/multicloud-wan/routes`);
    if (res.ok) {
      const data = await safeUpstreamJson<typeof FALLBACK_ROUTES>(res, FALLBACK_ROUTES);
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Using fallback multi-cloud WAN routes:", e);
  }
  return NextResponse.json(FALLBACK_ROUTES);
}
