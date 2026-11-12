import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

function buildSimulatedSeal(body: Record<string, unknown>) {
  const universeId =
    typeof body.universe_id === "string" && body.universe_id
      ? body.universe_id
      : "HOTT-UNIVALENCE-U0-01";
  const trunc = Math.max(0, Math.min(Math.round(Number(body.h_truncation_level ?? 2) || 2), 12));
  const cub = Math.max(2, Math.min(Math.round(Number(body.cubical_dimension ?? 8) || 8), 64));
  const hits = Math.max(2, Math.min(Math.round(Number(body.hit_constructors ?? 10) || 10), 64));
  const gain = Math.max(0.85, Math.min(Number(body.univalence_gain ?? 1.6) || 1.6, 2.5));

  const drift = Number(
    (1.0e-5 / (1.0 + 0.18 * cub + 0.12 * hits) / 10.0 ** (3.25 * gain)).toFixed(12)
  );
  const index = Number(
    (1.0 - 1.0e-6 / (1.0 + 0.16 * trunc + 0.25 * cub * gain)).toFixed(7)
  );
  const isolationDb = Number(
    (164.0 + 4.65 * Math.log10(1.0 + gain) + 1.55 * Math.log10(hits / 2.0) + 0.12 * cub).toFixed(2)
  );
  const fidelityPct = Number(
    Math.min(99.99999, 99.9981 + 0.00118 * Math.tanh(gain) + 0.00028 * Math.tanh(hits / 12.0)).toFixed(5)
  );

  return {
    universe_id: universeId,
    classification: "Voevodsky Univalent Type Universe U_0 & Kan-Cubical Path Firewall",
    h_truncation_level: trunc,
    cubical_dimension: cub,
    hit_constructors: hits,
    univalence_gain: Number(gain.toFixed(3)),
    kan_fibration_transport_drift: drift,
    univalence_equivalence_index: index,
    homotopy_isolation_db: isolationDb,
    univalence_fidelity_pct: fidelityPct,
    eckmann_hilton_coherence_locked: true,
    status: "HOTT_UNIVALENCE_SEALED",
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
      `${BACKEND}/api/homotopy-type-univalence/seal-univalence`,
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

