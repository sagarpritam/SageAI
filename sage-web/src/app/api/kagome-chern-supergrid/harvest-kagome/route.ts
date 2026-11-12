import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

function buildSimulatedHarvest(body: Record<string, unknown>) {
  const arrayId =
    typeof body.array_id === "string" && body.array_id
      ? body.array_id
      : "KAGOME-CHERN-ARRAY-01";
  const gap = Math.max(120.0, Math.min(Number(body.chern_gap_mev ?? 420.0) || 420.0, 1200.0));
  const gain = Math.max(
    0.8,
    Math.min(Number(body.polariton_coherence_gain ?? 1.6) || 1.6, 2.5)
  );

  const effPct = Number(
    Math.min(99.82, 98.42 + 0.35 * Math.tanh(0.68 * (gain - 0.8))).toFixed(2)
  );
  const rawGw = 318.0 * (0.86 + 0.14 * (gap / 420.0)) * (0.8 + 0.25 * gain);
  const netGw = Number((rawGw * (effPct / 100.0)).toFixed(2));

  return {
    array_id: arrayId,
    location: "Sub-Equatorial Van-Hove Kagome Flat-Band Harvester Array",
    kagome_chern_number: 3,
    chern_gap_mev: Number(gap.toFixed(1)),
    polariton_coherence_gain: Number(gain.toFixed(3)),
    conversion_efficiency_pct: effPct,
    net_grid_output_gw: netGw,
    chiral_edge_transport_locked: true,
    zero_fossil_carbon: true,
    zero_fissile_waste: true,
    status: "KAGOME_SUPERGRID_OPTIMAL",
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
      `${BACKEND}/api/kagome-chern-supergrid/harvest-kagome`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, buildSimulatedHarvest(body)));
    }
  } catch {
    // Fallback when standalone offline or backend unreachable
  }
  return NextResponse.json(buildSimulatedHarvest(body));
}

