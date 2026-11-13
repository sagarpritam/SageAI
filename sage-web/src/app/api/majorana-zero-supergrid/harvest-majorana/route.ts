import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const ARRAY_PRESETS: Record<
  string,
  { location: string; baseOutputGw: number; baseEfficiencyPct: number; order: number }
> = {
  "MAJORANA-NANOWIRE-ARRAY-01": {
    location: "Equatorial InSb Semiconductor-Superconductor Kitaev Nanowire Harvester",
    baseOutputGw: 365.0,
    baseEfficiencyPct: 98.62,
    order: 4,
  },
  "TOPOLOGICAL-BRAID-HVDC-02": {
    location: "Trans-Continental Non-Abelian Braided Parity-Protected HVDC Trunk",
    baseOutputGw: 526.0,
    baseEfficiencyPct: 99.08,
    order: 6,
  },
  "PARITY-PROTECTED-RING-03": {
    location: "Orbital Fermion-Parity Topological Quantum Rectification Ring",
    baseOutputGw: 738.0,
    baseEfficiencyPct: 99.49,
    order: 8,
  },
};

function buildSimulatedHarvest(body: Record<string, unknown>) {
  const arrayId =
    typeof body.array_id === "string" && body.array_id in ARRAY_PRESETS
      ? body.array_id
      : "MAJORANA-NANOWIRE-ARRAY-01";
  const preset = ARRAY_PRESETS[arrayId];
  const gap = Math.max(100.0, Math.min(Number(body.topological_gap_muev ?? 640.0) || 640.0, 2500.0));
  const gain = Math.max(0.85, Math.min(Number(body.braid_coherence_gain ?? 1.6) || 1.6, 2.5));
  const order = preset.order;

  const netOutputGw = Number(
    (preset.baseOutputGw * (gap / 500.0) ** 0.16 * (1.0 + 0.15 * gain)).toFixed(2)
  );
  const efficiencyPct = Number(
    Math.min(99.99, preset.baseEfficiencyPct + 0.18 * Math.tanh(gain)).toFixed(2)
  );
  const residual = Number(
    (1.0e-5 / ((1.0 + 0.15 * order) * 10.0 ** (3.3 * gain))).toFixed(12)
  );
  const coherence = Number(
    (1.0 - 1.0e-6 / (1.0 + 0.25 * order * gain)).toFixed(7)
  );

  return {
    array_id: arrayId,
    location: preset.location,
    topological_gap_muev: Number(gap.toFixed(2)),
    braid_coherence_gain: Number(gain.toFixed(3)),
    majorana_braid_order: order,
    net_grid_output_gw: netOutputGw,
    conversion_efficiency_pct: efficiencyPct,
    braiding_residual: residual,
    parity_coherence: coherence,
    zero_fossil_carbon: true,
    zero_fissile_waste: true,
    status: "MAJORANA_SUPERGRID_OPTIMAL",
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
      `${BACKEND}/api/majorana-zero-supergrid/harvest-majorana`,
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
    // fallback
  }

  return NextResponse.json(buildSimulatedHarvest(body));
}
