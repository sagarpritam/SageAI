import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/mock-modular-dao/summary", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Mock Modular DAO summary:", err);
  }

  return NextResponse.json({
    dao_id: "MOCK-MODULAR-DAO-01",
    dao_name: "Dabholkar-Gopakumar-Murthy Non-Holomorphic Mock Modular Form Arbitrage DAO",
    status: "ARBITRAGE_ACTIVE",
    total_staked_mock_modular_capital_quadrillion_usd: 1400.0,
    projected_annualized_yield_percent: 54.0,
    mock_shadow_convergence_percent: 99.999,
    active_mock_modular_vaults: 4,
    timestamp: new Date().toISOString(),
  });
}
