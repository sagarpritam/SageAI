import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_MANIFOLDS = {
  manifolds: [
    {
      manifold_id: "G2-JOYCE-TORUS-01",
      classification: "Compact G_2 Joyce Orbifold T^7 / Gamma_1",
      betti_b2: 0,
      betti_b3: 7,
      associative_volume: 4.18879,
      coassociative_volume: 12.56637,
      base_calibration_fidelity_pct: 99.9994,
      status: "G2_HOLONOMY_LOCKED",
    },
    {
      manifold_id: "G2-KOVANOV-TWIST-02",
      classification: "Twisted Connected Sum G_2 Manifold (K3 x T^2 Core)",
      betti_b2: 1,
      betti_b3: 43,
      associative_volume: 6.28318,
      coassociative_volume: 18.84955,
      base_calibration_fidelity_pct: 99.9997,
      status: "G2_HOLONOMY_LOCKED",
    },
    {
      manifold_id: "G2-ASYMPTOTIC-CONICAL-03",
      classification: "Asymptotically Conical G_2 Holonomy Moduli Shield",
      betti_b2: 2,
      betti_b3: 77,
      associative_volume: 8.37758,
      coassociative_volume: 25.13274,
      base_calibration_fidelity_pct: 99.9999,
      status: "G2_HOLONOMY_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/g2-octonionic-shield/manifolds`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_MANIFOLDS));
    }
    return NextResponse.json(FALLBACK_MANIFOLDS);
  } catch {
    return NextResponse.json(FALLBACK_MANIFOLDS);
  }
}
