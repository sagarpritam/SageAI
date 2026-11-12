import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

function buildSimulatedHarvest(body: Record<string, unknown>) {
  const arrayId =
    typeof body.array_id === "string" && body.array_id
      ? body.array_id
      : "TIME-CRYSTAL-ORBIT-01";
  const freqGhz = Math.max(10.0, Math.min(Number(body.shapiro_freq_ghz ?? 34.0) || 34.0, 200.0));
  const gain = Math.max(0.8, Math.min(Number(body.ratchet_gain ?? 1.5) || 1.5, 2.5));

  const effPct = Number(
    Math.min(99.55, 97.95 + 0.36 * Math.tanh(0.65 * (gain - 0.8))).toFixed(2)
  );
  const rawGw = 265.0 * (0.86 + 0.14 * (freqGhz / 34.0)) * (0.8 + 0.25 * gain);
  const netGw = Number((rawGw * (effPct / 100.0)).toFixed(2));

  return {
    array_id: arrayId,
    location: "Cryo-LEO Many-Body Localized NV-Diamond Time-Crystal Array",
    subharmonic_period_nt: 2,
    shapiro_freq_ghz: Number(freqGhz.toFixed(2)),
    ratchet_gain: Number(gain.toFixed(3)),
    conversion_efficiency_pct: effPct,
    net_grid_output_gw: netGw,
    mbl_thermalization_blocked: true,
    zero_fossil_carbon: true,
    zero_fissile_waste: true,
    status: "TIME_CRYSTAL_GRID_OPTIMAL",
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
      `${BACKEND}/api/time-crystal-power/harvest-subharmonic`,
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

