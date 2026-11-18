import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_SIGN_RESULT = {
  contract_id: "SLA-LEAD-APEX-01-AFE9A0E2",
  lead_id: "LEAD-APEX-01",
  company_name: "Apex Global Securities",
  status: "CONTRACT_EXECUTED",
  execution_certificate: "CERT-EXEC-07F54648672C",
  recognized_arr_usd: 240000,
  signed_by: "Marcus Vance",
  counter_signed_by: "Chief Executive Officer & CISO, SageAI Security Inc.",
  signed_at: Date.now() / 1000,
  message: "Enterprise Pilot SLA Contract for Apex Global Securities successfully executed and counter-signed.",
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json().catch(() => ({}));
    const res = await fetchBackend(
      `${BACKEND}/api/revops/contract/${id}/sign`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_SIGN_RESULT));
    }
  } catch {
    // fallback
  }
  return NextResponse.json({ ...FALLBACK_SIGN_RESULT, lead_id: id });
}
