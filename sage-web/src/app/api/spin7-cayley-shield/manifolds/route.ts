import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_MANIFOLDS = {
  manifolds: [
    {
      manifold_id: "SPIN7-JOYCE-TORUS-01",
      classification: "Compact 8D Joyce Spin(7) Orbifold T^8 / Gamma_8",
      betti_b4_plus: 206,
      betti_b4_minus: 35,
      cayley_volume: 15.70796,
      base_calibration_fidelity_pct: 99.9995,
      status: "SPIN7_HOLONOMY_LOCKED",
    },
    {
      manifold_id: "SPIN7-CALABI-CONE-02",
      classification: "Complete Non-Compact Spin(7) Metric on Calabi Spinor Bundle of S^4",
      betti_b4_plus: 1,
      betti_b4_minus: 0,
      cayley_volume: 31.41593,
      base_calibration_fidelity_pct: 99.9998,
      status: "SPIN7_HOLONOMY_LOCKED",
    },
    {
      manifold_id: "SPIN7-ASYMPTOTIC-CONICAL-03",
      classification: "Asymptotically Locally Euclidean (ALE) Spin(7) Instanton Moduli Shield",
      betti_b4_plus: 3,
      betti_b4_minus: 1,
      cayley_volume: 62.83185,
      base_calibration_fidelity_pct: 99.9999,
      status: "SPIN7_HOLONOMY_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/spin7-cayley-shield/manifolds`,
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
