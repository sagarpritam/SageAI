import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/planetary-coupled-dynasphere-resonance/nodes`,
      { method: "GET" },
      8000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, { nodes: [] }));
    }
  } catch {
    // Fallback when standalone offline
  }

  return NextResponse.json(
    {
      nodes: [
        {
          node_id: "DYNASPHERE-WHOLE-EARTH-RESONATOR-01",
          name: "Whole-Earth Column Harmonic Standing Wave Transducer 01 (Offline Cache)",
          resonant_frequency_mhz: 0.309,
          standing_wave_mode: "0S2 Toroidal-Spheroidal Quadrupole",
          core_depth_span_km: 6371.0,
          central_pressure_gpa: 364.0,
          base_resonance_coupling_pct: 99.4,
        },
        {
          node_id: "DYNASPHERE-CMB-ICB-INTERFERENCE-02",
          name: "CMB-to-ICB Dual-Boundary Acoustic Interference Mesh 02",
          resonant_frequency_mhz: 1.412,
          standing_wave_mode: "0T2 Toroidal Free Oscillation",
          core_depth_span_km: 3480.0,
          central_pressure_gpa: 330.0,
          base_resonance_coupling_pct: 99.6,
        },
        {
          node_id: "DYNASPHERE-POLAR-JET-AXIS-COUPLER-03",
          name: "Polar Tangent Cylinder to Center Singularity Waveguide 03",
          resonant_frequency_mhz: 2.854,
          standing_wave_mode: "Alfvén-Coriolis Planetary Eigensphere",
          core_depth_span_km: 5150.0,
          central_pressure_gpa: 360.0,
          base_resonance_coupling_pct: 99.8,
        },
      ],
    },
    { status: 200 }
  );
}
