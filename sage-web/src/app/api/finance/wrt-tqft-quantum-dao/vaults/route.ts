import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/wrt-tqft-quantum-dao/vaults", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err) {
    console.warn("Using fallback WRT TQFT DAO vaults:", err);
  }

  return NextResponse.json([
    {
      vault_id: "WRT-CHERN-SIMONS-CORE",
      category_type: "SU2_K-MODULAR-TENSOR-CATEGORY",
      staked_capital_quadrillion_usd: 850.0,
      projected_yield_apy_percent: 75.2,
      tqft_surgery_phase: "MODULAR-SURGERY-LOCKED",
      status: "ACTIVE",
    },
    {
      vault_id: "RESHETIKHIN-TURAEV-SURGERY-POOL",
      category_type: "FRAMED-LINK-3-MANIFOLD-SURGERY",
      staked_capital_quadrillion_usd: 500.0,
      projected_yield_apy_percent: 74.8,
      tqft_surgery_phase: "FRAMED-LINK-REBALANCED",
      status: "ACTIVE",
    },
    {
      vault_id: "QUANTUM-GROUP-ROOT-OF-UNITY-DEX",
      category_type: "UQ-SL2-QUANTUM-GROUP-LIQUIDITY",
      staked_capital_quadrillion_usd: 450.0,
      projected_yield_apy_percent: 74.2,
      tqft_surgery_phase: "ROOT-OF-UNITY-CONVERGED",
      status: "ACTIVE",
    },
    {
      vault_id: "DEHN-SURGERY-MODULAR-YIELD-VAULT",
      category_type: "MAPPING-CLASS-GROUP-ARBITRAGE",
      staked_capital_quadrillion_usd: 300.0,
      projected_yield_apy_percent: 73.8,
      tqft_surgery_phase: "DEHN-TWIST-ARBITRAGED",
      status: "ACTIVE",
    },
  ]);
}
