import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const ARRAY_PRESETS: Record<
  string,
  {
    location: string;
    defaultArc: number;
    chargeOrder: number;
    baseOutputGw: number;
    baseEfficiencyPct: number;
  }
> = {
  "WEYL-TAAS-ARRAY-01": {
    location: "Equatorial Type-I Weyl Semimetal TaAs Fermi-Arc Harvester",
    defaultArc: 0.42,
    chargeOrder: 4,
    baseOutputGw: 348.0,
    baseEfficiencyPct: 98.54,
  },
  "CHIRAL-COSI-HVDC-02": {
    location: "Trans-Pacific Chiral Multifold CoSi Quantum Anomalous HVDC Trunk",
    defaultArc: 0.58,
    chargeOrder: 6,
    baseOutputGw: 508.0,
    baseEfficiencyPct: 99.02,
  },
  "WEYL-ORBITAL-RING-03": {
    location: "Orbital THz Chiral Anomaly Photo-Galvanic Rectification Ring",
    defaultArc: 0.76,
    chargeOrder: 8,
    baseOutputGw: 712.0,
    baseEfficiencyPct: 99.44,
  },
};

function buildSimulatedHarvest(body: Record<string, unknown>) {
  const arrayId =
    typeof body.array_id === "string" && body.array_id in ARRAY_PRESETS
      ? body.array_id
      : "WEYL-TAAS-ARRAY-01";
  const preset = ARRAY_PRESETS[arrayId];
  const arc = Math.max(
    0.1,
    Math.min(Number(body.fermi_arc_angstrom ?? preset.defaultArc) || preset.defaultArc, 2.5)
  );
  const gain = Math.max(0.8, Math.min(Number(body.chiral_anomaly_gain ?? 1.6) || 1.6, 2.5));

  const effPct = Number(
    Math.min(
      99.86,
      preset.baseEfficiencyPct + 0.35 * Math.tanh(0.7 * (gain - 0.8))
    ).toFixed(2)
  );
  const rawGw =
    preset.baseOutputGw *
    (0.85 + 0.15 * (arc / preset.defaultArc)) *
    (0.8 + 0.25 * gain);
  const netGw = Number((rawGw * (effPct / 100.0)).toFixed(2));

  return {
    array_id: arrayId,
    location: preset.location,
    chiral_charge_order: preset.chargeOrder,
    fermi_arc_angstrom: Number(arc.toFixed(3)),
    chiral_anomaly_gain: Number(gain.toFixed(3)),
    conversion_efficiency_pct: effPct,
    net_grid_output_gw: netGw,
    chiral_anomaly_locked: true,
    zero_fossil_carbon: true,
    zero_fissile_waste: true,
    status: "WEYL_SUPERGRID_OPTIMAL",
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
      `${BACKEND}/api/weyl-chiral-supergrid/harvest-weyl`,
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
