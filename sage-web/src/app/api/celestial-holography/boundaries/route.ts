import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  boundaries: [
    {
      boundary_id: "CS2-CELESTIAL-BMS-01",
      manifold: "Future Null Infinity I^+ S^2 x R_u (BMS4 Supertranslation Frame)",
      default_mellin_delta: 1.5,
      default_soft_order: 2,
      default_w_mode_cutoff: 16,
      base_ward_fidelity_pct: 99.997,
      base_memory_suppression_db: 152.4,
      status: "CELESTIAL_SPHERE_LOCKED",
    },
    {
      boundary_id: "CS2-SOFT-GRAVITON-02",
      manifold: "Subleading Spin-Memory Weinberg-Cachazo-Strominger Horizon",
      default_mellin_delta: 2.0,
      default_soft_order: 3,
      default_w_mode_cutoff: 24,
      base_ward_fidelity_pct: 99.998,
      base_memory_suppression_db: 155.8,
      status: "CELESTIAL_SPHERE_LOCKED",
    },
    {
      boundary_id: "CS2-W1INF-GLUE-03",
      manifold: "Self-Dual YM / Einstein w_{1+infinity} Wedge Current Algebra Mesh",
      default_mellin_delta: 1.0,
      default_soft_order: 4,
      default_w_mode_cutoff: 32,
      base_ward_fidelity_pct: 99.999,
      base_memory_suppression_db: 158.1,
      status: "CELESTIAL_SPHERE_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/celestial-holography/boundaries`,
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

