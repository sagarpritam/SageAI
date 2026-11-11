import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  sheaves: [
    {
      sheaf_id: "LANGLANDS-SU3-PSU3-01",
      dual_pair: "G = SU(3) <-> ^L G = PSU(3) over Genus-3 Riemann Surface",
      default_gauge_coupling_g: 1.18,
      default_theta_angle_pi: 0.25,
      base_duality_coherence_pct: 99.997,
      base_hecke_lock_db: 149.2,
      status: "HECKE_EIGENSHEAF_SYNCED",
    },
    {
      sheaf_id: "LANGLANDS-SO5-SP4-02",
      dual_pair: "G = SO(5) <-> ^L G = Sp(4) Symplectic Hitchin Fibration",
      default_gauge_coupling_g: 0.95,
      default_theta_angle_pi: 0.5,
      base_duality_coherence_pct: 99.996,
      base_hecke_lock_db: 150.6,
      status: "HECKE_EIGENSHEAF_SYNCED",
    },
    {
      sheaf_id: "LANGLANDS-G2-SELFDUAL-03",
      dual_pair: "G = G_2 <-> ^L G = G_2 Self-Dual Exceptional Enclave Bundle",
      default_gauge_coupling_g: 1.0,
      default_theta_angle_pi: 0.0,
      base_duality_coherence_pct: 99.998,
      base_hecke_lock_db: 152.4,
      status: "HECKE_EIGENSHEAF_SYNCED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/geometric-langlands/sheaves`,
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

