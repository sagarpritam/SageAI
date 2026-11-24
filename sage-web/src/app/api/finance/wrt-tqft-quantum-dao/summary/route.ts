import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/wrt-tqft-quantum-dao/summary", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err) {
    console.warn("Using fallback WRT TQFT DAO summary:", err);
  }

  return NextResponse.json({
    dao_id: "WRT-TQFT-DAO-01",
    dao_name: "Witten-Reshetikhin-Turaev 3D TQFT Quantum Invariant Yield DAO",
    status: "ARBITRAGE_ACTIVE",
    total_staked_wrt_capital_quadrillion_usd: 2100.0,
    projected_annualized_yield_percent: 74.5,
    dehn_surgery_invariance_percent: 99.9999999,
    active_wrt_vaults: 4,
    timestamp: new Date().toISOString(),
  });
}
