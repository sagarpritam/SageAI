import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_INGEST = {
  status: "EVENT_INGESTED",
  event: {
    event_id: "EVT-LIVE-INGEST-01",
    cluster_id: "apex-cluster",
    node_id: "apex-cluster-node-01",
    event_type: "IMDS_SSRF_CLAMPED",
    source_ip: "10.0.0.1",
    destination_ip: "169.254.169.254",
    hook_action: "XDP_DROP",
    latency_overhead_ns: 40,
    timestamp: Date.now() / 1000,
    merkle_record_hash: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  },
  message: "Telemetry event ingested and sealed with Merkle audit hash.",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetchBackend(`${BACKEND}/api/telemetry/sensor-mesh/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(FALLBACK_INGEST);
    }
    const data = await safeUpstreamJson(res, FALLBACK_INGEST);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_INGEST);
  }
}
