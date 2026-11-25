import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/geodynamo-helical-turbulent-supergrid/arrays`,
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
          array_id: "DYNAMO-EQUATORIAL-COLUMN-01",
          location: "Equatorial Outer Core Tangent Cylinder Induction Array",
          outer_core_depth_km: 3200.0,
          magnetic_reynolds_rm: 850.0,
          rossby_number_ro: 1.2e-6,
          turbulent_helicity_alpha: 0.045,
          base_induction_efficiency_pct: 99.58,
          status: "GEODYNAMO_INDUCTION_ACTIVE",
        },
        {
          array_id: "DYNAMO-POLAR-PLUME-02",
          location: "High-Latitude Helical Upwelling Convective Plume Conduit",
          outer_core_depth_km: 2950.0,
          magnetic_reynolds_rm: 920.0,
          rossby_number_ro: 1.5e-6,
          turbulent_helicity_alpha: 0.052,
          base_induction_efficiency_pct: 99.64,
          status: "GEODYNAMO_INDUCTION_ACTIVE",
        },
        {
          array_id: "DYNAMO-MID-LATITUDE-TAYLOR-03",
          location: "Mid-Latitude Quasi-Geostrophic Helical Eddy Supergrid",
          outer_core_depth_km: 3100.0,
          magnetic_reynolds_rm: 780.0,
          rossby_number_ro: 1.1e-6,
          turbulent_helicity_alpha: 0.041,
          base_induction_efficiency_pct: 99.52,
          status: "GEODYNAMO_INDUCTION_ACTIVE",
        },
      ],
    },
    { status: 200 }
  );
}
