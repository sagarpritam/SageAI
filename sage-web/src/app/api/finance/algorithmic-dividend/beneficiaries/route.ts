import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_BENEFICIARIES = [
  {
    id: "BENEFICIARY-APEX-VENTURES",
    entity_name: "Apex Global Securities Growth Fund",
    share_class: "Series A Preferred",
    equity_share_pct: 28.5,
    distribution_allocation_usd: 527250.0,
    tax_withholding_rate_pct: 0.0,
    jurisdiction: "Delaware, US",
    status: "APPROVED_FOR_DISBURSEMENT",
  },
  {
    id: "BENEFICIARY-FOUNDERS-SYNDICATE",
    entity_name: "Founders Syndicate Common Trust",
    share_class: "Founder Common",
    equity_share_pct: 36.0,
    distribution_allocation_usd: 666000.0,
    tax_withholding_rate_pct: 20.0,
    jurisdiction: "California, US",
    status: "APPROVED_FOR_DISBURSEMENT",
  },
  {
    id: "BENEFICIARY-EMPLOYEE-ESOP-TRUST",
    entity_name: "SageAI Employee ESOP Liquidity Trust",
    share_class: "Vested Common",
    equity_share_pct: 15.5,
    distribution_allocation_usd: 286750.0,
    tax_withholding_rate_pct: 22.0,
    jurisdiction: "Delaware, US",
    status: "APPROVED_FOR_DISBURSEMENT",
  },
  {
    id: "BENEFICIARY-SERIES-B-LEAD",
    entity_name: "Institutional Series B Syndicate",
    share_class: "Series B Preferred",
    equity_share_pct: 20.0,
    distribution_allocation_usd: 370000.0,
    tax_withholding_rate_pct: 0.0,
    jurisdiction: "New York, US",
    status: "APPROVED_FOR_DISBURSEMENT",
  },
];

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/finance/algorithmic-dividend/beneficiaries`);
    if (res.ok) {
      const data = await safeUpstreamJson<typeof FALLBACK_BENEFICIARIES>(res, FALLBACK_BENEFICIARIES);
      return NextResponse.json(data);
    }
  } catch (e: unknown) {
    console.warn("Using fallback dividend beneficiaries:", e);
  }
  return NextResponse.json(FALLBACK_BENEFICIARIES);
}
