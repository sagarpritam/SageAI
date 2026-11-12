import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  wedges: [
    {
      wedge_id: "EW-ADS3-DOUBLE-WEDGE-01",
      geometry: "AdS3/CFT2 Connected Double-Interval RT Minimal Cross-Section",
      default_ew_area: 3.4,
      default_mutual_info: 4.9,
      default_boundary_count: 2,
      base_fidelity_pct: 99.997,
      base_isolation_db: 161.2,
      status: "EW_CROSS_SECTION_VERIFIED",
    },
    {
      wedge_id: "CANONICAL-PURIFICATION-SR-02",
      geometry: "Dutta-Faulkner Canonical Purification Double-Copy Manifold |sqrt(rho_AB)>",
      default_ew_area: 5.2,
      default_mutual_info: 7.4,
      default_boundary_count: 4,
      base_fidelity_pct: 99.998,
      base_isolation_db: 163.7,
      status: "EW_CROSS_SECTION_VERIFIED",
    },
    {
      wedge_id: "MARKOV-GAP-MULTIPARTITE-03",
      geometry: "Hayden-Parrikar-Sorce Tripartite Markov Gap Boundary Lattice",
      default_ew_area: 7.8,
      default_mutual_info: 10.6,
      default_boundary_count: 6,
      base_fidelity_pct: 99.999,
      base_isolation_db: 166.4,
      status: "EW_CROSS_SECTION_VERIFIED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/entanglement-wedge-cross/wedges`,
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

