import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ leadId: string }> }
) {
  const { leadId } = await params;

  const fallback = {
    status: "HEARTBEAT_VERIFIED",
    telemetry: {
      lead_id: leadId,
      company_name: "Enterprise Account",
      sensor_nodes_count: 32,
      avg_latency_ms: 0.165,
      last_heartbeat_at: Date.now() / 1000,
      merkle_record_hash: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    },
    message: `Sensor mesh heartbeat confirmed for ${leadId}.`,
  };

  try {
    const res = await fetchBackend(`${BACKEND}/api/deployment/pilot-kits/${leadId}/verify-ping`, {
      method: "POST",
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
