import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/ryu-takayanagi-dao/vaults");
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Ryu-Takayanagi DAO vaults:", err);
    return NextResponse.json([
      {
        vault_id: "RYU-TAKAYANAGI-MINIMAL-SURFACE-CORE",
        extremal_vault: "AdS3/CFT2 Static Minimal Surface Geodesic gamma_A Tranche",
        staked_capital_quadrillion_usd: 300.0,
        minimal_surface_area_planck_units: 4.85e68,
        accrued_entanglement_yield_apy: 47.5,
        status: "MINIMAL_SURFACE_ARBITRAGING",
      },
      {
        vault_id: "HRT-COVARIANT-EXTREMAL-SURFACE-POOL",
        extremal_vault: "Hubeny-Rangamani-Takayanagi Time-Dependent Extremal Pool",
        staked_capital_quadrillion_usd: 300.0,
        minimal_surface_area_planck_units: 4.50e68,
        accrued_entanglement_yield_apy: 46.2,
        status: "EXTREMAL_SURFACE_YIELDING",
      },
      {
        vault_id: "ENTANGLEMENT-WEDGE-CROSS-SECTION-DEX",
        extremal_vault: "Subsystem Reflected Entropy Entanglement Wedge DEX",
        staked_capital_quadrillion_usd: 300.0,
        minimal_surface_area_planck_units: 4.95e68,
        accrued_entanglement_yield_apy: 45.0,
        status: "WEDGE_RECONSTRUCTION_ACTIVE",
      },
      {
        vault_id: "BIT-THREAD-BULK-FLOW-VAULT",
        extremal_vault: "Freedman-Headrick Divergenceless Vector Field Thread Vault",
        staked_capital_quadrillion_usd: 300.0,
        minimal_surface_area_planck_units: 4.65e68,
        accrued_entanglement_yield_apy: 45.8,
        status: "BIT_THREAD_FLOW_OPTIMAL",
      },
    ]);
  }
}
