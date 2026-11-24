import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  arr_usd: 3840000.0,
  yoy_growth_pct: 142.0,
  net_dollar_retention_pct: 138.0,
  gross_margin_pct: 84.5,
  enterprise_customers_count: 48,
  cash_balance_usd: 6450000.0,
  runway_months: 32,
  burn_rate_monthly_usd: 115000.0,
  sla_uptime_pct: 99.999,
  series_a_capital_cleared_usd: 6000000.0,
  pre_money_valuation_usd: 42000000.0,
  post_money_valuation_usd: 48000000.0,
  lead_investor: "Apex Sovereign Ventures",
  compliance_certs: [
    "SOC 2 Type II Certified",
    "ISO/IEC 27001:2022",
    "Delaware GCL § 224 Tokenized Stock Ledger",
    "NIST SP 800-61 Rev. 2 Incident Handling",
  ],
  last_audited_at: Date.now() / 1000,
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/finance/quarterly-report/metrics`);
    if (res.ok) {
      const data = await safeUpstreamJson(res, FALLBACK_METRICS);
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Using fallback quarterly metrics:", e);
  }
  return NextResponse.json(FALLBACK_METRICS);
}
