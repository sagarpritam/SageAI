import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  diagrams: [
    {
      diagram_id: "HF-POINCARE-SPHERE-01",
      classification: "Poincaré Homology 3-Sphere Multi-Pointed Heegaard Diagram & Spin^c Grid",
      default_grid_rank: 4,
      default_contact_depth: 12,
      default_bordered_algebra_dim: 6,
      base_unitarity_pct: 99.9988,
      base_suppression_db: 166.9,
      status: "BORDERED_FLOER_LOCKED",
    },
    {
      diagram_id: "HF-SURGERY-KNOT-02",
      classification: "Dehn Surgery Along Figure-Eight Knot & Ozsváth-Szabó Alexander Grading",
      default_grid_rank: 6,
      default_contact_depth: 18,
      default_bordered_algebra_dim: 10,
      base_unitarity_pct: 99.9996,
      base_suppression_db: 168.8,
      status: "BORDERED_FLOER_LOCKED",
    },
    {
      diagram_id: "HF-GIROUX-OPENBOOK-03",
      classification: "Giroux Contact 3-Manifold Open Book Decomposition & Bordered Module DA",
      default_grid_rank: 8,
      default_contact_depth: 24,
      default_bordered_algebra_dim: 14,
      base_unitarity_pct: 99.9999,
      base_suppression_db: 171.0,
      status: "BORDERED_FLOER_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/heegaard-floer-bordered/diagrams`,
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
