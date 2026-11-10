import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  manifolds: [
    {
      manifold_id: "G2-JOYCE-ORBIFOLD-01",
      sector: "Joyce T^7 / Z_2^3 Exceptional Holonomy Core (Geneva)",
      betti_b2: 12,
      betti_b3: 43,
      base_radius_planck: 18.5,
      torsion_class_norm: 1.4e-15,
      g2_holonomy_fidelity_pct: 99.988,
      chiral_generations: 3,
      status: "G2_HOLONOMY_LOCKED",
    },
    {
      manifold_id: "G2-CONIFOLD-BRANE-02",
      sector: "Bryant-Salamon Conical Spin-Orbifold (Cis-Lunar Enclave)",
      betti_b2: 9,
      betti_b3: 34,
      base_radius_planck: 21.0,
      torsion_class_norm: 2.1e-15,
      g2_holonomy_fidelity_pct: 99.976,
      chiral_generations: 3,
      status: "G2_HOLONOMY_LOCKED",
    },
    {
      manifold_id: "G2-K3-FIBERED-03",
      sector: "Kovalev Twisted Connected Sum G2 Lattice (Lagrange L1)",
      betti_b2: 16,
      betti_b3: 55,
      base_radius_planck: 16.8,
      torsion_class_norm: 9.5e-16,
      g2_holonomy_fidelity_pct: 99.993,
      chiral_generations: 3,
      status: "G2_HOLONOMY_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/m-theory-g2/manifolds`,
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

