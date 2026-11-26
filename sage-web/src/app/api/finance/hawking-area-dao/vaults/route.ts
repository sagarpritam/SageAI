import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/hawking-area-dao/vaults", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.warn("Using fallback Hawking Area DAO vaults:", err);
    return NextResponse.json([
      {
        vault_id: "IRREVERSIBLE-HORIZON-GROWTH",
        thermodynamic_tier: "Second Law Gravitational Area Infall Vault",
        allocated_capital_quadrillion_usd: 260.0,
        projected_yield_apy: 36.5,
        horizon_area_expansion_rate_m2_s: 4.8e12,
        status: "AREA_INCREASE_MONOTONIC",
      },
      {
        vault_id: "BEKENSTEIN-BOUND-ENTROPY",
        thermodynamic_tier: "Maximum Bekenstein Entropy Density Reserve",
        allocated_capital_quadrillion_usd: 240.0,
        projected_yield_apy: 34.5,
        horizon_area_expansion_rate_m2_s: 4.2e12,
        status: "ENTROPY_BOUND_OPTIMAL",
      },
      {
        vault_id: "IRREDUCIBLE-MASS-ACCUMULATION",
        thermodynamic_tier: "Christodoulou Irreducible Mass Capital Pool",
        allocated_capital_quadrillion_usd: 210.0,
        projected_yield_apy: 33.0,
        horizon_area_expansion_rate_m2_s: 3.6e12,
        status: "IRREDUCIBLE_CAPITAL_LOCKED",
      },
      {
        vault_id: "PENROSE-SPIN-EXTRACTION",
        thermodynamic_tier: "Reversible Ergosphere Spin-Yield Harvester",
        allocated_capital_quadrillion_usd: 190.0,
        projected_yield_apy: 31.5,
        horizon_area_expansion_rate_m2_s: 3.1e12,
        status: "ERGOSPHERE_EXTRACTOR_ACTIVE",
      },
    ]);
  }
}
