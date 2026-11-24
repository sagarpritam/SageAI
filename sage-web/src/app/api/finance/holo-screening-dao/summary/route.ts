import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/holo-screening-dao/summary", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Holo-Screening summary:", err);
    return NextResponse.json({
      dao_id: "HOLO-SCREENING-DAO-01",
      entropic_force_equation: "F_EQ_T_NABLA_S_EMERGENT_GRAVITY_FROM_SCREEN_ENTROPY",
      holographic_screen_bits: "N = A / (4 G hbar)",
      total_staked_entropic_capital_quadrillion_usd: 1150.0,
      projected_annualized_yield_percent: 44.5,
      status: "HOLO_SCREENING_GRAVITY_ACTIVE",
      active_screen_vaults: 4,
    });
  }
}
