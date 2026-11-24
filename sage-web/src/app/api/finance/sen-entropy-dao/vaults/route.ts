import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/sen-entropy-dao/vaults", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err) {
    console.warn("Using fallback Sen Entropy DAO vaults:", err);
  }

  return NextResponse.json([
    {
      vault_id: "SEN-ENTROPY-FUNCTION-CORE",
      vault_name: "Sen Quantum Horizon Legendre Transform Core",
      allocated_capital_quadrillion_usd: 360.0,
      projected_yield_apy_percent: 52.0,
      attractor_depth: 0.99999,
      status: "LEGENDRE_TRANSFORM_OPTIMIZED",
    },
    {
      vault_id: "ADS2-NEAR-HORIZON-POOL",
      vault_name: "AdS2 x S2 Enhanced Supergravity Pool",
      allocated_capital_quadrillion_usd: 340.0,
      projected_yield_apy_percent: 53.5,
      attractor_depth: 0.99998,
      status: "ADS2_SUPERGRAVITY_ACTIVE",
    },
    {
      vault_id: "NON-PERTURBATIVE-MICROSTATE-DEX",
      vault_name: "Rademacher Series Microstate Counting DEX",
      allocated_capital_quadrillion_usd: 330.0,
      projected_yield_apy_percent: 51.8,
      attractor_depth: 0.99999,
      status: "MICROSTATES_INDEXED",
    },
    {
      vault_id: "MACROSCOPIC-ATTRACTOR-YIELD-VAULT",
      vault_name: "Wald Noether Charge Macroscopic Yield Vault",
      allocated_capital_quadrillion_usd: 320.0,
      projected_yield_apy_percent: 50.7,
      attractor_depth: 0.99997,
      status: "WALD_CHARGE_MAXIMIZED",
    },
  ]);
}
