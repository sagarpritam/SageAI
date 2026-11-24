import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/penrose-process-dao/vaults", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Penrose Process vaults:", err);
    return NextResponse.json([
      {
        vault_id: "PENROSE-ERGOSPHERE-CORE",
        ergosphere_vault: "Static Limit Superradiant Infall Tranche",
        staked_capital_quadrillion_usd: 262.5,
        extraction_efficiency_pct: 28.5,
        accrued_penrose_yield_apy: 41.0,
        status: "ERGOSPHERE_EXTRACTION_ACTIVE",
      },
      {
        vault_id: "BLANDFORD-ZNAJEK-MHD-VAULT",
        ergosphere_vault: "Magnetic Penrose Flux Extraction Pool",
        staked_capital_quadrillion_usd: 262.5,
        extraction_efficiency_pct: 27.8,
        accrued_penrose_yield_apy: 39.5,
        status: "MHD_JET_POWER_LOCKED",
      },
      {
        vault_id: "SUPERRADIANT-SCATTERING-DEX",
        ergosphere_vault: "Bosonic Cloud Superradiant Reflection DEX",
        staked_capital_quadrillion_usd: 262.5,
        extraction_efficiency_pct: 26.9,
        accrued_penrose_yield_apy: 38.5,
        status: "SUPERRADIANT_AMPLIFIED",
      },
      {
        vault_id: "FRAME-DRAGGING-LENSE-THIRRING-POOL",
        ergosphere_vault: "Spacetime Frame-Dragging Lense-Thirring Arbitrage Vault",
        staked_capital_quadrillion_usd: 262.5,
        extraction_efficiency_pct: 28.0,
        accrued_penrose_yield_apy: 39.0,
        status: "FRAME_DRAGGING_OPTIMAL",
      },
    ]);
  }
}
