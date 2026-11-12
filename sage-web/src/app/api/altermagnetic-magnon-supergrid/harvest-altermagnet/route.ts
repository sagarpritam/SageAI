import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const ARRAY_PRESETS: Record<
  string,
  {
    location: string;
    defaultSplit: number;
    harmonicOrder: number;
    baseOutputGw: number;
    baseEfficiencyPct: number;
  }
> = {
  "ALTERMAG-RUO2-ARRAY-01": {
    location: "Equatorial d-Wave Altermagnetic RuO2 Spin-Split Array",
    defaultSplit: 480.0,
    harmonicOrder: 4,
    baseOutputGw: 334.0,
    baseEfficiencyPct: 98.48,
  },
  "CHIRAL-MNTE-HVDC-02": {
    location: "Trans-Continental Chiral MnTe Zero-Stray-Flux Magnon Trunk",
    defaultSplit: 590.0,
    harmonicOrder: 6,
    baseOutputGw: 486.0,
    baseEfficiencyPct: 98.94,
  },
  "MAGNON-ORBITAL-RING-03": {
    location: "Orbital THz Altermagnetic Spin-Torque Rectification Ring",
    defaultSplit: 720.0,
    harmonicOrder: 8,
    baseOutputGw: 678.0,
    baseEfficiencyPct: 99.36,
  },
};

function buildSimulatedHarvest(body: Record<string, unknown>) {
  const arrayId =
    typeof body.array_id === "string" && body.array_id in ARRAY_PRESETS
      ? body.array_id
      : "ALTERMAG-RUO2-ARRAY-01";
  const preset = ARRAY_PRESETS[arrayId];
  const split = Math.max(
    140.0,
    Math.min(Number(body.spin_splitting_mev ?? preset.defaultSplit) || preset.defaultSplit, 1400.0)
  );
  const gain = Math.max(0.8, Math.min(Number(body.magnon_coherence_gain ?? 1.6) || 1.6, 2.5));

  const effPct = Number(
    Math.min(
      99.85,
      preset.baseEfficiencyPct + 0.34 * Math.tanh(0.69 * (gain - 0.8))
    ).toFixed(2)
  );
  const rawGw =
    preset.baseOutputGw *
    (0.86 + 0.14 * (split / preset.defaultSplit)) *
    (0.8 + 0.25 * gain);
  const netGw = Number((rawGw * (effPct / 100.0)).toFixed(2));

  return {
    array_id: arrayId,
    location: preset.location,
    dwave_harmonic_order: preset.harmonicOrder,
    spin_splitting_mev: Number(split.toFixed(1)),
    magnon_coherence_gain: Number(gain.toFixed(3)),
    conversion_efficiency_pct: effPct,
    net_grid_output_gw: netGw,
    zero_stray_flux_locked: true,
    zero_fossil_carbon: true,
    zero_fissile_waste: true,
    status: "ALTERMAGNETIC_SUPERGRID_OPTIMAL",
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
      `${BACKEND}/api/altermagnetic-magnon-supergrid/harvest-altermagnet`,
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

