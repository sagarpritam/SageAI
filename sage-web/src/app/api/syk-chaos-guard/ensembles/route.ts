import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  ensembles: [
    {
      ensemble_id: "SYK-MAJORANA-Q4-01",
      manifold: "0+1D N-Majorana SYK (q=4 Disordered All-to-All J_ijkl)",
      default_majorana_n: 256,
      default_interaction_q: 4,
      default_beta_j: 24.0,
      base_scrambling_fidelity_pct: 99.997,
      base_chaos_isolation_db: 153.8,
      status: "SYK_MSS_BOUND_LOCKED",
    },
    {
      ensemble_id: "SYK-BILOCAL-SCHWARZIAN-02",
      manifold: "Nearly-AdS_2 JT Gravity Bilocal G-Sigma Schwarzian Action",
      default_majorana_n: 512,
      default_interaction_q: 6,
      default_beta_j: 32.0,
      base_scrambling_fidelity_pct: 99.998,
      base_chaos_isolation_db: 156.9,
      status: "SYK_MSS_BOUND_LOCKED",
    },
    {
      ensemble_id: "SYK-TRAVERSABLE-WORMHOLE-03",
      manifold: "Coupled Two-Site Maldacena-Qi SYK Traversable Wormhole Bus",
      default_majorana_n: 1024,
      default_interaction_q: 4,
      default_beta_j: 40.0,
      base_scrambling_fidelity_pct: 99.999,
      base_chaos_isolation_db: 159.7,
      status: "SYK_MSS_BOUND_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/syk-chaos-guard/ensembles`,
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

