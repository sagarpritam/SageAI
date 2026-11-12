import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

function buildSimulatedHarvest(body: Record<string, unknown>) {
  const arrayId =
    typeof body.array_id === "string" && body.array_id
      ? body.array_id
      : "UNRUH-RINDLER-LEO-01";
  const freqGhz = Math.max(10.0, Math.min(Number(body.cavity_frequency_ghz ?? 34.0) || 34.0, 180.0));
  const gain = Math.max(0.85, Math.min(Number(body.rectifier_gain ?? 1.45) || 1.45, 2.5));
  const accel = 4.2;
  const effectiveUnruhK = Number((1.68 * (0.85 + 0.15 * gain)).toFixed(3));
  const netGw = Number(
    ((freqGhz / 34.0) * 192.0 * (1.0 + 0.08 * accel) * (0.84 + 0.22 * gain)).toFixed(2)
  );
  const efficiencyPct = Number(
    Math.min(99.3, 97.42 + 0.36 * Math.tanh(gain - 0.85)).toFixed(2)
  );

  return {
    array_id: arrayId,
    location: "Equatorial LEO Accelerated Cryogenic Rindler Rotor Ring",
    rindler_accel_1e20_ms2: accel,
    effective_unruh_temp_kelvin: effectiveUnruhK,
    cavity_frequency_ghz: Number(freqGhz.toFixed(2)),
    rectifier_gain: Number(gain.toFixed(3)),
    conversion_efficiency_pct: efficiencyPct,
    net_grid_output_gw: netGw,
    zero_fossil_carbon: true,
    zero_fissile_waste: true,
    status: "UNRUH_RINDLER_OPTIMAL",
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
      `${BACKEND}/api/unruh-rindler-power/harvest-unruh`,
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

