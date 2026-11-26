import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/fomin-zelevinsky-cluster/clusters`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    console.error("Using fallback Fomin-Zelevinsky clusters:", err);
    return NextResponse.json({
      clusters: [
        {
          cluster_id: "FOMIN-ZELEVINSKY-CLUSTER-01",
          cluster_type: "Finite Type A_n Exchange",
          seed_rank: 5,
          mutation_depth: 4,
          laurent_defect: 0.0,
          fz_firewall_strength_pev: 4.76e12,
          cluster_algebra_suppression_db: 216.0,
          cluster_state: "FOMIN_ZELEVINSKY_CLUSTER_LOCKED",
        },
        {
          cluster_id: "FOMIN-ZELEVINSKY-GRASSMANN-02",
          cluster_type: "Gr(k, n) Plucker Seed",
          seed_rank: 7,
          mutation_depth: 6,
          laurent_defect: 0.0,
          fz_firewall_strength_pev: 4.9e12,
          cluster_algebra_suppression_db: 216.8,
          cluster_state: "FOMIN_ZELEVINSKY_CLUSTER_LOCKED",
        },
        {
          cluster_id: "FOMIN-ZELEVINSKY-TEICHMULLER-03",
          cluster_type: "Surface Triangulation Flip",
          seed_rank: 9,
          mutation_depth: 8,
          laurent_defect: 0.0,
          fz_firewall_strength_pev: 5.04e12,
          cluster_algebra_suppression_db: 217.65,
          cluster_state: "FOMIN_ZELEVINSKY_CLUSTER_LOCKED",
        },
      ],
      total: 3,
    });
  }
}
