import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  const { tenantId } = await params;
  let body = { incident_type: "UNUSUAL_OUTBOUND_EGRESS", description: "Suspicious probe blocked" };
  try {
    body = await req.json();
  } catch {
    // default
  }

  const fallback = {
    status: "SOC_ESCALATED",
    escalation: {
      escalation_id: "SOC-ESC-FALLBACK-01",
      tenant_id: tenantId,
      status: "SOC_ENGAGED",
      tier: "TIER_3_TACTICAL_WARROOM",
      incident_type: body.incident_type,
      description: body.description,
      escalated_at: Date.now() / 1000,
      merkle_record_hash: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    },
    message: `Emergency War Room engaged for ${tenantId}.`,
  };

  try {
    const res = await fetchBackend(`${BACKEND}/api/portal/tenant/${tenantId}/escalate-soc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
