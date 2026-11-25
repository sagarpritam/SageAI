import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/chiral-anomaly-dao/vaults", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.warn("Using fallback Chiral Anomaly vaults:", err);
    return NextResponse.json([
      {
        vault_id: "ABJ-TRIANGLE-ANOMALY-CORE",
        chiral_channel: "Axial Current Non-Conservation Harvester",
        allocated_capital_quadrillion_usd: 300.0,
        projected_yield_apy: 40.0,
        axial_charge_pumping_rate_c_s: 8.4e16,
        status: "AXIAL_CHARGE_PUMPING_OPTIMAL",
      },
      {
        vault_id: "CHIRAL-MAGNETIC-EFFECT-VAULT",
        chiral_channel: "Parallel E·B Topological Vector Current Facility",
        allocated_capital_quadrillion_usd: 260.0,
        projected_yield_apy: 38.0,
        axial_charge_pumping_rate_c_s: 7.2e16,
        status: "CHIRAL_CURRENT_SUSTAINED",
      },
      {
        vault_id: "WEYL-NODE-SEPARATION-POOL",
        chiral_channel: "Condensed Matter Weyl Semimetal Chiral Nodes",
        allocated_capital_quadrillion_usd: 230.0,
        projected_yield_apy: 35.5,
        axial_charge_pumping_rate_c_s: 6.5e16,
        status: "FERMI_ARC_TRANSPORT_LOCKED",
      },
      {
        vault_id: "INSTANTON-WINDING-CHARGE-DEX",
        chiral_channel: "QCD Topological Charge Delta Q5 = 2 Nf Delta nu Tranche",
        allocated_capital_quadrillion_usd: 210.0,
        projected_yield_apy: 34.5,
        axial_charge_pumping_rate_c_s: 5.8e16,
        status: "WINDING_NUMBER_HARVESTED",
      },
    ]);
  }
}
