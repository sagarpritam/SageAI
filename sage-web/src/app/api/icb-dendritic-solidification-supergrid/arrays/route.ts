import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/icb-dendritic-solidification-supergrid/arrays`,
      { method: "GET" },
      8000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, { arrays: [] }));
    }
  } catch {
    // Fallback when standalone offline
  }

  return NextResponse.json(
    {
      arrays: [
        {
          array_id: "ICB-EASTERN-HEMISPHERE-01",
          name: "East Asian Deep-Crustal ICB Solidus Collector",
          icb_depth_km: 5150.0,
          pressure_gpa: 330.0,
          temperature_k: 5750.0,
          crystallization_rate_mm_yr: 1.45,
          latent_heat_capacity_kj_per_kg: 750.0,
          crystal_phase: "HCP_EPSILON_FE_NI",
          rated_capacity_gw: 8.0,
          status: "ICB_SOLIDIFICATION_LOCKED",
        },
        {
          array_id: "ICB-WESTERN-DENDRITE-02",
          name: "Western Pacific Sub-Core Dendritic Waveguide",
          icb_depth_km: 5150.0,
          pressure_gpa: 332.0,
          temperature_k: 5820.0,
          crystallization_rate_mm_yr: 1.62,
          latent_heat_capacity_kj_per_kg: 765.0,
          crystal_phase: "HCP_EPSILON_FE_NI",
          rated_capacity_gw: 8.5,
          status: "ICB_SOLIDIFICATION_LOCKED",
        },
        {
          array_id: "ICB-EQUATORIAL-SOLIDUS-03",
          name: "Equatorial Core-Mushy-Zone Solidus Resonator",
          icb_depth_km: 5150.0,
          pressure_gpa: 329.0,
          temperature_k: 5680.0,
          crystallization_rate_mm_yr: 1.38,
          latent_heat_capacity_kj_per_kg: 740.0,
          crystal_phase: "HCP_EPSILON_FE_NI",
          rated_capacity_gw: 7.5,
          status: "ICB_SOLIDIFICATION_LOCKED",
        },
      ],
    },
    { status: 200 }
  );
}
