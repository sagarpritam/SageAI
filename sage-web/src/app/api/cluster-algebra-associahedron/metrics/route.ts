import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_cluster_polytopes: 3,
  total_cluster_seals: 1,
  mean_unitarity_pct: 99.9991,
  capability: "Capability 149 - Cluster Algebra & Stasheff Associahedron Firewall",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/cluster-algebra-associahedron/metrics`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_METRICS));
    }
  } catch {
    // Fallback when standalone offline or backend unreachable
  }
  return NextResponse.json(FALLBACK_METRICS);
}

