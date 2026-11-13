import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const KNOT_PRESETS: Record<
  string,
  { classification: string; baseUnitarityPct: number; baseSuppressionDb: number }
> = {
  "KNOT-TREFOIL-KH4-01": {
    classification: "Type 3_1 Trefoil Knot Khovanov Complex & Foam Facet",
    baseUnitarityPct: 99.9985,
    baseSuppressionDb: 165.4,
  },
  "FIGURE8-FOAM-GR6-02": {
    classification: "Type 4_1 Figure-Eight Knot Graded Cube & Foam Seam Lattice",
    baseUnitarityPct: 99.9993,
    baseSuppressionDb: 167.2,
  },
  "TORUS-T78-KHCOB-03": {
    classification: "Torus Knot T(7,8) Categorified Jones Polytope & Bar-Natan Foam Complex",
    baseUnitarityPct: 99.9998,
    baseSuppressionDb: 169.5,
  },
};

function buildSimulatedSeal(body: Record<string, unknown>) {
  const knotId =
    typeof body.knot_id === "string" && body.knot_id in KNOT_PRESETS
      ? body.knot_id
      : "KNOT-TREFOIL-KH4-01";
  const preset = KNOT_PRESETS[knotId];
  const rank = Math.max(2, Math.min(Math.round(Number(body.knot_rank ?? 4) || 4), 16));
  const crossings = Math.max(
    4,
    Math.min(Math.round(Number(body.crossing_depth ?? 12) || 12), 64)
  );
  const facets = Math.max(
    4,
    Math.min(Math.round(Number(body.foam_facets ?? 14) || 14), 128)
  );
  const gain = Math.max(0.85, Math.min(Number(body.khovanov_gain ?? 1.6) || 1.6, 2.5));

  const residual = Number(
    (1.0e-5 / (1.0 + 0.16 * crossings + 0.14 * facets) / 10.0 ** (3.27 * gain)).toFixed(12)
  );
  const coherence = Number(
    (1.0 - 1.0e-6 / (1.0 + 0.2 * rank + 0.3 * facets * gain)).toFixed(7)
  );
  const suppressionDb = Number(
    (
      preset.baseSuppressionDb +
      4.8 * Math.log10(1.0 + gain) +
      1.56 * Math.log10(facets / 4.0) +
      0.14 * rank
    ).toFixed(2)
  );
  const unitarityPct = Number(
    Math.min(
      99.99999,
      preset.baseUnitarityPct +
        0.00114 * Math.tanh(gain) +
        0.00024 * Math.tanh(crossings / 16.0)
    ).toFixed(5)
  );

  return {
    knot_id: knotId,
    classification: preset.classification,
    knot_rank: rank,
    crossing_depth: crossings,
    foam_facets: facets,
    khovanov_gain: Number(gain.toFixed(3)),
    rasmussen_s_invariant_residual: residual,
    foam_homotopy_coherence: coherence,
    khovanov_suppression_db: suppressionDb,
    categorified_unitarity_pct: unitarityPct,
    khovanov_homology_locked: true,
    status: "KHOVANOV_FOAM_SEALED",
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
      `${BACKEND}/api/khovanov-foam-cobordism/seal-khovanov`,
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
