import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  configurations: [
    {
      config_id: "BFSS-BMN-MATRIX-01",
      manifold: "BFSS/BMN Massive Matrix Quantum Mechanics (SU(N), N=64)",
      default_matrix_rank_n: 64,
      default_thooft_coupling: 4.2,
      default_mu_mass_gap: 1.65,
      base_unitarity_pct: 99.997,
      base_suppression_db: 160.4,
      status: "MATRIX_FUZZBALL_LOCKED",
    },
    {
      config_id: "IKKT-LORENTZIAN-SADDLE-02",
      manifold: "IKKT Type IIB Lorentzian Matrix Saddle (SO(9,1), N=128)",
      default_matrix_rank_n: 128,
      default_thooft_coupling: 6.4,
      default_mu_mass_gap: 2.15,
      base_unitarity_pct: 99.998,
      base_suppression_db: 162.8,
      status: "MATRIX_FUZZBALL_LOCKED",
    },
    {
      config_id: "MATHUR-FUZZBALL-MICROSTATE-03",
      manifold: "D1-D5-P Superstrata Mathur Horizonless Fuzzball Ensemble (N=256)",
      default_matrix_rank_n: 256,
      default_thooft_coupling: 8.6,
      default_mu_mass_gap: 2.8,
      base_unitarity_pct: 99.999,
      base_suppression_db: 165.6,
      status: "MATRIX_FUZZBALL_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/matrix-bfss-fuzzball/configurations`,
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

