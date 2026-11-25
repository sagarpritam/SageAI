import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/planetary-innermost-inner-core-anisotropy/arrays`,
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
          array_id: "IMIC-EQUATORIAL-FAST-AXIS-01",
          name: "Innermost Inner Core Equatorial Fast-Axis Array 01 (Offline Cache)",
          radius_km: 350.0,
          depth_km: 6021.0,
          pressure_gpa: 360.0,
          temperature_k: 6150.0,
          tilt_angle_deg: 55.0,
          base_anisotropy_pct: 3.2,
          transducer_mode: "BCC-Iron Spin-Phonon Resonator",
        },
        {
          array_id: "IMIC-GEOMETRIC-CENTER-CORE-02",
          name: "Earth Geometric Center Singularity Transducer 02",
          radius_km: 150.0,
          depth_km: 6221.0,
          pressure_gpa: 364.0,
          temperature_k: 6200.0,
          tilt_angle_deg: 58.5,
          base_anisotropy_pct: 3.6,
          transducer_mode: "Central Gravitational Piezo-Electric Mesh",
        },
        {
          array_id: "IMIC-POLAR-TRANSITION-SHEAR-03",
          name: "IMIC-to-OIC Lattice Phase Boundary Harvester 03",
          radius_km: 600.0,
          depth_km: 5771.0,
          pressure_gpa: 352.0,
          temperature_k: 6050.0,
          tilt_angle_deg: 48.0,
          base_anisotropy_pct: 2.8,
          transducer_mode: "Telluric Thermo-Acoustic Waveguide",
        },
      ],
    },
    { status: 200 }
  );
}
