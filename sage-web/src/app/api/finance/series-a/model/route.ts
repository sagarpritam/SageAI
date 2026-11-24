import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_SERIES_A_MODEL = {
  round_metadata: {
    company_name: "SageAI Security Inc.",
    round: "Series A Preferred Stock",
    pre_money_valuation_usd: 25000000,
    target_raise_usd: 6000000,
    post_money_valuation_usd: 31000000,
    investor_ownership_pct: 19.35,
    option_pool_expansion_pct: 10.0,
  },
  unit_economics: {
    current_recognized_arr_usd: 840000,
    projected_year1_arr_usd: 3400000,
    yoy_arr_growth_pct: 304.8,
    net_revenue_retention_pct: 142.0,
    gross_margin_pct: 88.5,
    cac_payback_months: 1.8,
    rule_of_40_score: 82.0,
    average_contract_value_acv_usd: 210000,
    pilot_to_paid_conversion_rate_pct: 100.0,
  },
  enterprise_cohorts: [
    { client: "Apex Global Securities", ciso: "Marcus Vance", current_arr_usd: 240000, expansion_projected_arr_usd: 960000, retention_status: "EXPANDING_Q1_2027" },
    { client: "HyperScale Cloud Systems", ciso: "Alex Chen", current_arr_usd: 200000, expansion_projected_arr_usd: 800000, retention_status: "EXPANDING_Q2_2027" },
    { client: "Nexus BioHealth Global", ciso: "Dr. Sarah Lin", current_arr_usd: 180000, expansion_projected_arr_usd: 720000, retention_status: "EXPANDING_Q2_2027" },
    { client: "Vanguard Aerospace & Defense", ciso: "Elena Rostova", current_arr_usd: 220000, expansion_projected_arr_usd: 920000, retention_status: "EXPANDING_Q3_2027" },
  ],
  cap_table: [
    { shareholder: "Founding Team & Key Employees", shares: 7065000, ownership_pct: 70.65 },
    { shareholder: "Series A Lead Institutional Investor", shares: 1935000, ownership_pct: 19.35 },
    { shareholder: "Unallocated Employee Stock Option Pool (ESOP)", shares: 1000000, ownership_pct: 10.00 },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/finance/series-a/model`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(FALLBACK_SERIES_A_MODEL);
    }
    const data = await safeUpstreamJson(res, FALLBACK_SERIES_A_MODEL);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_SERIES_A_MODEL);
  }
}
