import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_STATES = {
  states: [
    {
      state_id: "CARDY-ISING-FREE-01",
      classification: "Virasoro Minimal Model M(3,4) Free Boundary Cardy State",
      central_charge_c: 0.5,
      conformal_weight_h: 0.0,
      boundary_entropy_g: 0.7071,
      base_boundary_fidelity_pct: 99.9993,
      status: "CARDY_STATE_STABILIZED",
    },
    {
      state_id: "CARDY-WZW-SU2-02",
      classification: "Affine SU(2)_k Wess-Zumino-Witten D-Brane Cardy State",
      central_charge_c: 1.5,
      conformal_weight_h: 0.25,
      boundary_entropy_g: 1.4142,
      base_boundary_fidelity_pct: 99.9997,
      status: "CARDY_STATE_STABILIZED",
    },
    {
      state_id: "CARDY-LIPKIN-MONSTER-03",
      classification: "Monster CFT c=24 Moonshine Boundary Conformal Membrane",
      central_charge_c: 24.0,
      conformal_weight_h: 2.0,
      boundary_entropy_g: 48.0,
      base_boundary_fidelity_pct: 99.9999,
      status: "CARDY_STATE_STABILIZED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/cardy-boundary-cft/states`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_STATES));
    }
    return NextResponse.json(FALLBACK_STATES);
  } catch {
    return NextResponse.json(FALLBACK_STATES);
  }
}
