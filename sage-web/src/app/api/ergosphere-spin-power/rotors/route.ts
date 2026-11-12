import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  rotors: [
    {
      rotor_id: "ERG-BZ-TOROID-01",
      architecture: "Superconducting Blandford-Znajek Poloidal Flux Kerr Toroid",
      default_spin_a_star: 0.96,
      default_magnetic_flux_wb: 4200000.0,
      default_plasma_impedance_ohm: 377.0,
      base_output_gw: 228.4,
      base_efficiency_pct: 96.4,
      status: "ERGOSPHERE_BZ_SYNCED",
    },
    {
      rotor_id: "ERG-PENROSE-ORBITAL-02",
      architecture: "High-Altitude L1 Penrose Split-Geodesic Synchrotron Collector",
      default_spin_a_star: 0.985,
      default_magnetic_flux_wb: 5100000.0,
      default_plasma_impedance_ohm: 377.0,
      base_output_gw: 286.7,
      base_efficiency_pct: 97.1,
      status: "ERGOSPHERE_BZ_SYNCED",
    },
    {
      rotor_id: "ERG-SUBCRUSTAL-KERR-03",
      architecture: "Sub-Crustal Cryo-Shielded Extremal Micro-Ergosphere Array",
      default_spin_a_star: 0.998,
      default_magnetic_flux_wb: 6000000.0,
      default_plasma_impedance_ohm: 377.0,
      base_output_gw: 344.2,
      base_efficiency_pct: 97.6,
      status: "ERGOSPHERE_BZ_SYNCED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/ergosphere-spin-power/rotors`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_DATA));
    }
  } catch {
    // Fallback when standalone offline or backend unreachable
  }
  return NextResponse.json(FALLBACK_DATA);
}

