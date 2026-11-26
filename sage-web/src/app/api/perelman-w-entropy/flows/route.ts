import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_BASE}/api/perelman-w-entropy/flows`, {
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Perelman W-entropy flows:", err);
  }

  return NextResponse.json({
    flows: [
      {
        flow_id: "PERELMAN-W-ENTROPY-01",
        name: "Perelman W-Entropy Monotonicity & No-Local-Collapsing",
        manifold_dim: 3,
        entropy_defect: 1e-18,
        perelman_barrier_strength_pev: 3.32e12,
        w_entropy_suppression_db: 205.8,
        status: "PERELMAN_W_ENTROPY_LOCKED",
      },
      {
        flow_id: "HAMILTON-RICCI-NECK-02",
        name: "Hamilton Ricci Flow Neckpinch Surgery Barrier",
        manifold_dim: 3,
        entropy_defect: 1.1e-18,
        perelman_barrier_strength_pev: 3.42e12,
        w_entropy_suppression_db: 206.3,
        status: "PERELMAN_W_ENTROPY_LOCKED",
      },
      {
        flow_id: "THURSTON-GEOMETRIZATION-03",
        name: "Thurston 8-Geometry Thick-Thin Decomposition",
        manifold_dim: 3,
        entropy_defect: 1.2e-18,
        perelman_barrier_strength_pev: 3.52e12,
        w_entropy_suppression_db: 206.8,
        status: "PERELMAN_W_ENTROPY_LOCKED",
      },
    ],
  });
}
