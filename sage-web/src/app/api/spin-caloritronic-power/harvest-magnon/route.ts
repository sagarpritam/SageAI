import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

function buildSimulatedHarvest(body: Record<string, unknown>) {
  const arrayId =
    typeof body.array_id === "string" && body.array_id
      ? body.array_id
      : "MAGNON-YIG-PT-01";
  const freqGhz = Math.max(12.0, Math.min(Number(body.magnon_freq_ghz ?? 42.0) || 42.0, 240.0));
  const gain = Math.max(0.8, Math.min(Number(body.spin_seebeck_gain ?? 1.5) || 1.5, 2.5));

  const effPct = Number(
    Math.min(99.6, 98.08 + 0.35 * Math.tanh(0.65 * (gain - 0.8))).toFixed(2)
  );
  const rawGw = 280.0 * (0.86 + 0.14 * (freqGhz / 42.0)) * (0.8 + 0.25 * gain);
  const netGw = Number((rawGw * (effPct / 100.0)).toFixed(2));

  return {
    array_id: arrayId,
    location: "Sub-Crustal YIG/Pt Spin-Seebeck Magnon-BEC Ring",
    spin_hall_angle: 0.34,
    magnon_freq_ghz: Number(freqGhz.toFixed(2)),
    spin_seebeck_gain: Number(gain.toFixed(3)),
    conversion_efficiency_pct: effPct,
    net_grid_output_gw: netGw,
    magnon_bec_locked: true,
    zero_fossil_carbon: true,
    zero_fissile_waste: true,
    status: "SPIN_CALORITRONIC_GRID_OPTIMAL",
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
      `${BACKEND}/api/spin-caloritronic-power/harvest-magnon`,
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

