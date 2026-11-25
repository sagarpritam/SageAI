import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_POOL = {
  total_pool_balance_usd: 1850000.0,
  annualized_distribution_yield_pct: 6.4,
  retained_earnings_usd: 4200000.0,
  sec_rule_144_compliance_status: "COMPLIANT_VOLUME_CAPPED",
  irs_withholding_engine: "AUTOMATED_FORM_1099_DIV_ACTIVE",
  total_distributions_ytd_usd: 750000.0,
  currency: "USD",
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/finance/algorithmic-dividend/pool`);
    if (res.ok) {
      const data = await safeUpstreamJson<typeof FALLBACK_POOL>(res, FALLBACK_POOL);
      return NextResponse.json(data);
    }
  } catch (e: unknown) {
    console.warn("Using fallback dividend pool:", e);
  }
  return NextResponse.json(FALLBACK_POOL);
}
