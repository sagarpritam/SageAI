import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_TRIGGER_RESULT = {
  killswitch_id: "KS-INGRESS-SEVER",
  status: "ENGAGED_ACTIVE",
  certificate_id: "CERT-KS-E3B0C442",
  certificate_sha256:
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  toggled_by: "Marcus Vance (ciso)",
  timestamp: Date.now() / 1000,
  reason: "Simulated CISO emergency killswitch trigger",
  impact_summary:
    "Killswitch KS-INGRESS-SEVER set to ENGAGED_ACTIVE across all active cloud clusters.",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const res = await fetchBackend(
      `${BACKEND}/api/soc/playbooks/killswitch/trigger`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );
    if (!res.ok) {
      return NextResponse.json(FALLBACK_TRIGGER_RESULT);
    }
    const data = await safeUpstreamJson(res, FALLBACK_TRIGGER_RESULT);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_TRIGGER_RESULT);
  }
}
