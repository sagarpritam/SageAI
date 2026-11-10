import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const HBAR = 1.054571817e-34;
const SPEED_OF_LIGHT = 299792458.0;
const GRAVITATIONAL_CONSTANT = 6.6743e-11;
const BOLTZMANN_K = 1.380649e-23;

function buildSimulatedHawkingHarvest(body: Record<string, unknown>) {
  const coreId =
    typeof body.core_id === "string" && body.core_id
      ? body.core_id
      : "KUGELBLITZ-ORBITAL-L4-01";
  const massUnit = Math.max(
    2.0,
    Math.min(Number(body.singularity_mass_1e10_kg ?? 5.0) || 5.0, 12.0)
  );
  const massKg = massUnit * 1e10;
  const feedMgS = Math.max(
    0.2,
    Math.min(Number(body.accretion_feed_mg_s ?? 1.58) || 1.58, 10.0)
  );
  const gain = Math.max(
    0.8,
    Math.min(Number(body.penrose_coupling_gain ?? 1.1) || 1.1, 2.0)
  );

  const schwarzschildM =
    (2.0 * GRAVITATIONAL_CONSTANT * massKg) / SPEED_OF_LIGHT ** 2;
  const hawkingTempK =
    (HBAR * SPEED_OF_LIGHT ** 3) /
    (8.0 * Math.PI * GRAVITATIONAL_CONSTANT * massKg * BOLTZMANN_K);
  const hawkingPowerW =
    (HBAR * SPEED_OF_LIGHT ** 6) /
    (15360.0 * Math.PI * GRAVITATIONAL_CONSTANT ** 2 * massKg ** 2);
  const grossHawkingGw = (hawkingPowerW / 1e9) * (1.0 + 0.08 * (gain - 1.0));
  const equilibriumLossMgS = (hawkingPowerW / SPEED_OF_LIGHT ** 2) * 1e6;
  const netMassDriftMgS = feedMgS - equilibriumLossMgS;
  const efficiencyPct = Math.min(96.0, 92.4 * (1.0 + 0.015 * (gain - 1.0)));
  const netElectricalGw = grossHawkingGw * (efficiencyPct / 100.0);

  return {
    core_id: coreId,
    singularity_mass_kg: massKg,
    schwarzschild_radius_fm: Number((schwarzschildM * 1e15).toFixed(5)),
    hawking_temperature_tk: Number((hawkingTempK / 1e12).toFixed(4)),
    gross_hawking_luminosity_gw: Number(grossHawkingGw.toFixed(2)),
    net_electrical_output_gw: Number(netElectricalGw.toFixed(2)),
    penrose_conversion_efficiency_pct: Number(efficiencyPct.toFixed(2)),
    accretion_feed_mg_s: Number(feedMgS.toFixed(3)),
    equilibrium_evaporation_mg_s: Number(equilibriumLossMgS.toFixed(3)),
    net_mass_drift_mg_s: Number(netMassDriftMgS.toFixed(3)),
    penrose_coupling_gain: Number(gain.toFixed(3)),
    thermal_equilibrium_locked: true,
    zero_fissile_waste: true,
    status: "KUGELBLITZ_HAWKING_POWER_OPTIMAL",
    timestamp: Date.now() / 1000,
  };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const fallback = buildSimulatedHawkingHarvest(body);

  try {
    const res = await fetchBackend(
      `${BACKEND}/api/kugelblitz-hawking/harvest-power`,
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

