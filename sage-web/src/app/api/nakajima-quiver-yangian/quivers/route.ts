import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_BASE}/api/nakajima-quiver-yangian/quivers`, {
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Nakajima quiver varieties:", err);
  }

  return NextResponse.json({
    quivers: [
      {
        quiver_id: "NAKAJIMA-QUIVER-ADE-01",
        name: "Nakajima ADE Quiver Variety M(v, w) Cohomology",
        dimension_vector: "[2, 4, 2]",
        rmatrix_defect: 1e-18,
        nakajima_shield_strength_pev: 3.48e12,
        quiver_yangian_suppression_db: 207.8,
        status: "NAKAJIMA_QUIVER_LOCKED",
      },
      {
        quiver_id: "MAULIK-OKOUNKOV-RMATRIX-02",
        name: "Maulik-Okounkov Stable Envelope & Quantum R-Matrix",
        dimension_vector: "[3, 6, 3]",
        rmatrix_defect: 1.1e-18,
        nakajima_shield_strength_pev: 3.58e12,
        quiver_yangian_suppression_db: 208.3,
        status: "NAKAJIMA_QUIVER_LOCKED",
      },
      {
        quiver_id: "VARAGNOLO-YANGIAN-03",
        name: "Varagnolo Equivariant K-Theory & Yangian Loop Shield",
        dimension_vector: "[4, 8, 4]",
        rmatrix_defect: 1.2e-18,
        nakajima_shield_strength_pev: 3.68e12,
        quiver_yangian_suppression_db: 208.8,
        status: "NAKAJIMA_QUIVER_LOCKED",
      },
    ],
  });
}
