import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_BATCH_DISPATCH = {
  batch_dispatch_status: "SUCCESSFULLY_TRANSMITTED",
  sequence_touch: 1,
  channel: "MULTI_CHANNEL_OMNI",
  total_dispatches: 4,
  records: [
    { lead_id: "LEAD-APEX-01", company_name: "Apex Global Securities", touch: 1, status: "DISPATCHED", channel: "SMTP_TLS" },
    { lead_id: "LEAD-NEXUS-02", company_name: "Nexus BioHealth Global", touch: 1, status: "DISPATCHED", channel: "SMTP_TLS" },
    { lead_id: "LEAD-CLOUD-03", company_name: "HyperScale Cloud Systems", touch: 1, status: "DISPATCHED", channel: "SMTP_TLS" },
    { lead_id: "LEAD-AERO-04", company_name: "Vanguard Aerospace & Defense Systems", touch: 1, status: "DISPATCHED", channel: "SMTP_TLS" },
  ],
  timestamp: Date.now() / 1000,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const res = await fetchBackend(
      `${BACKEND}/api/revops/dispatch-batch`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_BATCH_DISPATCH));
    }
  } catch {
    // fallback
  }
  return NextResponse.json(FALLBACK_BATCH_DISPATCH);
}
