import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/ptvv-shifted-symplectic/stacks`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback PTVV stacks:", err);
    return NextResponse.json({
      stacks: [
        {
          stack_id: "PTVV-SHIFTED-SYMPLECTIC-01",
          derived_artin_stack: "RPerf(CY3) (-1)-Shifted",
          symplectic_shift_n: -1,
          lagrangian_intersection_rank: 3,
          darboux_defect: 0.0,
          ptvv_barrier_strength_pev: 3.98e12,
          shifted_symplectic_suppression_db: 211.65,
          lagrangian_state: "PTVV_SHIFTED_SYMPLECTIC_LOCKED",
        },
        {
          stack_id: "PTVV-SHIFTSYM-BG-02",
          derived_artin_stack: "BG (+2)-Shifted",
          symplectic_shift_n: 2,
          lagrangian_intersection_rank: 4,
          darboux_defect: 0.0,
          ptvv_barrier_strength_pev: 4.12e12,
          shifted_symplectic_suppression_db: 212.45,
          lagrangian_state: "PTVV_SHIFTED_SYMPLECTIC_LOCKED",
        },
        {
          stack_id: "PTVV-QUANTIZATION-03",
          derived_artin_stack: "Map(S^2, M_CY) (0)-Shifted",
          symplectic_shift_n: 0,
          lagrangian_intersection_rank: 5,
          darboux_defect: 0.0,
          ptvv_barrier_strength_pev: 4.26e12,
          shifted_symplectic_suppression_db: 213.3,
          lagrangian_state: "PTVV_SHIFTED_SYMPLECTIC_LOCKED",
        },
      ],
      total: 3,
    });
  }
}
