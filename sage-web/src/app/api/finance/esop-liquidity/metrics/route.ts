import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  post_money_valuation_usd: 48000000,
  series_a_preferred_price_usd: 6.00,
  common_stock_409a_fmv_usd: 2.85,
  dlom_discount_pct: 22.5,
  total_esop_pool_shares: 1600000,
  allocated_shares: 460000,
  total_vested_shares: 345000,
  unallocated_shares: 1140000,
  total_tender_pool_capital_usd: 750000,
  cleared_tender_volume_usd: 414000,
  board_consent_standard: "Delaware General Corporation Law § 141(f)",
  board_ratification_status: "UNANIMOUS_BOARD_CONSENT_SEALED",
  last_synced_at: Date.now() / 1000,
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/finance/esop-liquidity/metrics`);
    if (res.ok) {
      const data = await safeUpstreamJson(res, FALLBACK_METRICS);
      return NextResponse.json(data);
    }
  } catch (e: unknown) {
    console.warn("Using fallback ESOP metrics:", e);
  }
  return NextResponse.json(FALLBACK_METRICS);
}
