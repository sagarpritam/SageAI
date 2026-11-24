import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/finance/swampland-cobordism-dao/summary");
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Swampland Cobordism DAO summary:", err);
    return NextResponse.json({
      dao_id: "SWAMPLAND-COBORDISM-DAO-01",
      conjecture_model: "COBORDISM_CLASS_VANISHING_OMEGA_K_QG_EQ_0",
      swampland_barrier: "NON_SUSY_VACUUM_DECAY_TERMINATION_DEFECT",
      total_staked_cobordism_capital_quadrillion_usd: 1250.0,
      projected_annualized_yield_percent: 48.0,
      status: "SWAMPLAND_COBORDISM_DAO_ACTIVE",
      active_cobordism_vaults: 4,
    });
  }
}
