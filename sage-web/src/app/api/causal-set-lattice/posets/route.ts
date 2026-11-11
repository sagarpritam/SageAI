import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  posets: [
    {
      poset_id: "CAUSAL-SPRINKLE-4D-01",
      sector: "Bombelli 4D Poisson Sprinkling Poset Enclave (Zurich)",
      sprinkling_elements_n: 1048576,
      base_myrheim_meyer_dim: 4.0002,
      base_covariance_pct: 99.996,
      status: "POSETS_TRANSITIVE_LOCKED",
    },
    {
      poset_id: "CAUSAL-DIAMOND-ALEXANDROV-02",
      sector: "Alexandrov Causal Interval Poset Mesh (Boulder NIST Link)",
      sprinkling_elements_n: 2097152,
      base_myrheim_meyer_dim: 4.0001,
      base_covariance_pct: 99.997,
      status: "POSETS_TRANSITIVE_LOCKED",
    },
    {
      poset_id: "CAUSAL-CSG-GROWTH-03",
      sector: "Sorkin-Rideout Classical Sequential Growth Horizon (L4)",
      sprinkling_elements_n: 4194304,
      base_myrheim_meyer_dim: 3.9999,
      base_covariance_pct: 99.998,
      status: "POSETS_TRANSITIVE_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/causal-set-lattice/posets`,
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

