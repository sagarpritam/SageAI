import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_OVERVIEW = {
  target_valuation_range: "$180M - $250M",
  implied_ev_arr_multiple: "16.5x - 22.9x",
  current_arr_usd: 10920000,
  gross_margin_pct: 81.4,
  net_revenue_retention_pct: 142,
  nda_acquirers_active: 4,
  cleanroom_session_status: "ACTIVE_EPHEMERAL_WATERMARKED",
  ip_merkle_root: "0x8f7a9411bc43f11e99824c084e72a44d1830e9d1bf7726a45b3f2081c7e239b2",
  patent_portfolio_count: 8,
  defense_score: "TIER_1_ENTERPRISE_MOAT",
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/finance/mna-vdr/overview`);
    if (res.ok) {
      const data = await safeUpstreamJson<typeof FALLBACK_OVERVIEW>(res, FALLBACK_OVERVIEW);
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Using fallback M&A overview:", e);
  }
  return NextResponse.json(FALLBACK_OVERVIEW);
}
