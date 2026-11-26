import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/mock-modular-dao/vaults", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Mock Modular DAO vaults:", err);
  }

  return NextResponse.json([
    {
      vault_id: "DGM-MOCK-MODULAR-CORE",
      vault_name: "Dabholkar-Gopakumar-Murthy Shadow Completion Core",
      allocated_capital_quadrillion_usd: 380.0,
      projected_yield_apy_percent: 54.0,
      mock_shadow_convergence: 0.99999,
      status: "MOCK_SHADOW_COMPLETED",
    },
    {
      vault_id: "RADEMACHER-DYON-SERIES-POOL",
      vault_name: "Rademacher Contour Exact Degeneracy Pool",
      allocated_capital_quadrillion_usd: 350.0,
      projected_yield_apy_percent: 55.5,
      mock_shadow_convergence: 0.99998,
      status: "RADEMACHER_SERIES_OPTIMAL",
    },
    {
      vault_id: "APPEL-LERCH-SUM-DEX",
      vault_name: "Appell-Lerch Theta Function Arbitrage DEX",
      allocated_capital_quadrillion_usd: 340.0,
      projected_yield_apy_percent: 53.8,
      mock_shadow_convergence: 0.99999,
      status: "APPELL_LERCH_SUMMED",
    },
    {
      vault_id: "NON-HOLOMORPHIC-HORIZON-VAULT",
      vault_name: "Non-Holomorphic Modular Shadow Yield Vault",
      allocated_capital_quadrillion_usd: 330.0,
      projected_yield_apy_percent: 52.7,
      mock_shadow_convergence: 0.99997,
      status: "HORIZON_SHADOW_MAXIMIZED",
    },
  ]);
}
