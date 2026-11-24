import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/modave-attractor-dao/vaults");
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Modave Attractor DAO vaults:", err);
    return NextResponse.json([
      {
        vault_id: "FKS-CENTRAL-CHARGE-CORE",
        attractor_vault: "Central Charge Extremal Horizon Attractor |Z_attr|^2 Tranche",
        staked_capital_quadrillion_usd: 325.0,
        central_charge_modulus: 4.85,
        accrued_attractor_yield_apy: 51.5,
        status: "ATTRACTOR_HORIZON_STABILIZED",
      },
      {
        vault_id: "CALABI-YAU-SPECIAL-GEOMETRY-POOL",
        attractor_vault: "Kähler Moduli Special Geometry Prepotential F(X) Pool",
        staked_capital_quadrillion_usd: 325.0,
        central_charge_modulus: 4.50,
        accrued_attractor_yield_apy: 50.2,
        status: "SPECIAL_GEOMETRY_CONVERGED",
      },
      {
        vault_id: "BPS-BLACK-HOLE-ENTROPY-DEX",
        attractor_vault: "BPS Extremal Area-Entropy S = pi * |Z|^2 Conversion DEX",
        staked_capital_quadrillion_usd: 325.0,
        central_charge_modulus: 5.10,
        accrued_attractor_yield_apy: 49.0,
        status: "BPS_ENTROPY_OPTIMAL",
      },
      {
        vault_id: "NON-BPS-ATTRACTOR-STABILITY-VAULT",
        attractor_vault: "Non-BPS Zero-Temperature Attractor Branch Stability Vault",
        staked_capital_quadrillion_usd: 325.0,
        central_charge_modulus: 4.70,
        accrued_attractor_yield_apy: 49.8,
        status: "NON_BPS_BRANCH_LOCKED",
      },
    ]);
  }
}
