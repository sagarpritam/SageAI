import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/gaitsgory-rozenblyum-dag/crystals`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Gaitsgory-Rozenblyum crystals:", err);
    return NextResponse.json({
      crystals: [
        {
          crystal_id: "GAITSGORY-ROZENBLYUM-INDCOH-01",
          dg_category: "IndCoh(X_dR)",
          serre_duality_order: 3,
          lie_algebroid_rank: 4,
          indcoherent_defect: 0.0,
          gr_firewall_strength_pev: 4.04e12,
          dag_crystal_suppression_db: 212.1,
          crystal_state: "GAITSGORY_ROZENBLYUM_DAG_LOCKED",
        },
        {
          crystal_id: "GAITSGORY-ROZENBLYUM-CRYSTAL-02",
          dg_category: "D-mod(Bun_G)",
          serre_duality_order: 4,
          lie_algebroid_rank: 6,
          indcoherent_defect: 0.0,
          gr_firewall_strength_pev: 4.18e12,
          dag_crystal_suppression_db: 212.9,
          crystal_state: "GAITSGORY_ROZENBLYUM_DAG_LOCKED",
        },
        {
          crystal_id: "GAITSGORY-ROZENBLYUM-GLUE-03",
          dg_category: "QCoh(InfSch)",
          serre_duality_order: 5,
          lie_algebroid_rank: 8,
          indcoherent_defect: 0.0,
          gr_firewall_strength_pev: 4.32e12,
          dag_crystal_suppression_db: 213.75,
          crystal_state: "GAITSGORY_ROZENBLYUM_DAG_LOCKED",
        },
      ],
      total: 3,
    });
  }
}
