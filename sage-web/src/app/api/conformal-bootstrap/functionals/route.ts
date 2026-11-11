import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  functionals: [
    {
      functional_id: "SDP-ISING-3D-KINK-01",
      cft_family: "3D Ising Z_2 Mixed-Correlator Critical Kink Island",
      spacetime_dim: 3,
      baseline_delta_sigma: 0.518149,
      baseline_delta_epsilon: 1.412625,
      base_unitarity_fidelity_pct: 99.998,
      base_ghost_suppression_db: 154.2,
      status: "SDP_ISLAND_ACTIVE",
    },
    {
      functional_id: "SDP-ON-VECTOR-02",
      cft_family: "3D O(3) Heisenberg Vector Critical Bootstrap Archipelago",
      spacetime_dim: 3,
      baseline_delta_sigma: 0.518936,
      baseline_delta_epsilon: 1.59488,
      base_unitarity_fidelity_pct: 99.997,
      base_ghost_suppression_db: 156.1,
      status: "SDP_ISLAND_ACTIVE",
    },
    {
      functional_id: "SDP-SYM4D-CROSS-03",
      cft_family: "4D N=4 Super Yang-Mills Extremal Crossing Functional Matrix",
      spacetime_dim: 4,
      baseline_delta_sigma: 2.0,
      baseline_delta_epsilon: 3.41421,
      base_unitarity_fidelity_pct: 99.999,
      base_ghost_suppression_db: 159.4,
      status: "SDP_ISLAND_ACTIVE",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/conformal-bootstrap/functionals`,
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

