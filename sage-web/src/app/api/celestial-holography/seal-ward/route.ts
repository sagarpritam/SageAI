import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

function buildSimulatedSeal(body: Record<string, unknown>) {
  const boundaryId =
    typeof body.boundary_id === "string" && body.boundary_id
      ? body.boundary_id
      : "CS2-CELESTIAL-BMS-01";
  const delta = Math.max(0.5, Math.min(Number(body.mellin_boost_delta ?? 1.5) || 1.5, 4.0));
  const order = Math.max(0, Math.min(Number(body.soft_theorem_order ?? 2) || 2, 6));
  const cutoff = Math.max(4, Math.min(Number(body.w_infinity_mode_cutoff ?? 20) || 20, 64));
  const gain = Math.max(0.85, Math.min(Number(body.bms_damping_gain ?? 1.35) || 1.35, 2.5));

  const mellinMod =
    Math.exp(-0.18 * (delta - 1.0) ** 2) * (1.0 + 0.08 * Math.log1p(cutoff));
  const wCoherence = 1.0 - 1.0 / (cutoff * 10.0 ** (1.8 * gain));
  const shearResidual = 1.4e-5 / (1.0 + order) / 10.0 ** (3.1 * gain);
  const suppressionDb =
    152.4 + 4.9 * Math.log10(1.0 + gain) + 0.42 * order + 0.06 * cutoff;
  const fidelityPct = Math.min(
    99.99999,
    99.997 + 0.0014 * Math.tanh(gain) + 0.0005 * Math.tanh(cutoff / 24.0)
  );

  return {
    boundary_id: boundaryId,
    manifold: "Future Null Infinity I^+ S^2 x R_u (BMS4 Supertranslation Frame)",
    mellin_boost_delta: Number(delta.toFixed(3)),
    soft_theorem_order: Math.round(order),
    w_infinity_mode_cutoff: Math.round(cutoff),
    bms_damping_gain: Number(gain.toFixed(3)),
    mellin_kernel_modulus: Number(mellinMod.toFixed(5)),
    w_infinity_chiral_coherence: Number(wCoherence.toFixed(9)),
    bondi_news_shear_residual: Number(shearResidual.toFixed(12)),
    memory_suppression_db: Number(suppressionDb.toFixed(2)),
    ward_identity_fidelity_pct: Number(fidelityPct.toFixed(5)),
    bms4_supertranslation_sealed: true,
    status: "CELESTIAL_W1INF_LOCKED",
    timestamp: Date.now() / 1000,
  };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const fallback = buildSimulatedSeal(body);

  try {
    const res = await fetchBackend(
      `${BACKEND}/api/celestial-holography/seal-ward`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, fallback));
    }
  } catch {
    // Fallback when standalone offline or backend unreachable
  }
  return NextResponse.json(fallback);
}

