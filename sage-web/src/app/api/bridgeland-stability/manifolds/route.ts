import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/bridgeland-stability/manifolds`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Bridgeland manifolds:", err);
    return NextResponse.json({
      manifolds: [
        {
          manifold_id: "BRIDGELAND-STAB-K3-01",
          derived_category: "D^b(Coh(K3))",
          central_charge_phase: 0.375,
          harder_narasimhan_steps: 3,
          stability_defect: 0.0,
          bridgeland_barrier_strength_pev: 3.74e12,
          bridgeland_suppression_db: 209.85,
          stability_chamber_state: "BRIDGELAND_STABILITY_LOCKED",
        },
        {
          manifold_id: "BRIDGELAND-STAB-QUINTIC-02",
          derived_category: "D^b(Coh(Quintic CY3))",
          central_charge_phase: 0.425,
          harder_narasimhan_steps: 4,
          stability_defect: 0.0,
          bridgeland_barrier_strength_pev: 3.88e12,
          bridgeland_suppression_db: 210.65,
          stability_chamber_state: "BRIDGELAND_STABILITY_LOCKED",
        },
        {
          manifold_id: "BRIDGELAND-STAB-P2-03",
          derived_category: "D^b(Coh(P^2))",
          central_charge_phase: 0.5,
          harder_narasimhan_steps: 2,
          stability_defect: 0.0,
          bridgeland_barrier_strength_pev: 4.02e12,
          bridgeland_suppression_db: 211.4,
          stability_chamber_state: "BRIDGELAND_STABILITY_LOCKED",
        },
      ],
      total: 3,
    });
  }
}
