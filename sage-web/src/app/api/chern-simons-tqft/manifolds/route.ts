import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  manifolds: [
    {
      manifold_id: "CS-SU2-S3-TREFOIL-01",
      topology: "S^3 3-Sphere with Right-Handed Trefoil Knot 3_1",
      default_gauge_rank_n: 2,
      default_cs_level_k: 8,
      default_crossing_number: 3,
      base_invariant_fidelity_pct: 99.996,
      base_anomaly_suppression_db: 144.8,
      status: "TOPOLOGICAL_SKEIN_LOCKED",
    },
    {
      manifold_id: "CS-SU3-LENS-L52-02",
      topology: "Lens Space L(5, 2) with Figure-Eight Knot 4_1",
      default_gauge_rank_n: 3,
      default_cs_level_k: 10,
      default_crossing_number: 4,
      base_invariant_fidelity_pct: 99.994,
      base_anomaly_suppression_db: 146.5,
      status: "TOPOLOGICAL_SKEIN_LOCKED",
    },
    {
      manifold_id: "CS-SU4-BORROMEAN-03",
      topology: "3-Torus T^3 with Brunnian Borromean Link 6_2^3",
      default_gauge_rank_n: 4,
      default_cs_level_k: 12,
      default_crossing_number: 6,
      base_invariant_fidelity_pct: 99.997,
      base_anomaly_suppression_db: 148.2,
      status: "TOPOLOGICAL_SKEIN_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/chern-simons-tqft/manifolds`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_DATA));
    }
  } catch {
    // Fallback when standalone offline or backend unreachable
  }
  return NextResponse.json(FALLBACK_DATA);
}

