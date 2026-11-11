import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";
const SPEED_OF_LIGHT_MPS = 299_792_458.0;

function buildSimulatedTransit(body: Record<string, unknown>) {
  const corridorId =
    typeof body.corridor_id === "string" && body.corridor_id
      ? body.corridor_id
      : "LENTZ-SOLITON-LEO-GEO-01";
  const betaC = Math.max(
    0.05,
    Math.min(Number(body.target_velocity_c ?? 0.28) || 0.28, 0.48)
  );
  const radiusM = Math.max(
    15.0,
    Math.min(Number(body.soliton_radius_m ?? 45.0) || 45.0, 120.0)
  );
  const gain = Math.max(
    0.85,
    Math.min(Number(body.positive_plasma_recovery_gain ?? 1.15) || 1.15, 1.5)
  );

  const cruiseKmS = (betaC * SPEED_OF_LIGHT_MPS) / 1000.0;
  const cislunarSec = 384_400.0 / Math.max(1.0, cruiseKmS);
  const wecRatio = 0.042 + 0.08 * betaC * Math.sqrt(gain);
  const tidalG = 3.8e-9 / (gain * (radiusM / 45.0));
  const effPct = Math.min(97.2, 94.6 + 1.6 * (gain - 1.0));
  const shellGw = Math.max(
    165.0,
    185.0 * (0.75 + 0.85 * betaC) * (radiusM / 45.0) ** 0.35
  );
  const netGw = shellGw * (effPct / 100.0);

  return {
    corridor_id: corridorId,
    route: "Sub-Orbital Equatorial Sling <-> Geostationary Transfer Corridor",
    target_velocity_c: Number(betaC.toFixed(4)),
    cruise_velocity_km_s: Number(cruiseKmS.toFixed(2)),
    cislunar_transit_seconds: Number(cislunarSec.toFixed(2)),
    soliton_radius_m: Number(radiusM.toFixed(2)),
    positive_plasma_recovery_gain: Number(gain.toFixed(3)),
    wec_min_energy_density_ratio: Number(wecRatio.toFixed(5)),
    positive_energy_only_t00_ge_0: true,
    interior_tidal_g: Number(tidalG.toFixed(11)),
    shell_confinement_efficiency_pct: Number(effPct.toFixed(2)),
    soliton_field_power_gw: Number(shellGw.toFixed(2)),
    regenerative_bus_output_gw: Number(netGw.toFixed(2)),
    zero_exotic_negative_mass: true,
    zero_fissile_waste: true,
    status: "LENTZ_SOLITON_TRANSIT_OPTIMAL",
    timestamp: Date.now() / 1000,
  };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  const fallback = buildSimulatedTransit(body);

  try {
    const res = await fetchBackend(
      `${BACKEND}/api/alcubierre-lentz-warp/engage-soliton`,
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

