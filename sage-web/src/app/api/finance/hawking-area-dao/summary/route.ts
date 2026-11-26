import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/hawking-area-dao/summary", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.warn("Using fallback Hawking Area DAO summary:", err);
    return NextResponse.json({
      dao_id: "HAWKING-AREA-DAO-01",
      thermodynamic_law: "SECOND_LAW_GENERALIZED_BLACK_HOLE_ENTROPY",
      horizon_expansion_condition: "DELTA_A_GEQ_ZERO_IRREVERSIBLE",
      total_staked_horizon_capital_quadrillion_usd: 900.0,
      projected_annualized_yield_percent: 34.0,
      status: "HAWKING_AREA_EXPANSION_YIELD_OPTIMAL",
      active_horizon_vaults: 4,
    });
  }
}
