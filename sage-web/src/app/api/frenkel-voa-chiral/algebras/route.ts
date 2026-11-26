import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/frenkel-voa-chiral/algebras`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Frenkel VOA algebras:", err);
    return NextResponse.json({
      algebras: [
        {
          voa_id: "FRENKEL-VOA-CHIRAL-01",
          chiral_curve: "P^1 Conformal Blocks",
          central_charge_c: 24,
          zhu_algebra_rank: 4,
          ope_associativity_defect: 0.0,
          fbz_barrier_strength_pev: 4.94e12,
          voa_chiral_suppression_db: 216.85,
          voa_state: "FRENKEL_VOA_CHIRAL_LOCKED",
        },
        {
          voa_id: "FRENKEL-W-ALGEBRA-02",
          chiral_curve: "Principal W_k(g)",
          central_charge_c: 26,
          zhu_algebra_rank: 6,
          ope_associativity_defect: 0.0,
          fbz_barrier_strength_pev: 5.08e12,
          voa_chiral_suppression_db: 217.65,
          voa_state: "FRENKEL_VOA_CHIRAL_LOCKED",
        },
        {
          voa_id: "FRENKEL-FEIGIN-FRENKEL-03",
          chiral_curve: "Critical Level k = -h^v",
          central_charge_c: 0,
          zhu_algebra_rank: 8,
          ope_associativity_defect: 0.0,
          fbz_barrier_strength_pev: 5.22e12,
          voa_chiral_suppression_db: 218.5,
          voa_state: "FRENKEL_VOA_CHIRAL_LOCKED",
        },
      ],
      total: 3,
    });
  }
}
