import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_OVERVIEW = {
  current_arr_usd: 14800000,
  net_revenue_retention_pct: 142.0,
  gross_margin_pct: 82.5,
  rule_of_40_score: 58.0,
  cac_payback_months: 7.2,
  series_b_target_raise_usd: 25000000,
  series_b_pre_money_valuation_usd: 95000000,
  series_b_post_money_valuation_usd: 120000000,
  lead_investor_terms: "Tier-1 Growth Syndicate ($18M Lead Allocation)",
  runway_months: 36,
  last_updated: Math.floor(Date.now() / 1000),
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/finance/series-b-s1/overview`);
    if (res.ok) {
      const data = await safeUpstreamJson<typeof FALLBACK_OVERVIEW>(res, FALLBACK_OVERVIEW);
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Using fallback Series B overview:", e);
  }
  return NextResponse.json(FALLBACK_OVERVIEW);
}
