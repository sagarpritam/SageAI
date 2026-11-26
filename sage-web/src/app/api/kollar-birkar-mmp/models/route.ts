import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_BASE}/api/kollar-birkar-mmp/models`, {
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Kollar-Birkar MMP models:", err);
  }

  return NextResponse.json({
    models: [
      {
        model_id: "KOLLAR-LOG-CANONICAL-01",
        name: "Kollar Log Canonical Threshold & Kawamata-Viehweg Shield",
        dimension: 3,
        discrepancy_defect: 1e-18,
        kollar_shield_strength_pev: 3.25e12,
        mmp_suppression_db: 205.0,
        status: "KOLLAR_BIRKAR_MMP_LOCKED",
      },
      {
        model_id: "BIRKAR-BAB-BOUNDEDNESS-02",
        name: "Birkar Borisov-Alexeev-Borisov Fano Boundedness",
        dimension: 4,
        discrepancy_defect: 1.1e-18,
        kollar_shield_strength_pev: 3.35e12,
        mmp_suppression_db: 205.5,
        status: "KOLLAR_BIRKAR_MMP_LOCKED",
      },
      {
        model_id: "MORI-FIBER-SPACE-03",
        name: "Mori Extremal Ray Flip & Flop Termination Lattice",
        dimension: 5,
        discrepancy_defect: 1.2e-18,
        kollar_shield_strength_pev: 3.45e12,
        mmp_suppression_db: 206.0,
        status: "KOLLAR_BIRKAR_MMP_LOCKED",
      },
    ],
  });
}
