import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/cosmic-censorship-dao/vaults", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Cosmic Censorship vaults:", err);
    return NextResponse.json([
      {
        vault_id: "KERR-NEWMAN-EXTREMALITY-SHIELD",
        enclosure_mechanism: "Sub-Extremal Kerr-Newman Horizon Guard",
        allocated_capital_quadrillion_usd: 280.0,
        projected_yield_apy: 38.0,
        extremality_safety_margin_pct: 14.5,
        status: "HORIZON_CLOTHING_GUARANTEED",
      },
      {
        vault_id: "CHRISTODOULOU-TEST-BODY-CAPTURE",
        enclosure_mechanism: "High-Spin Particle Infall Censorship Damper",
        allocated_capital_quadrillion_usd: 250.0,
        projected_yield_apy: 36.0,
        extremality_safety_margin_pct: 12.8,
        status: "SPIN_OVERCHARGING_PREVENTED",
      },
      {
        vault_id: "NAKED-SINGULARITY-DISSIPATION",
        enclosure_mechanism: "Supercritical GW Dissipative Momentum Radiator",
        allocated_capital_quadrillion_usd: 220.0,
        projected_yield_apy: 34.5,
        extremality_safety_margin_pct: 15.2,
        status: "EXCESS_MOMENTUM_EXPELLED",
      },
      {
        vault_id: "APPARENT-HORIZON-TRAPPED-SURFACE",
        enclosure_mechanism: "Closed Trapped Surface Formation Assurance",
        allocated_capital_quadrillion_usd: 200.0,
        projected_yield_apy: 33.5,
        extremality_safety_margin_pct: 16.0,
        status: "TRAPPED_SURFACE_CONTINUOUS",
      },
    ]);
  }
}
