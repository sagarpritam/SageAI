import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  strata: [
    {
      stratum_id: "BBDG-SCHUBERT-STRATA-01",
      classification: "BBDG Decomposition Theorem & Schubert Variety Stratified Intersection Cohomology",
      default_variety_dimension: 4,
      default_strata_depth: 6,
      default_frobenius_weight: 2,
      base_unitarity_pct: 99.9989,
      base_suppression_db: 168.0,
      status: "PERVERSE_STRATA_LOCKED",
    },
    {
      stratum_id: "DELIGNE-LUSZTIG-TORUS-02",
      classification: "Deligne-Lusztig Character Sheaf & Maximal Torus Frobenius Eigenvalue Shield",
      default_variety_dimension: 6,
      default_strata_depth: 8,
      default_frobenius_weight: 4,
      base_unitarity_pct: 99.9995,
      base_suppression_db: 170.4,
      status: "PERVERSE_STRATA_LOCKED",
    },
    {
      stratum_id: "HECKE-EIGENSHEAF-AFFINE-03",
      classification: "Affine Flag Variety Hecke Eigensheaf & Langlands Duality Perverse Kernel",
      default_variety_dimension: 8,
      default_strata_depth: 12,
      default_frobenius_weight: 6,
      base_unitarity_pct: 99.9999,
      base_suppression_db: 173.2,
      status: "PERVERSE_STRATA_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/perverse-sheaf-deligne/strata`,
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

