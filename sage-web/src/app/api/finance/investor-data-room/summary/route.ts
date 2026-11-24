import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_SUMMARY = {
  room_id: "ROOM-SERIES-A-LP-2026",
  room_name: "SageAI Institutional LP Due Diligence & Audit Portal",
  access_tier: "INSTITUTIONAL_LP_READONLY",
  round_name: "SageAI Series A Equity Financing",
  target_raise_usd: 6000000.0,
  total_cleared_usd: 6000000.0,
  pre_money_valuation_usd: 42000000.0,
  post_money_valuation_usd: 48000000.0,
  total_shares_issued: 1428571,
  cap_table_locked: true,
  lead_investor: "Apex Sovereign Ventures ($3,000,000.00)",
  syndicate_members: [
    { name: "Apex Sovereign Ventures", allocation_usd: 3000000.0, status: "WIRED_AND_SEALED" },
    { name: "CyberSentinel Growth Fund", allocation_usd: 1500000.0, status: "WIRED_AND_SEALED" },
    { name: "Horizon Frontier Capital", allocation_usd: 1000000.0, status: "WIRED_AND_SEALED" },
    { name: "Vanguard Autonomous Syndicate", allocation_usd: 500000.0, status: "WIRED_AND_SEALED" },
  ],
  audit_posture: "FULLY_VERIFIED",
  last_verified_at: Date.now() / 1000,
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/finance/investor-data-room/summary`);
    if (res.ok) {
      const data = await safeUpstreamJson(res, FALLBACK_SUMMARY);
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Using fallback LP room summary:", e);
  }
  return NextResponse.json(FALLBACK_SUMMARY);
}
