import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/hawking-evaporation-dao/vaults", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.warn("Using fallback Hawking Evaporation vaults:", err);
    return NextResponse.json([
      {
        vault_id: "HAWKING-TEMPERATURE-CORE",
        evaporation_vault: "Horizon Quantum Thermal Emission Tranche",
        staked_capital_quadrillion_usd: 275.0,
        hawking_temperature_nanokelvin: 60.5,
        accrued_evaporation_yield_apy: 43.5,
        status: "HAWKING_EMISSION_ACTIVE",
      },
      {
        vault_id: "PAGE-TIME-ENTANGLEMENT-POOL",
        evaporation_vault: "Page Curve Mutual Information Recovery Pool",
        staked_capital_quadrillion_usd: 275.0,
        hawking_temperature_nanokelvin: 58.2,
        accrued_evaporation_yield_apy: 42.0,
        status: "PAGE_CURVE_HARMONIZED",
      },
      {
        vault_id: "BLACK-HOLE-MASS-EVAPORATION-DEX",
        evaporation_vault: "Mass-to-Energy Conversion Radiative DEX",
        staked_capital_quadrillion_usd: 275.0,
        hawking_temperature_nanokelvin: 62.0,
        accrued_evaporation_yield_apy: 41.0,
        status: "EVAPORATION_YIELD_OPTIMAL",
      },
      {
        vault_id: "UNRUH-ACCELERATION-BOND-VAULT",
        evaporation_vault: "Rindler Horizon Thermality Liquidity Vault",
        staked_capital_quadrillion_usd: 275.0,
        hawking_temperature_nanokelvin: 59.8,
        accrued_evaporation_yield_apy: 41.5,
        status: "UNRUH_BOND_YIELD_LOCKED",
      },
    ]);
  }
}
