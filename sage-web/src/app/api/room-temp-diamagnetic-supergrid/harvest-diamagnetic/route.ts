import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const ARRAY_PRESETS: Record<
  string,
  {
    location: string;
    baseOutputGw: number;
    baseEfficiencyPct: number;
    diamagneticOrderRank: number;
  }
> = {
  "DIAMAGNETIC-LK99-ARRAY-01": {
    location: "Equatorial Cu-Substituted Lead-Apatite Diamagnetic Superconducting Harvester",
    baseOutputGw: 485.0,
    baseEfficiencyPct: 98.88,
    diamagneticOrderRank: 4,
  },
  "MEISSNER-HVDC-LEVITATION-02": {
    location: "Trans-Pacific Macroscopic Meissner-Levitation Zero-Dissipation HVDC Trunk",
    baseOutputGw: 730.0,
    baseEfficiencyPct: 99.35,
    diamagneticOrderRank: 6,
  },
  "ORBITAL-CRYOFREE-STORAGE-03": {
    location: "Orbital Cryogenics-Free Lead-Apatite Persistent Supercurrent Ring",
    baseOutputGw: 1080.0,
    baseEfficiencyPct: 99.72,
    diamagneticOrderRank: 8,
  },
};

function buildSimulatedHarvest(body: Record<string, unknown>) {
  const arrayId =
    typeof body.array_id === "string" && body.array_id in ARRAY_PRESETS
      ? body.array_id
      : "DIAMAGNETIC-LK99-ARRAY-01";
  const preset = ARRAY_PRESETS[arrayId];
  const field = Math.max(1.0, Math.min(Number(body.meissner_field_tesla ?? 14.5) || 14.5, 120.0));
  const gain = Math.max(0.85, Math.min(Number(body.levitation_gain ?? 1.6) || 1.6, 2.5));
  const order = preset.diamagneticOrderRank;

  const outputGw = Number(
    (preset.baseOutputGw * (1.0 + 0.14 * Math.log10(1.0 + field / 10.0)) * gain).toFixed(2)
  );
  const effPct = Number(
    Math.min(
      99.99,
      preset.baseEfficiencyPct + 0.18 * Math.tanh(gain) + 0.08 * Math.tanh(field / 30.0)
    ).toFixed(2)
  );
  const residual = Number((1.0e-10 / (1.0 + 0.28 * order * gain)).toFixed(11));
  const coherence = Number(
    (1.0 - 1.0e-7 / (1.0 + 0.25 * order + 0.18 * field * 0.01)).toFixed(7)
  );

  return {
    array_id: arrayId,
    location: preset.location,
    meissner_field_tesla: Number(field.toFixed(2)),
    levitation_gain: Number(gain.toFixed(3)),
    diamagnetic_order_rank: order,
    net_grid_output_gw: outputGw,
    conversion_efficiency_pct: effPct,
    meissner_residual: residual,
    levitation_coherence: coherence,
    zero_fossil_carbon: true,
    zero_fissile_waste: true,
    status: "DIAMAGNETIC_SUPERGRID_OPTIMAL",
    timestamp: Date.now() / 1000,
  };
}

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const fallback = buildSimulatedHarvest(body);

  try {
    const res = await fetchBackend(
      `${BACKEND}/api/room-temp-diamagnetic-supergrid/harvest-diamagnetic`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          array_id: body.array_id ?? "DIAMAGNETIC-LK99-ARRAY-01",
          meissner_field_tesla: Number(body.meissner_field_tesla ?? 14.5),
          levitation_gain: Number(body.levitation_gain ?? 1.6),
        }),
      },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, fallback));
    }
  } catch {
    // fallback
  }

  return NextResponse.json(fallback);
}
