import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_TERM_SHEET_MODEL = {
  term_sheet: {
    term_sheet_id: "TS-SERIES-A-2026-v8.7",
    round_name: "Series A Preferred Stock Financing",
    company_name: "SageAI Security Inc.",
    investment_amount_usd: 6000000,
    pre_money_valuation_usd: 25000000,
    post_money_valuation_usd: 31000000,
    price_per_share_usd: 3.10,
    investor_ownership_pct: 19.35,
    liquidation_preference: "1x Non-Participating Preferred with standard broad-based weighted average anti-dilution",
    board_composition: {
      total_seats: 4,
      breakdown: [
        "2 Seats designated by Founders / Common Stock",
        "1 Seat designated by Series A Lead Institutional Investor",
        "1 Seat designated by Independent CISO Industry Advisory Council",
      ],
    },
    option_pool_pct: 10.0,
    protective_provisions: [
      "Amendments to Certificate of Incorporation adversely affecting Series A",
      "Authorization of senior or pari passu securities",
      "Sale, merger, or liquidation of the company",
      "Incurrence of indebtedness exceeding $1,000,000 USD",
    ],
    syndicate_allocations: [
      {
        syndicate_id: "SYN-LEAD-01",
        name: "Apex Sovereign Ventures",
        role: "Lead Institutional Series A Investor",
        committed_usd: 4000000,
        allocation_pct: 66.67,
        status: "ALLOCATION_CONFIRMED",
      },
      {
        syndicate_id: "SYN-PART-02",
        name: "HyperScale Cloud Ventures",
        role: "Strategic Enterprise Co-Investor",
        committed_usd: 1500000,
        allocation_pct: 25.00,
        status: "ALLOCATION_CONFIRMED",
      },
      {
        syndicate_id: "SYN-ANGEL-03",
        name: "Enterprise CISO Angel Syndicate",
        role: "Cybersecurity Executive Network",
        committed_usd: 500000,
        allocation_pct: 8.33,
        status: "ALLOCATION_CONFIRMED",
      },
    ],
    closing_status: "TERM_SHEET_OFFERED",
  },
  total_committed_usd: 6000000,
  target_raise_usd: 6000000,
  subscription_rate_pct: 100.0,
  is_fully_subscribed: true,
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/finance/term-sheet/model`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(FALLBACK_TERM_SHEET_MODEL);
    }
    const data = await safeUpstreamJson(res, FALLBACK_TERM_SHEET_MODEL);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_TERM_SHEET_MODEL);
  }
}
