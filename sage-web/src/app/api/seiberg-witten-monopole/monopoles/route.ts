import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  monopoles: [
    {
      monopole_id: "SW-K3-SPINC-01",
      classification: "K3 Surface Spin^c Monopole Moduli & Kronheimer-Mrowka Basic Classes",
      default_spinor_rank: 4,
      default_dirac_degree: 6,
      default_moduli_chamber_depth: 8,
      base_unitarity_pct: 99.9987,
      base_suppression_db: 166.4,
      status: "MONOPOLE_MODULI_LOCKED",
    },
    {
      monopole_id: "SW-CP2-BLOWUP-02",
      classification: "CP^2 9-Blowup Elliptic Surface & Wall-Crossing Perturbation Chamber",
      default_spinor_rank: 6,
      default_dirac_degree: 10,
      default_moduli_chamber_depth: 12,
      base_unitarity_pct: 99.9995,
      base_suppression_db: 168.2,
      status: "MONOPOLE_MODULI_LOCKED",
    },
    {
      monopole_id: "SW-MANIFOLD-B2P1-03",
      classification: "Symplectic 4-Manifold b2+=1 Chamber Transition & Taubes Gr=SW Invariant",
      default_spinor_rank: 8,
      default_dirac_degree: 14,
      default_moduli_chamber_depth: 16,
      base_unitarity_pct: 99.9999,
      base_suppression_db: 170.5,
      status: "MONOPOLE_MODULI_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/seiberg-witten-monopole/monopoles`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_DATA));
    }
  } catch {
    // fallback
  }
  return NextResponse.json(FALLBACK_DATA);
}
