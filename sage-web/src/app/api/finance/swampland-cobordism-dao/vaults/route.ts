import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/swampland-cobordism-dao/vaults");
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Swampland Cobordism DAO vaults:", err);
    return NextResponse.json([
      {
        vault_id: "COBORDISM-VANISHING-CLASS-CORE",
        cobordism_vault: "Trivial Cobordism Class Omega_k^QG = 0 Defect Tranche",
        staked_capital_quadrillion_usd: 312.5,
        decay_barrier_planck_energy_gev: 1.22e19,
        accrued_cobordism_yield_apy: 49.5,
        status: "COBORDISM_VANISHED_YIELDING",
      },
      {
        vault_id: "VACUUM-DECAY-BUBBLE-POOL",
        cobordism_vault: "Witten Bubble of Nothing Horizon Suppression Pool",
        staked_capital_quadrillion_usd: 312.5,
        decay_barrier_planck_energy_gev: 1.15e19,
        accrued_cobordism_yield_apy: 48.2,
        status: "BUBBLE_HORIZON_PROTECTED",
      },
      {
        vault_id: "SPACETIME-TERMINATION-DEX",
        cobordism_vault: "End-of-the-World Brane Spacetime Termination DEX",
        staked_capital_quadrillion_usd: 312.5,
        decay_barrier_planck_energy_gev: 1.28e19,
        accrued_cobordism_yield_apy: 47.0,
        status: "BRANE_BOUNDARY_ACCRUING",
      },
      {
        vault_id: "NON-SUPERSYMMETRIC-DE-SITTER-VAULT",
        cobordism_vault: "TCC Swampland Compliant de Sitter Liquidity Vault",
        staked_capital_quadrillion_usd: 312.5,
        decay_barrier_planck_energy_gev: 1.19e19,
        accrued_cobordism_yield_apy: 47.8,
        status: "SWAMPLAND_BOUND_OPTIMAL",
      },
    ]);
  }
}
