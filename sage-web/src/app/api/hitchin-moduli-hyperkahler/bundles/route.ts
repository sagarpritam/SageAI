import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  bundles: [
    {
      bundle_id: "HITCHIN-SL2C-SIGMA3-01",
      classification: "Genus-3 SL(2,C) Hitchin System & Hyperkahler Twistor Manifold",
      default_genus: 3,
      default_spectral_nodes: 12,
      default_twistor_angle_deg: 18,
      base_unitarity_pct: 99.9977,
      base_suppression_db: 163.1,
      status: "HITCHIN_MODULI_LOCKED",
    },
    {
      bundle_id: "GMN-WALLCROSS-SU3-02",
      classification: "Gaiotto-Moore-Neitzke SU(3) Spectral Network & BPS Wall-Crossing",
      default_genus: 4,
      default_spectral_nodes: 18,
      default_twistor_angle_deg: 24,
      base_unitarity_pct: 99.9986,
      base_suppression_db: 165.1,
      status: "HITCHIN_MODULI_LOCKED",
    },
    {
      bundle_id: "NAHM-POLE-G2-03",
      classification: "Hyperkahler Nahm-Pole Monopole Moduli Bundle",
      default_genus: 5,
      default_spectral_nodes: 24,
      default_twistor_angle_deg: 30,
      base_unitarity_pct: 99.9993,
      base_suppression_db: 167.3,
      status: "HITCHIN_MODULI_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/hitchin-moduli-hyperkahler/bundles`,
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

