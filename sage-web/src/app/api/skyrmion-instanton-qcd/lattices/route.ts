import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  lattices: [
    {
      lattice_id: "BPST-INSTANTON-SU2-01",
      topology: "SU(2) Euclidean BPST Anti-Self-Dual Instanton Liquid (Q=1)",
      default_winding_q: 1,
      default_instanton_size_rho: 0.35,
      default_gauge_coupling: 1.25,
      base_fidelity_pct: 99.997,
      base_suppression_db: 160.8,
      status: "TOPOLOGY_ARMED",
    },
    {
      lattice_id: "CHIRAL-SKYRMION-NET-02",
      topology: "SU(3) Chiral Hedgehog Skyrmion Baryon Lattice (Q=4)",
      default_winding_q: 4,
      default_instanton_size_rho: 0.48,
      default_gauge_coupling: 1.55,
      base_fidelity_pct: 99.998,
      base_suppression_db: 163.3,
      status: "TOPOLOGY_ARMED",
    },
    {
      lattice_id: "CALORON-THETA-VACUUM-03",
      topology: "KvBLL Finite-Temperature Caloron & Peccei-Quinn Theta Vacuum (Q=8)",
      default_winding_q: 8,
      default_instanton_size_rho: 0.62,
      default_gauge_coupling: 1.85,
      base_fidelity_pct: 99.999,
      base_suppression_db: 165.9,
      status: "TOPOLOGY_ARMED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/skyrmion-instanton-qcd/lattices`,
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

