import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/planetary-outer-core-tangent-cylinder-jet/arrays`,
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
          array_id: "TC-NORTHERN-ARCTIC-JET-01",
          name: "Northern Polar Tangent Cylinder Retrograde Jet Stator (Offline Cache)",
          cylinder_radius_km: 1221.0,
          depth_km: 2900.0,
          pressure_gpa: 140.0,
          temperature_k: 4200.0,
          jet_velocity_km_yr: 42.5,
          azimuthal_field_mt: 4.2,
          base_stability_pct: 99.94,
        },
        {
          array_id: "TC-SOUTHERN-ANTARCTIC-SHEAR-02",
          name: "Southern Polar Tangent Cylinder Boundary Stator",
          cylinder_radius_km: 1221.0,
          depth_km: 3100.0,
          pressure_gpa: 165.0,
          temperature_k: 4400.0,
          jet_velocity_km_yr: 39.8,
          azimuthal_field_mt: 3.9,
          base_stability_pct: 99.92,
        },
        {
          array_id: "TC-EQUATORIAL-CYLINDER-TANGENT-03",
          name: "Equatorial Outer-Core Cylindrical Projection Ring",
          cylinder_radius_km: 1221.0,
          depth_km: 2891.0,
          pressure_gpa: 136.0,
          temperature_k: 4150.0,
          jet_velocity_km_yr: 44.1,
          azimuthal_field_mt: 4.5,
          base_stability_pct: 99.96,
        },
      ],
    },
    { status: 200 }
  );
}
