import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_GRANTS = [
  {
    grant_id: "GRANT-001",
    employee_name: "Elena Rostova",
    role: "Principal Distributed Systems Architect",
    granted_shares: 120000,
    vested_shares: 90000,
    exercise_price_usd: 0.45,
    tender_eligible_shares: 18000,
    tender_status: "ELIGIBLE",
    gross_payout_usd: 108000,
  },
  {
    grant_id: "GRANT-002",
    employee_name: "Marcus Vance",
    role: "Staff Threat Intelligence Lead",
    granted_shares: 100000,
    vested_shares: 75000,
    exercise_price_usd: 0.45,
    tender_eligible_shares: 15000,
    tender_status: "ELIGIBLE",
    gross_payout_usd: 90000,
  },
  {
    grant_id: "GRANT-003",
    employee_name: "Devon Chen",
    role: "Senior Kernel eBPF Engineer",
    granted_shares: 80000,
    vested_shares: 60000,
    exercise_price_usd: 0.45,
    tender_eligible_shares: 12000,
    tender_status: "ELIGIBLE",
    gross_payout_usd: 72000,
  },
  {
    grant_id: "GRANT-004",
    employee_name: "Aria Montgomery",
    role: "VP Product & Trust",
    granted_shares: 90000,
    vested_shares: 67500,
    exercise_price_usd: 0.45,
    tender_eligible_shares: 13500,
    tender_status: "ELIGIBLE",
    gross_payout_usd: 81000,
  },
  {
    grant_id: "GRANT-005",
    employee_name: "Kenji Takahashi",
    role: "Lead Site Reliability Engineer",
    granted_shares: 70000,
    vested_shares: 52500,
    exercise_price_usd: 0.45,
    tender_eligible_shares: 10500,
    tender_status: "ELIGIBLE",
    gross_payout_usd: 63000,
  },
];

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/finance/esop-liquidity/grants`);
    if (res.ok) {
      const data = await safeUpstreamJson(res, FALLBACK_GRANTS);
      return NextResponse.json(data);
    }
  } catch (e: unknown) {
    console.warn("Using fallback ESOP grants:", e);
  }
  return NextResponse.json(FALLBACK_GRANTS);
}
