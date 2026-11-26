import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_BASE}/api/kontsevich-wall-crossing/chambers`, {
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Kontsevich chambers:", err);
  }

  return NextResponse.json({
    chambers: [
      {
        chamber_id: "KONTSEVICH-SOIBELMAN-01",
        name: "Kontsevich-Soibelman Quantum Torus Wall-Crossing",
        bps_charge_rank: 2,
        wall_crossing_defect: 1e-18,
        kontsevich_firewall_strength_pev: 3.4e12,
        wall_crossing_suppression_db: 206.5,
        status: "KONTSEVICH_WALL_LOCKED",
      },
      {
        chamber_id: "BRIDGELAND-STABILITY-02",
        name: "Bridgeland Derived Category Stability Manifold",
        bps_charge_rank: 3,
        wall_crossing_defect: 1.1e-18,
        kontsevich_firewall_strength_pev: 3.5e12,
        wall_crossing_suppression_db: 207.0,
        status: "KONTSEVICH_WALL_LOCKED",
      },
      {
        chamber_id: "GAIOTTO-MOORE-NEITZKE-03",
        name: "Gaiotto-Moore-Neitzke Hitchin Spectral Network",
        bps_charge_rank: 4,
        wall_crossing_defect: 1.2e-18,
        kontsevich_firewall_strength_pev: 3.6e12,
        wall_crossing_suppression_db: 207.5,
        status: "KONTSEVICH_WALL_LOCKED",
      },
    ],
  });
}
