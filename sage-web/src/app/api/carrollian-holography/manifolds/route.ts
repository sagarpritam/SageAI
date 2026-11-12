import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  manifolds: [
    {
      manifold_id: "CAR-NULL-SCRI-01",
      structure: "3D Null Infinity Carrollian Bundle (I+ Electric Sector c -> 0)",
      default_carroll_coupling: 0.92,
      default_dipole_charge: 4.0,
      base_fidelity_pct: 99.997,
      base_isolation_db: 157.8,
      status: "CARROLLIAN_CONE_LOCKED",
    },
    {
      manifold_id: "CAR-MAGNETIC-BMS-02",
      structure: "Magnetic Carrollian Scalar & Flat-Space BMS4 Superrotation",
      default_carroll_coupling: 0.95,
      default_dipole_charge: 6.0,
      base_fidelity_pct: 99.998,
      base_isolation_db: 160.2,
      status: "CARROLLIAN_CONE_LOCKED",
    },
    {
      manifold_id: "CAR-FRACTON-DIPOLE-03",
      structure: "Lifshitz-Fracton Dipole Conserved Carrollian Gauge Boundary",
      default_carroll_coupling: 0.98,
      default_dipole_charge: 8.0,
      base_fidelity_pct: 99.999,
      base_isolation_db: 162.5,
      status: "CARROLLIAN_CONE_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/carrollian-holography/manifolds`,
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

