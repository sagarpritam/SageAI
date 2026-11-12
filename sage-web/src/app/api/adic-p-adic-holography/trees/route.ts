import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  trees: [
    {
      tree_id: "PADIC-BRUHAT-TITS-P3-01",
      geometry: "PGL(2, Q_3) Homogeneous Bruhat-Tits Tree (p=3, q=3)",
      default_prime_p: 3,
      default_tree_depth_n: 12,
      default_vladimirov_order: 2.0,
      base_fidelity_pct: 99.997,
      base_isolation_db: 161.4,
      status: "PADIC_TREE_LOCKED",
    },
    {
      tree_id: "BERKOVICH-ANALYTIC-P5-02",
      geometry: "Non-Archimedean Berkovich Projective Line P^1_Berk(C_5)",
      default_prime_p: 5,
      default_tree_depth_n: 16,
      default_vladimirov_order: 2.5,
      base_fidelity_pct: 99.998,
      base_isolation_db: 163.6,
      status: "PADIC_TREE_LOCKED",
    },
    {
      tree_id: "UNRAMIFIED-EXT-Q27-03",
      geometry: "Unramified Field Extension Q_{3^3} MERA-Tits Lattice",
      default_prime_p: 7,
      default_tree_depth_n: 20,
      default_vladimirov_order: 3.0,
      base_fidelity_pct: 99.999,
      base_isolation_db: 165.9,
      status: "PADIC_TREE_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/adic-p-adic-holography/trees`,
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

