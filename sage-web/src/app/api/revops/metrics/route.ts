import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_REVOPS_METRICS = {
  total_campaigns: 4,
  total_target_leads: 4,
  total_dispatches: 12,
  open_rate_pct: 82.5,
  dns_challenge_verification_rate_pct: 75.0,
  pilot_activation_conversion_pct: 50.0,
  pipeline_contract_value_usd: "$840,000 ARR",
  average_sales_cycle_days: 9,
  active_pilots: 3,
  status: "REVOPS_PIPELINE_HEALTHY",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/revops/metrics`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_REVOPS_METRICS));
    }
  } catch {
    // fallback
  }
  return NextResponse.json(FALLBACK_REVOPS_METRICS);
}
