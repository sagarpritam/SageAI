import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/planetary-f-layer-slurry-supergrid/arrays`,
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
          array_id: "F-LAYER-PACIFIC-SEDIMENT-01",
          region_name: "Pacific F-Layer Slurry Basin (Offline Cache)",
          depth_km: 4950.0,
          layer_thickness_km: 250.0,
          pressure_gpa: 315.0,
          temperature_k: 5500.0,
          iron_sedimentation_rate_mm_yr: 2.4,
          stratification_buoyancy_ms2: 0.082,
          base_stability_pct: 99.92,
        },
        {
          array_id: "F-LAYER-ATLANTIC-STRATIFIED-02",
          region_name: "Atlantic Stratified Core-Snow Reservoir",
          depth_km: 5020.0,
          layer_thickness_km: 245.0,
          pressure_gpa: 322.0,
          temperature_k: 5620.0,
          iron_sedimentation_rate_mm_yr: 2.8,
          stratification_buoyancy_ms2: 0.091,
          base_stability_pct: 99.95,
        },
        {
          array_id: "F-LAYER-EQUATORIAL-SLURRY-03",
          region_name: "Equatorial Outer-Core Dendritic Mush",
          depth_km: 4980.0,
          layer_thickness_km: 255.0,
          pressure_gpa: 318.0,
          temperature_k: 5560.0,
          iron_sedimentation_rate_mm_yr: 2.2,
          stratification_buoyancy_ms2: 0.076,
          base_stability_pct: 99.88,
        },
      ],
    },
    { status: 200 }
  );
}
