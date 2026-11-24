import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/penrose-process-dao/summary", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Penrose Process summary:", err);
    return NextResponse.json({
      dao_id: "PENROSE-PROCESS-DAO-01",
      mechanism_equation: "DELTA_E_GT_0_VIA_NEGATIVE_ENERGY_INFALL_BEYOND_STATIC_LIMIT",
      ergosphere_extraction_efficiency_limit: "29.0% Maximum Rotational Mass-Energy Conversion",
      total_staked_ergosphere_capital_quadrillion_usd: 1050.0,
      projected_annualized_yield_percent: 39.5,
      status: "PENROSE_ENERGY_ARBITRAGE_OPTIMAL",
      active_ergosphere_vaults: 4,
    });
  }
}
