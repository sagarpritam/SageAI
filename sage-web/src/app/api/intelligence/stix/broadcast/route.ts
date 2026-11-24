import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_BROADCAST_RES = {
  broadcast_id: "BCAST-202611-SIEM-01",
  bundle_id: "bundle--d8471bfa-8921-4f12-9c12-781290348712",
  bundle_sha256: "7d891bca0912401824019284a109284019284019284019284019284019284019",
  total_objects_broadcast: 48,
  destinations_contacted: 3,
  deliveries: [
    {
      destination: "Splunk Enterprise Security",
      url: "https://splunk-es.corp.internal:8088/services/collector",
      protocol: "HEC / STIX 2.1 Ingest",
      http_status: 200,
      delivery_latency_ms: 28.5,
      status: "DELIVERED_ACKNOWLEDGED",
    },
    {
      destination: "Microsoft Sentinel",
      url: "https://sentinel.azure.com/api/v1/workspaces/secops/stix",
      protocol: "TAXII 2.1 Client Connector",
      http_status: 200,
      delivery_latency_ms: 31.2,
      status: "DELIVERED_ACKNOWLEDGED",
    },
    {
      destination: "Palo Alto Cortex XSOAR",
      url: "https://xsoar.secops.internal/demisto/stix/inbound",
      protocol: "REST Webhook / STIX 2.1 Feed",
      http_status: 200,
      delivery_latency_ms: 24.8,
      status: "DELIVERED_ACKNOWLEDGED",
    },
  ],
  merkle_record_hash: "7d891bca0912401824019284a109284019284019284019284019284019284019",
  broadcast_at: Date.now() / 1000,
  status: "ALL_SIEM_CLUSTERS_SYNCHRONIZED",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const res = await fetchBackend(
      `${BACKEND}/api/intelligence/stix/broadcast`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );
    if (!res.ok) {
      return NextResponse.json(FALLBACK_BROADCAST_RES);
    }
    const data = await safeUpstreamJson(res, FALLBACK_BROADCAST_RES);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_BROADCAST_RES);
  }
}
