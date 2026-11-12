import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  spectra: [
    {
      spectrum_id: "CHR-MORAVA-K4-01",
      classification: "Height-4 Morava K(4) Stabilizer & Bousfield Fracture Square",
      default_morava_height: 4,
      default_formal_group_rank: 8,
      default_stabilizer_nodes: 16,
      base_unitarity_pct: 99.9979,
      base_suppression_db: 163.8,
      status: "CHROMATIC_STRATUM_LOCKED",
    },
    {
      spectrum_id: "LUBIN-TATE-E6-02",
      classification: "Height-6 Lubin-Tate E_6 Deformation & Ravenel Periodicity Ring",
      default_morava_height: 6,
      default_formal_group_rank: 12,
      default_stabilizer_nodes: 24,
      base_unitarity_pct: 99.9988,
      base_suppression_db: 165.7,
      status: "CHROMATIC_STRATUM_LOCKED",
    },
    {
      spectrum_id: "BOUSFIELD-FRACTURE-H8-03",
      classification: "Height-8 Hopf-Algebroid Adams-Novikov Convergence Tower",
      default_morava_height: 8,
      default_formal_group_rank: 16,
      default_stabilizer_nodes: 32,
      base_unitarity_pct: 99.9994,
      base_suppression_db: 167.9,
      status: "CHROMATIC_STRATUM_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/chromatic-homotopy-morava/spectra`,
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

