import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  schemes: [
    {
      scheme_id: "SPECTRAL-AFFINE-E1-01",
      classification: "E_infinity-Ring Spectral Affine Scheme Spec(S) & Cotangent Complex",
      default_spectral_rank: 4,
      default_cotangent_truncation: 12,
      default_etale_strata: 14,
      base_unitarity_pct: 99.9987,
      base_suppression_db: 165.8,
      status: "SPECTRAL_DESCENT_LOCKED",
    },
    {
      scheme_id: "DERIVED-ARTIN-MODULI-02",
      classification: "Derived Artin Moduli Stack & Quasi-Coherent Sheaf Complex",
      default_spectral_rank: 6,
      default_cotangent_truncation: 16,
      default_etale_strata: 22,
      base_unitarity_pct: 99.9994,
      base_suppression_db: 167.6,
      status: "SPECTRAL_DESCENT_LOCKED",
    },
    {
      scheme_id: "SPECTRAL-CALABI-YAU-03",
      classification: "Higher Spectral Calabi-Yau 3-Fold & Non-Connective K-Theory Stack",
      default_spectral_rank: 8,
      default_cotangent_truncation: 22,
      default_etale_strata: 30,
      base_unitarity_pct: 99.9999,
      base_suppression_db: 169.8,
      status: "SPECTRAL_DESCENT_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/derived-spectral-scheme/schemes`,
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
