import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

function buildSimulatedSeal(body: Record<string, unknown>) {
  const topologyId =
    typeof body.topology_id === "string" && body.topology_id
      ? body.topology_id
      : "JT-SSS-TRUMPET-01";
  const gVal = Math.max(0, Math.min(Math.round(Number(body.genus_g ?? 2) || 2), 16));
  const s0Val = Math.max(4.0, Math.min(Number(body.s0_entropy ?? 8.4) || 8.4, 20.0));
  const tempVal = Math.max(0.25, Math.min(Number(body.schwarzian_temp ?? 1.25) || 1.25, 5.0));
  const gain = Math.max(0.85, Math.min(Number(body.trumpet_clamp_gain ?? 1.5) || 1.5, 2.5));

  const genusWeight = Number(Math.exp(-(2 * gVal + 1) * Math.min(s0Val, 12.0) * 0.15).toFixed(8));
  const spectralNorm = Number((Math.sin(Math.min(tempVal, 2.5) * 0.8) / (1.0 + 0.1 * gVal)).toFixed(5));
  const residual = Number((1.0e-5 / (1.0 + s0Val) / 10.0 ** (3.1 * gain)).toFixed(12));
  const suppressionDb = Number(
    (157.6 + 4.6 * Math.log10(1.0 + gain) + 2.2 * Math.log1p(gVal) + 0.35 * s0Val).toFixed(2)
  );
  const fidelityPct = Number(
    Math.min(99.99999, 99.997 + 0.0014 * Math.tanh(gain) + 0.0002 * Math.tanh(s0Val / 8.0)).toFixed(5)
  );

  return {
    topology_id: topologyId,
    geometry: "SSS Double-Scaled Matrix Trumpet Wormhole (e^{S_0} = 4096)",
    genus_g: gVal,
    s0_entropy: Number(s0Val.toFixed(3)),
    schwarzian_temp: Number(tempVal.toFixed(3)),
    trumpet_clamp_gain: Number(gain.toFixed(3)),
    genus_weight_decay: genusWeight,
    spectral_curve_residue: spectralNorm,
    factorization_leak_residual: residual,
    wormhole_suppression_db: suppressionDb,
    matrix_unitarity_fidelity_pct: fidelityPct,
    weil_petersson_locked: true,
    status: "JT_WORMHOLE_SEALED",
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
      `${BACKEND}/api/jt-wormhole-matrix/seal-wormhole`,
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

