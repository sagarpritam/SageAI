import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/vafa-witten-dao/summary", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err) {
    console.warn("Using fallback Vafa-Witten DAO summary:", err);
  }

  return NextResponse.json({
    dao_id: "VAFA-WITTEN-DAO-01",
    dao_name: "Vafa-Witten S-Duality Topological Partition Function Arbitrage DAO",
    status: "ARBITRAGE_ACTIVE",
    total_staked_vafa_witten_capital_quadrillion_usd: 1500.0,
    projected_annualized_yield_percent: 58.0,
    instanton_sheaf_convergence_percent: 99.9999,
    active_vafa_witten_vaults: 4,
    timestamp: new Date().toISOString(),
  });
}
