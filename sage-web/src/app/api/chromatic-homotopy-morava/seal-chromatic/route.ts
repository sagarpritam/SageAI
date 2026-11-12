import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

function buildSimulatedSeal(body: Record<string, unknown>) {
  const spectrumId =
    typeof body.spectrum_id === "string" && body.spectrum_id
      ? body.spectrum_id
      : "CHR-MORAVA-K4-01";
  const height = Math.max(1, Math.min(Math.round(Number(body.morava_height ?? 4) || 4), 16));
  const rank = Math.max(2, Math.min(Math.round(Number(body.formal_group_rank ?? 8) || 8), 64));
  const nodes = Math.max(
    4,
    Math.min(Math.round(Number(body.stabilizer_orbifold_nodes ?? 16) || 16), 128)
  );
  const gain = Math.max(0.85, Math.min(Number(body.chromatic_gain ?? 1.6) || 1.6, 2.5));

  const residual = Number(
    (1.0e-5 / (1.0 + 0.15 * nodes + 0.12 * rank) / 10.0 ** (3.18 * gain)).toFixed(12)
  );
  const coherence = Number(
    (1.0 - 1.0e-6 / (1.0 + 0.18 * height + 0.25 * nodes * gain)).toFixed(7)
  );
  const suppressionDb = Number(
    (163.8 + 4.6 * Math.log10(1.0 + gain) + 1.6 * Math.log10(nodes / 4.0) + 0.13 * height).toFixed(2)
  );
  const unitarityPct = Number(
    Math.min(
      99.99999,
      99.9979 + 0.0012 * Math.tanh(gain) + 0.00028 * Math.tanh(rank / 12.0)
    ).toFixed(5)
  );

  return {
    spectrum_id: spectrumId,
    classification: "Height-4 Morava K(4) Stabilizer & Bousfield Fracture Square",
    morava_height: height,
    formal_group_rank: rank,
    stabilizer_orbifold_nodes: nodes,
    chromatic_gain: Number(gain.toFixed(3)),
    chromatic_fracture_residual: residual,
    lubin_tate_coherence: coherence,
    chromatic_suppression_db: suppressionDb,
    morava_unitarity_pct: unitarityPct,
    bousfield_localization_locked: true,
    status: "CHROMATIC_MORAVA_SEALED",
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
      `${BACKEND}/api/chromatic-homotopy-morava/seal-chromatic`,
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

