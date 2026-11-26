import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/webster-klr-cat/algebras`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Webster KLR algebras:", err);
    return NextResponse.json({
      algebras: [
        {
          algebra_id: "WEBSTER-KLR-TENSOR-01",
          lie_type: "sl_n Categorified Tensor",
          highest_weight_rank: 3,
          strand_count: 6,
          klr_nilhecke_defect: 0.0,
          klr_shield_strength_pev: 4.4e12,
          klr_suppression_db: 213.85,
          categorification_state: "WEBSTER_KLR_LOCKED",
        },
        {
          algebra_id: "WEBSTER-KLR-QUIVER-02",
          lie_type: "Quiver Hecke R^Lambda",
          highest_weight_rank: 4,
          strand_count: 8,
          klr_nilhecke_defect: 0.0,
          klr_shield_strength_pev: 4.54e12,
          klr_suppression_db: 214.65,
          categorification_state: "WEBSTER_KLR_LOCKED",
        },
        {
          algebra_id: "WEBSTER-KLR-SHAFAREVICH-03",
          lie_type: "Cyclotomic KLRW",
          highest_weight_rank: 5,
          strand_count: 10,
          klr_nilhecke_defect: 0.0,
          klr_shield_strength_pev: 4.68e12,
          klr_suppression_db: 215.5,
          categorification_state: "WEBSTER_KLR_LOCKED",
        },
      ],
      total: 3,
    });
  }
}
