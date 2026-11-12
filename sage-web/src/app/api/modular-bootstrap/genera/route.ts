import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  genera: [
    {
      genus_id: "MOD-SL2Z-TORUS-01",
      spectrum: "2D Pure Gravity & Hellerman Spectral Gap (Delta_1 <= c/12)",
      default_central_charge: 24.0,
      default_spin_cutoff: 12,
      base_fidelity_pct: 99.998,
      base_suppression_db: 158.6,
      status: "MODULAR_UNITARITY_LOCKED",
    },
    {
      genus_id: "MOD-MOCK-THETA-02",
      spectrum: "Rademacher Poincare Series & Ramanujan Mock-Theta Moonshine",
      default_central_charge: 48.0,
      default_spin_cutoff: 24,
      base_fidelity_pct: 99.998,
      base_suppression_db: 161.0,
      status: "MODULAR_UNITARITY_LOCKED",
    },
    {
      genus_id: "MOD-CARDY-REGGE-03",
      spectrum: "High-Temperature Cardy Density & Spinless Extremal Functional",
      default_central_charge: 96.0,
      default_spin_cutoff: 36,
      base_fidelity_pct: 99.999,
      base_suppression_db: 163.4,
      status: "MODULAR_UNITARITY_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/modular-bootstrap/genera`,
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

