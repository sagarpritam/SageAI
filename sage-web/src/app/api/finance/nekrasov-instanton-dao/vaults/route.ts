import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/nekrasov-instanton-dao/vaults", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Nekrasov Instanton DAO vaults:", err);
  }

  return NextResponse.json([
    {
      vault_id: "NEKRASOV-OMEGA-CORE-ALPHA",
      vault_name: "Omega-Background Equivariant Localization Core",
      allocated_capital_quadrillion_usd: 500.0,
      projected_yield_apy_percent: 60.0,
      prepotential_convergence: 0.9999999,
      status: "STAKE_EXPANDED_NEKRASOV",
    },
    {
      vault_id: "YOUNG-TABLEAUX-SUM-POOL",
      vault_name: "Colored Young Diagram Tableau Sum Pool",
      allocated_capital_quadrillion_usd: 380.0,
      projected_yield_apy_percent: 61.5,
      prepotential_convergence: 0.9999998,
      status: "YOUNG_TABLEAUX_OPTIMAL",
    },
    {
      vault_id: "SEIBERG-WITTEN-PREPOTENTIAL-DEX",
      vault_name: "Seiberg-Witten Prepotential F_0 Arbitrage DEX",
      allocated_capital_quadrillion_usd: 350.0,
      projected_yield_apy_percent: 59.8,
      prepotential_convergence: 0.9999999,
      status: "PREPOTENTIAL_LIMIT_CONVERGED",
    },
    {
      vault_id: "BLOWUP-FORMULA-VAULT",
      vault_name: "Nakajima-Yoshioka Blowup Formula Yield Vault",
      allocated_capital_quadrillion_usd: 320.0,
      projected_yield_apy_percent: 58.7,
      prepotential_convergence: 0.9999997,
      status: "BLOWUP_RATIO_STABLE",
    },
  ]);
}
