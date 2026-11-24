import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/hawking-evaporation-dao/summary", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Hawking Evaporation summary:", err);
    return NextResponse.json({
      dao_id: "HAWKING-EVAPORATION-DAO-01",
      evaporation_rate_equation: "DM_DT_EQ_MINUS_HBAR_C4_OVER_15360_PI_G2_M2",
      hawking_temperature_regime: "T_H_EQ_HBAR_C3_OVER_8_PI_G_M_KB",
      total_staked_evaporation_capital_quadrillion_usd: 1100.0,
      projected_annualized_yield_percent: 42.0,
      status: "HAWKING_EVAPORATION_YIELD_OPTIMAL",
      active_evaporation_vaults: 4,
    });
  }
}
