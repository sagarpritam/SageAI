import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  arrays: [
    {
      array_id: "UNRUH-RINDLER-LEO-01",
      location: "Equatorial LEO Accelerated Cryogenic Rindler Rotor Ring",
      rindler_accel_1e20_ms2: 4.2,
      default_cavity_ghz: 34.0,
      unruh_temp_kelvin: 1.68,
      base_efficiency_pct: 97.42,
      status: "UNRUH_RINDLER_LOCKED",
    },
    {
      array_id: "UNRUH-CRUST-JOSEPHSON-02",
      location: "Sub-Crustal Basalt NbTi Josephson Unruh Cavity Matrix",
      rindler_accel_1e20_ms2: 6.4,
      default_cavity_ghz: 48.0,
      unruh_temp_kelvin: 2.56,
      base_efficiency_pct: 98.05,
      status: "UNRUH_RINDLER_LOCKED",
    },
    {
      array_id: "UNRUH-L1-FULLING-03",
      location: "Sun-Earth L1 Deep-Cryo Fulling-Davies Horizon Rectifier",
      rindler_accel_1e20_ms2: 8.8,
      default_cavity_ghz: 64.0,
      unruh_temp_kelvin: 3.52,
      base_efficiency_pct: 98.48,
      status: "UNRUH_RINDLER_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/unruh-rindler-power/arrays`,
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

