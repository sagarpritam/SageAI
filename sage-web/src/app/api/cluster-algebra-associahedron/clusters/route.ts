import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  clusters: [
    {
      cluster_id: "CLUSTER-A4-STASHEFF-01",
      classification: "Type A_4 Stasheff Associahedron & Exchange Quiver Polytope",
      default_cluster_rank: 4,
      default_stasheff_vertices: 14,
      default_quiver_depth: 12,
      base_unitarity_pct: 99.9984,
      base_suppression_db: 165.1,
      status: "CLUSTER_SEEDS_LOCKED",
    },
    {
      cluster_id: "POSITROID-GR48-02",
      classification: "Positroid Grassmannian Gr(4,8) Plucker-Tree & Plabic Network",
      default_cluster_rank: 6,
      default_stasheff_vertices: 22,
      default_quiver_depth: 16,
      base_unitarity_pct: 99.9992,
      base_suppression_db: 167.0,
      status: "CLUSTER_SEEDS_LOCKED",
    },
    {
      cluster_id: "LAURENT-MUTATION-E6-03",
      classification: "Finite-Type E_6 Generalized Associahedron & Laurent Positivity Tower",
      default_cluster_rank: 8,
      default_stasheff_vertices: 30,
      default_quiver_depth: 22,
      base_unitarity_pct: 99.9997,
      base_suppression_db: 169.3,
      status: "CLUSTER_SEEDS_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/cluster-algebra-associahedron/clusters`,
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

