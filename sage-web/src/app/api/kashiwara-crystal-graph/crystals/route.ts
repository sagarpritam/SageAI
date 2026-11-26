import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/kashiwara-crystal-graph/crystals`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Kashiwara crystals:", err);
    return NextResponse.json({
      crystals: [
        {
          crystal_id: "KASHIWARA-CRYSTAL-B-01",
          crystal_type: "B(infinity) Global Crystal",
          kashiwara_operators_e_f: 6,
          string_cone_dim: 4,
          crystal_defect: 0.0,
          kashiwara_barrier_strength_pev: 4.7e12,
          crystal_graph_suppression_db: 215.55,
          crystal_state: "KASHIWARA_CRYSTAL_LOCKED",
        },
        {
          crystal_id: "KASHIWARA-DEMAZURE-02",
          crystal_type: "Demazure Crystal B_w(lambda)",
          kashiwara_operators_e_f: 8,
          string_cone_dim: 6,
          crystal_defect: 0.0,
          kashiwara_barrier_strength_pev: 4.84e12,
          crystal_graph_suppression_db: 216.35,
          crystal_state: "KASHIWARA_CRYSTAL_LOCKED",
        },
        {
          crystal_id: "KASHIWARA-AFFINE-03",
          crystal_type: "Kirillov-Reshetikhin KR",
          kashiwara_operators_e_f: 10,
          string_cone_dim: 8,
          crystal_defect: 0.0,
          kashiwara_barrier_strength_pev: 4.98e12,
          crystal_graph_suppression_db: 217.2,
          crystal_state: "KASHIWARA_CRYSTAL_LOCKED",
        },
      ],
      total: 3,
    });
  }
}
