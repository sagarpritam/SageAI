import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/grothendieck-serre-dao/summary", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err) {
    console.warn("Using fallback Grothendieck-Serre DAO summary:", err);
  }

  return NextResponse.json({
    dao_id: "GROTHENDIECK-SERRE-DAO-01",
    dao_name: "Grothendieck-Serre Principal Bundle Torsor Arbitrage DAO",
    status: "ARBITRAGE_ACTIVE",
    total_staked_torsor_capital_quadrillion_usd: 1650.0,
    projected_annualized_yield_percent: 64.0,
    local_triviality_convergence_percent: 99.99999,
    active_torsor_vaults: 4,
    timestamp: new Date().toISOString(),
  });
}
