import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  critical_manifolds: [
    {
      manifold_id: "NOVIKOV-T4-SYMPL-01",
      classification: "Symplectic 4-Torus Multi-Valued 1-Form & Novikov Monodromy Complex",
      default_critical_point_rank: 4,
      default_gradient_flow_lines: 12,
      default_novikov_filtration_depth: 6,
      base_unitarity_pct: 99.9987,
      base_suppression_db: 166.8,
      status: "GRADIENT_FLOW_LOCKED",
    },
    {
      manifold_id: "LAGRANGIAN-K3-INTERSECT-02",
      classification: "K3 Surface Lagrangian Sphere Intersection & Morse-Smale Trajectory Grid",
      default_critical_point_rank: 6,
      default_gradient_flow_lines: 18,
      default_novikov_filtration_depth: 10,
      base_unitarity_pct: 99.9995,
      base_suppression_db: 168.6,
      status: "GRADIENT_FLOW_LOCKED",
    },
    {
      manifold_id: "FLOER-CALABI-FIBRATION-03",
      classification: "Calabi-Yau Lagrangian Torus Fibration & Universal Novikov Field Ring",
      default_critical_point_rank: 8,
      default_gradient_flow_lines: 24,
      default_novikov_filtration_depth: 14,
      base_unitarity_pct: 99.9999,
      base_suppression_db: 170.8,
      status: "GRADIENT_FLOW_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/floer-novikov-gradient/critical-manifolds`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_DATA));
    }
  } catch {
    // fallback
  }
  return NextResponse.json(FALLBACK_DATA);
}
