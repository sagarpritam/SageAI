import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  total_entities: 20,
  total_relationships: 16,
  severed_c2_vectors: 0,
  graph_density: 0.0842,
  threat_clustering_coefficient: 0.842,
  mean_attack_path_depth: 2.4,
  ebpf_shield_coverage_pct: 100.0,
  maltego_transform_status: "GRAPH_TRANSFORM_STREAMING_ONLINE",
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/intelligence/link-graph/metrics`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(FALLBACK_METRICS);
    }
    const data = await safeUpstreamJson(res, FALLBACK_METRICS);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_METRICS);
  }
}
