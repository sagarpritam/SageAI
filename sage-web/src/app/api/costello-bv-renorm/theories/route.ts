import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/costello-bv-renorm/theories`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Costello BV theories:", err);
    return NextResponse.json({
      theories: [
        {
          theory_id: "COSTELLO-BV-RENORM-01",
          factorization_algebra: "Holomorphic Chern-Simons",
          effective_scale_l: 0.01,
          loop_order: 2,
          quantum_master_defect: 0.0,
          costello_shield_strength_pev: 3.92e12,
          bv_renorm_suppression_db: 211.2,
          renormalization_state: "COSTELLO_BV_RENORM_LOCKED",
        },
        {
          theory_id: "COSTELLO-FACTORIZATION-02",
          factorization_algebra: "4D Twisted N=2 Gauge",
          effective_scale_l: 0.008,
          loop_order: 3,
          quantum_master_defect: 0.0,
          costello_shield_strength_pev: 4.06e12,
          bv_renorm_suppression_db: 212.05,
          renormalization_state: "COSTELLO_BV_RENORM_LOCKED",
        },
        {
          theory_id: "COSTELLO-YANGIAN-HOLO-03",
          factorization_algebra: "Twisted M-Theory 11D",
          effective_scale_l: 0.005,
          loop_order: 4,
          quantum_master_defect: 0.0,
          costello_shield_strength_pev: 4.2e12,
          bv_renorm_suppression_db: 212.9,
          renormalization_state: "COSTELLO_BV_RENORM_LOCKED",
        },
      ],
      total: 3,
    });
  }
}
