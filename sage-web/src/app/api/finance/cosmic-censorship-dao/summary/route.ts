import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/cosmic-censorship-dao/summary", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Cosmic Censorship summary:", err);
    return NextResponse.json({
      dao_id: "COSMIC-CENSORSHIP-DAO-01",
      conjecture_foundation: "PENROSE_WEAK_COSMIC_CENSORSHIP",
      extremality_bound_condition: "M2_GEQ_A2_PLUS_Q2_CLOTHED",
      total_staked_censorship_capital_quadrillion_usd: 950.0,
      projected_annualized_yield_percent: 35.5,
      status: "COSMIC_CENSORSHIP_YIELD_OPTIMAL",
      active_censorship_vaults: 4,
    });
  }
}
