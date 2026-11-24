import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_TREASURY = {
  total_reserves_usd_equivalent: 14200000,
  fx_hedging_posture: "AUTONOMOUS_DERIVATIVE_COLLAR_ACTIVE",
  accounts: [
    {
      account_id: "ACC-USD-JPM-01",
      currency: "USD",
      balance: 8500000,
      balance_usd: 8500000,
      custody_bank: "JPMorgan Chase New York",
      instrument: "Treasury Money Market Demand (MMDA)",
      yield_apy_pct: 5.15,
    },
    {
      account_id: "ACC-EUR-DB-02",
      currency: "EUR",
      balance: 3200000,
      balance_usd: 3456000,
      custody_bank: "Deutsche Bank Frankfurt",
      instrument: "Hedged Euribor Euro Deposit (1.08 FX)",
      yield_apy_pct: 3.85,
    },
    {
      account_id: "ACC-GBP-BARC-03",
      currency: "GBP",
      balance: 1400000,
      balance_usd: 1792000,
      custody_bank: "Barclays Private Bank London",
      instrument: "SONIA Floating Rate Note (1.28 FX)",
      yield_apy_pct: 4.90,
    },
    {
      account_id: "ACC-JPY-MUFG-04",
      currency: "JPY",
      balance: 280000000,
      balance_usd: 1820000,
      custody_bank: "MUFG Bank Tokyo",
      instrument: "FX Options Forward Collar (153.8 FX)",
      yield_apy_pct: 1.25,
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/finance/series-b-s1/treasury`);
    if (res.ok) {
      const data = await safeUpstreamJson<typeof FALLBACK_TREASURY>(res, FALLBACK_TREASURY);
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Using fallback Series B treasury:", e);
  }
  return NextResponse.json(FALLBACK_TREASURY);
}
