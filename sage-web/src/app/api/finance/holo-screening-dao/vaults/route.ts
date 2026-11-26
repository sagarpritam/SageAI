import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/holo-screening-dao/vaults", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.warn("Using fallback Holo-Screening vaults:", err);
    return NextResponse.json([
      {
        vault_id: "VERLINDE-ENTROPIC-FORCE-CORE",
        screen_vault: "Horizon Information Screen Displacement Tranche",
        staked_capital_quadrillion_usd: 287.5,
        screen_temperature_microkelvin: 14.5,
        accrued_entropic_yield_apy: 46.0,
        status: "ENTROPIC_FORCE_YIELDING",
      },
      {
        vault_id: "BULK-EMERGENT-SPACETIME-POOL",
        screen_vault: "Boundary-to-Bulk Area-Entropy Conversion Pool",
        staked_capital_quadrillion_usd: 287.5,
        screen_temperature_microkelvin: 12.8,
        accrued_entropic_yield_apy: 44.5,
        status: "BULK_METRIC_HARMONIZED",
      },
      {
        vault_id: "THERMODYNAMIC-NEWTON-EQUIVALENCE-DEX",
        screen_vault: "F = G M m / r^2 Microscopic State DEX",
        staked_capital_quadrillion_usd: 287.5,
        screen_temperature_microkelvin: 15.2,
        accrued_entropic_yield_apy: 43.5,
        status: "THERMODYNAMIC_EQUILIBRIUM_LOCKED",
      },
      {
        vault_id: "UNRUH-SCREEN-TEMPERATURE-VAULT",
        screen_vault: "Accelerated Observers Virtual Screen Liquidity Vault",
        staked_capital_quadrillion_usd: 287.5,
        screen_temperature_microkelvin: 13.9,
        accrued_entropic_yield_apy: 44.0,
        status: "SCREEN_TEMPERATURE_OPTIMAL",
      },
    ]);
  }
}
