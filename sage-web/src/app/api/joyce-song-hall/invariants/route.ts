import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_BASE}/api/joyce-song-hall/invariants`, {
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Joyce-Song invariants:", err);
  }

  return NextResponse.json({
    invariants: [
      {
        invariant_id: "JOYCE-SONG-HALL-ALGEBRA-01",
        name: "Joyce-Song Motivic Hall Algebra & Generalized DT",
        stability_order: 2,
        behrend_defect: 1e-18,
        joyce_firewall_strength_pev: 3.62e12,
        hall_algebra_suppression_db: 209.2,
        status: "JOYCE_SONG_HALL_LOCKED",
      },
      {
        invariant_id: "BRIDGELAND-JOYCE-STABILITY-02",
        name: "Joyce Abelian Category Stability & Wall-Crossing",
        stability_order: 3,
        behrend_defect: 1.1e-18,
        joyce_firewall_strength_pev: 3.72e12,
        hall_algebra_suppression_db: 209.7,
        status: "JOYCE_SONG_HALL_LOCKED",
      },
      {
        invariant_id: "BEHREND-VIRTUAL-CLASS-03",
        name: "Behrend Microlocal Virtual Fundamental Class Shield",
        stability_order: 4,
        behrend_defect: 1.2e-18,
        joyce_firewall_strength_pev: 3.82e12,
        hall_algebra_suppression_db: 210.2,
        status: "JOYCE_SONG_HALL_LOCKED",
      },
    ],
  });
}
