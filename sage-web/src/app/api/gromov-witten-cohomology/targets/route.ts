import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_TARGETS = {
  targets: [
    {
      target_id: "GW-PROJECTIVE-CP2-01",
      manifold_name: "Complex Projective Plane CP^2",
      dimension: 4,
      first_chern_class_c1: 3,
      degree_counts: { 1: 1, 2: 1, 3: 12, 4: 620 },
      base_wdvv_purity_pct: 99.9999,
      status: "QUANTUM_COHOMOLOGY_SEALED",
    },
    {
      target_id: "GW-GRASSMANNIAN-G24-02",
      manifold_name: "Grassmannian Gr(2, 4) of 2-Planes in C^4",
      dimension: 8,
      first_chern_class_c1: 4,
      degree_counts: { 1: 2, 2: 10, 3: 98, 4: 1440 },
      base_wdvv_purity_pct: 99.9998,
      status: "QUANTUM_COHOMOLOGY_SEALED",
    },
    {
      target_id: "GW-QUINTIC-THREEFOLD-03",
      manifold_name: "Calabi-Yau 3-Fold Quintic Hypersurface in CP^4",
      dimension: 6,
      first_chern_class_c1: 0,
      degree_counts: { 1: 2875, 2: 609250, 3: 317206375 },
      base_wdvv_purity_pct: 99.9997,
      status: "QUANTUM_COHOMOLOGY_SEALED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/gromov-witten-cohomology/targets`, {}, 5000);
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_TARGETS));
    }
  } catch {
    // Offline fallback
  }
  return NextResponse.json(FALLBACK_TARGETS, { status: 200 });
}
