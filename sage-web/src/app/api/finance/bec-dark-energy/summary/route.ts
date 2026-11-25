import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/bec-dark-energy/summary", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.warn("Using fallback BEC Dark Energy summary:", err);
    return NextResponse.json({
      dao_id: "BECDE-AXION-SUPERFLUID-01",
      ultra_light_axion_mass_ev: 1.0e-22,
      jeans_scale_astronomical_kpc: 1.4,
      gross_pitaevskii_quantum_pressure_ratio: 1.0,
      dark_energy_equation_of_state_w: -1.0,
      total_staked_superfluid_capital_quadrillion_usd: 750.0,
      projected_annualized_yield_percent: 29.5,
      status: "MACROSCOPIC_BEC_SUPERFLUID_OPTIMAL",
      active_condensate_vaults: 4,
    });
  }
}
