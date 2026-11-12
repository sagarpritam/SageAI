import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

function buildSimulatedTorque(body: Record<string, unknown>) {
  const rotorId =
    typeof body.rotor_id === "string" && body.rotor_id
      ? body.rotor_id
      : "ERG-BZ-TOROID-01";
  const aStar = Math.max(0.75, Math.min(Number(body.spin_a_star ?? 0.985) || 0.985, 0.998));
  const flux = Math.max(1.0e6, Math.min(Number(body.magnetic_flux_wb ?? 5.0e6) || 5.0e6, 1.0e7));
  const gain = Math.max(0.85, Math.min(Number(body.flux_coupling_gain ?? 1.45) || 1.45, 2.5));
  const mMode = Math.max(1, Math.min(Math.round(Number(body.superradiant_mode_m ?? 2) || 2), 6));

  const omegaH = aStar / (1.0 + Math.sqrt(Math.max(1e-6, 1.0 - aStar * aStar)));
  const bzFluxScale = (flux / 5.0e6) ** 1.15;
  const netOutputGw = Number(
    (
      228.4 *
      (0.76 + 0.36 * omegaH) *
      bzFluxScale *
      (1.0 + 0.08 * Math.tanh(gain)) *
      (1.0 + 0.015 * mMode)
    ).toFixed(2)
  );
  const efficiencyPct = Number(
    Math.min(98.4, 96.4 + 0.48 * Math.tanh(gain) + 0.18 * (aStar - 0.9)).toFixed(2)
  );
  const penroseGain = Number((1.0 + 0.29 * omegaH * (1.0 + 0.1 * gain)).toFixed(4));

  return {
    rotor_id: rotorId,
    architecture: "Superconducting Blandford-Znajek Poloidal Flux Kerr Toroid",
    spin_a_star: Number(aStar.toFixed(4)),
    magnetic_flux_wb: Number(flux.toFixed(1)),
    flux_coupling_gain: Number(gain.toFixed(3)),
    superradiant_mode_m: mMode,
    horizon_omega_dimensionless: Number(omegaH.toFixed(4)),
    penrose_energy_gain_ratio: penroseGain,
    net_grid_output_gw: netOutputGw,
    bz_conversion_efficiency_pct: efficiencyPct,
    zero_fossil_carbon: true,
    zero_fissile_waste: true,
    status: "ERGOSPHERE_BZ_OPTIMAL",
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
      `${BACKEND}/api/ergosphere-spin-power/extract-torque`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, buildSimulatedTorque(body)));
    }
  } catch {
    // Fallback when standalone offline or backend unreachable
  }
  return NextResponse.json(buildSimulatedTorque(body));
}

