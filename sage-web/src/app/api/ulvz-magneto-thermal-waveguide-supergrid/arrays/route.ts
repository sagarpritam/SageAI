import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/ulvz-magneto-thermal-waveguide-supergrid/arrays`,
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
          array_id: "ULVZ-HAWAII-PLUME-ROOT-01",
          location: "Hawaiian Deep Mantle Plume Root Core-Mantle Boundary ULVZ",
          cmb_depth_km: 2891.0,
          ulvz_thickness_km: 25.0,
          shear_velocity_drop_pct: 32.5,
          iron_enrichment_x_fe: 0.18,
          temperature_k: 3820.0,
          base_extraction_efficiency_pct: 99.72,
          status: "ULVZ_MAGNETO_THERMAL_ACTIVE",
        },
        {
          array_id: "ULVZ-SAMOA-HOTSPOT-BASAL-02",
          location: "Samoa Hotspot Basal Mantle Slurry High-Conductivity Pad",
          cmb_depth_km: 2891.0,
          ulvz_thickness_km: 18.0,
          shear_velocity_drop_pct: 28.0,
          iron_enrichment_x_fe: 0.16,
          temperature_k: 3780.0,
          base_extraction_efficiency_pct: 99.68,
          status: "ULVZ_MAGNETO_THERMAL_ACTIVE",
        },
        {
          array_id: "ULVZ-CORAL-SEA-CMB-03",
          location: "Southwestern Pacific LLSVP Margin Core-Mantle Boundary ULVZ",
          cmb_depth_km: 2891.0,
          ulvz_thickness_km: 35.0,
          shear_velocity_drop_pct: 45.0,
          iron_enrichment_x_fe: 0.22,
          temperature_k: 3910.0,
          base_extraction_efficiency_pct: 99.81,
          status: "ULVZ_MAGNETO_THERMAL_ACTIVE",
        },
      ],
    },
    { status: 200 }
  );
}
