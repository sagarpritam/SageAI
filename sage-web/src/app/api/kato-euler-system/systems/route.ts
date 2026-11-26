import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_BASE}/api/kato-euler-system/systems`, {
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Kato Euler systems:", err);
  }

  return NextResponse.json({
    systems: [
      {
        system_id: "KATO-EULER-ZETA-01",
        name: "Kato Zeta Elements & Explicit Reciprocity Shield",
        prime_p: 5,
        reciprocity_defect: 1e-18,
        kato_shield_strength_pev: 2.42e12,
        euler_system_suppression_db: 196.4,
        status: "KATO_EULER_SYSTEM_LOCKED",
      },
      {
        system_id: "KATO-PADIC-BSD-02",
        name: "Kato-Perrin-Riou p-Adic BSD Selmer Bound",
        prime_p: 7,
        reciprocity_defect: 1.1e-18,
        kato_shield_strength_pev: 2.52e12,
        euler_system_suppression_db: 196.9,
        status: "KATO_EULER_SYSTEM_LOCKED",
      },
      {
        system_id: "KATO-BEILINSON-ELEMENTS-03",
        name: "Beilinson-Kato Modular Unit Cup-Product Lattice",
        prime_p: 11,
        reciprocity_defect: 1.3e-18,
        kato_shield_strength_pev: 2.62e12,
        euler_system_suppression_db: 197.3,
        status: "KATO_EULER_SYSTEM_LOCKED",
      },
    ],
  });
}
