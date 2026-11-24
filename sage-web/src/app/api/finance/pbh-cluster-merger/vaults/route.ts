import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/pbh-cluster-merger/vaults", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback PBH Cluster Merger vaults:", err);
    return NextResponse.json([
      {
        vault_id: "QCD-PHASE-SUB-SOLAR",
        merger_regime: "QCD Transition Sub-Solar Mass Window (0.1 - 1.0 M_sun)",
        chirp_mass_msun: 0.45,
        staked_capital_quadrillion_usd: 260.0,
        target_annual_yield_apy: 34.0,
        status: "SUB_SOLAR_MERGERS_ACTIVE",
      },
      {
        vault_id: "HYPER-DENSE-CLUSTER-CORE",
        merger_regime: "Core-Collapsed PBH Star Cluster Core",
        chirp_mass_msun: 0.85,
        staked_capital_quadrillion_usd: 220.0,
        target_annual_yield_apy: 33.2,
        status: "RUNAWAY_BINARY_COALESCENCE",
      },
      {
        vault_id: "GRAVITATIONAL-CHIRP-HARVEST",
        merger_regime: "Coherent Multi-Band GW Inspiral Harvester",
        chirp_mass_msun: 0.62,
        staked_capital_quadrillion_usd: 190.0,
        target_annual_yield_apy: 31.5,
        status: "CHIRP_FREQUENCY_LOCKED",
      },
      {
        vault_id: "THREE-BODY-KINETIC-EJECTION",
        merger_regime: "3-Body Binary Softening & Slingshot Kinetic Harvesting",
        chirp_mass_msun: 0.38,
        staked_capital_quadrillion_usd: 180.0,
        target_annual_yield_apy: 31.3,
        status: "SLINGSHOT_ENERGY_EXTRACTED",
      },
    ]);
  }
}
