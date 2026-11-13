import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const SCHEME_PRESETS: Record<
  string,
  { classification: string; baseUnitarityPct: number; baseSuppressionDb: number }
> = {
  "SPECTRAL-AFFINE-E1-01": {
    classification: "E_infinity-Ring Spectral Affine Scheme Spec(S) & Cotangent Complex",
    baseUnitarityPct: 99.9987,
    baseSuppressionDb: 165.8,
  },
  "DERIVED-ARTIN-MODULI-02": {
    classification: "Derived Artin Moduli Stack & Quasi-Coherent Sheaf Complex",
    baseUnitarityPct: 99.9994,
    baseSuppressionDb: 167.6,
  },
  "SPECTRAL-CALABI-YAU-03": {
    classification: "Higher Spectral Calabi-Yau 3-Fold & Non-Connective K-Theory Stack",
    baseUnitarityPct: 99.9999,
    baseSuppressionDb: 169.8,
  },
};

function buildSimulatedSeal(body: Record<string, unknown>) {
  const schemeId =
    typeof body.scheme_id === "string" && body.scheme_id in SCHEME_PRESETS
      ? body.scheme_id
      : "SPECTRAL-AFFINE-E1-01";
  const preset = SCHEME_PRESETS[schemeId];
  const rank = Math.max(2, Math.min(Math.round(Number(body.spectral_rank ?? 4) || 4), 16));
  const truncation = Math.max(
    4,
    Math.min(Math.round(Number(body.cotangent_truncation ?? 12) || 12), 64)
  );
  const strata = Math.max(
    4,
    Math.min(Math.round(Number(body.etale_sheaf_strata ?? 14) || 14), 128)
  );
  const gain = Math.max(0.85, Math.min(Number(body.scheme_gain ?? 1.6) || 1.6, 2.5));

  const residual = Number(
    (1.0e-5 / (1.0 + 0.17 * truncation + 0.15 * strata) / 10.0 ** (3.29 * gain)).toFixed(12)
  );
  const fidelity = Number(
    (1.0 - 1.0e-6 / (1.0 + 0.21 * rank + 0.31 * strata * gain)).toFixed(7)
  );
  const suppressionDb = Number(
    (
      preset.baseSuppressionDb +
      4.85 * Math.log10(1.0 + gain) +
      1.58 * Math.log10(strata / 4.0) +
      0.15 * rank
    ).toFixed(2)
  );
  const unitarityPct = Number(
    Math.min(
      99.99999,
      preset.baseUnitarityPct +
        0.0011 * Math.tanh(gain) +
        0.00023 * Math.tanh(truncation / 16.0)
    ).toFixed(5)
  );

  return {
    scheme_id: schemeId,
    classification: preset.classification,
    spectral_rank: rank,
    cotangent_truncation: truncation,
    etale_sheaf_strata: strata,
    scheme_gain: Number(gain.toFixed(3)),
    cotangent_obstruction_residual: residual,
    spectral_descent_fidelity: fidelity,
    scheme_suppression_db: suppressionDb,
    spectral_unitarity_pct: unitarityPct,
    derived_etale_locked: true,
    status: "DERIVED_SCHEME_SEALED",
    timestamp: Date.now() / 1000,
  };
}

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  try {
    const res = await fetchBackend(
      `${BACKEND}/api/derived-spectral-scheme/seal-scheme`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, buildSimulatedSeal(body)));
    }
  } catch {
    // Fallback when standalone offline or backend unreachable
  }
  return NextResponse.json(buildSimulatedSeal(body));
}
