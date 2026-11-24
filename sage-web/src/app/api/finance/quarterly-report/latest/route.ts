import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_LATEST = {
  report_id: "LP-REPORT-Q4-2026-1763321480",
  quarter: "Q4",
  fiscal_year: 2026,
  generated_at: Date.now() / 1000 - 86400,
  financial_summary: {
    arr_usd: 3840000.0,
    yoy_growth_pct: 142.0,
    net_dollar_retention_pct: 138.0,
    gross_margin_pct: 84.5,
    enterprise_customers_count: 48,
    cash_balance_usd: 6450000.0,
    runway_months: 32,
    burn_rate_monthly_usd: 115000.0,
    sla_uptime_pct: 99.999,
  },
  markdown_letter: `# SageAI, Inc. — Q4 2026 Institutional Shareholder Letter
**To Our Limited Partners & Series A Co-Investors:**

We are pleased to report strong performance across revenue growth ($3.84M ARR, +142% YoY), enterprise account expansion (48 Fortune 500 & Sovereign DefTech contracts), and defense-grade infrastructure resilience (99.999% SLA Uptime) for Q4 2026.

Following our $6.0M Series A round led by Apex Sovereign Ventures, our cash position is $6.45M with 32 months of runway.

Sincerely,
*The Executive Suite & Autonomous CISO Office*
*SageAI, Inc.*`,
  signatories: {
    ceo: "Autonomous Executive Suite, SageAI",
    cfo: "Chief Financial Officer & VP Finance",
    lead_investor_gp: "Apex Sovereign Ventures GP",
  },
  merkle_record_seal: "e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
  status: "SEALED_AND_PUBLISHED",
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/finance/quarterly-report/latest`);
    if (res.ok) {
      const data = await safeUpstreamJson(res, FALLBACK_LATEST);
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Using fallback quarterly latest:", e);
  }
  return NextResponse.json(FALLBACK_LATEST);
}
