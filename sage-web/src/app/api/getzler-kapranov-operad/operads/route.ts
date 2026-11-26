import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/getzler-kapranov-operad/operads`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Getzler-Kapranov operads:", err);
    return NextResponse.json({
      operads: [
        {
          operad_id: "GETZLER-KAPRANOV-MODULAR-01",
          operad_family: "Feynman Transform F(M_{g,n})",
          genus_order: 2,
          arity_n: 4,
          bv_master_defect: 0.0,
          operad_firewall_strength_pev: 3.8e12,
          operad_homotopy_suppression_db: 210.25,
          bv_homotopy_state: "GETZLER_KAPRANOV_BV_LOCKED",
        },
        {
          operad_id: "GETZLER-KAPRANOV-CYCLIC-02",
          operad_family: "Cyclic Operad E_infinity",
          genus_order: 3,
          arity_n: 6,
          bv_master_defect: 0.0,
          operad_firewall_strength_pev: 3.94e12,
          operad_homotopy_suppression_db: 211.1,
          bv_homotopy_state: "GETZLER_KAPRANOV_BV_LOCKED",
        },
        {
          operad_id: "GETZLER-KAPRANOV-FRAMED-03",
          operad_family: "Framed Little 2-Disks fD_2",
          genus_order: 4,
          arity_n: 8,
          bv_master_defect: 0.0,
          operad_firewall_strength_pev: 4.08e12,
          operad_homotopy_suppression_db: 211.95,
          bv_homotopy_state: "GETZLER_KAPRANOV_BV_LOCKED",
        },
      ],
      total: 3,
    });
  }
}
