import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/chiral-anomaly-dao/summary", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.warn("Using fallback Chiral Anomaly summary:", err);
    return NextResponse.json({
      dao_id: "CHIRAL-ANOMALY-DAO-01",
      anomaly_equation: "PARTIAL_MU_J5_MU_EQ_E2_OVER_2PI2_E_DOT_B",
      field_configuration: "PARALLEL_ELECTROMAGNETIC_E_DOT_B",
      total_staked_axial_capital_quadrillion_usd: 1000.0,
      projected_annualized_yield_percent: 37.0,
      status: "CHIRAL_AXIAL_CURRENT_HARVEST_OPTIMAL",
      active_anomaly_vaults: 4,
    });
  }
}
