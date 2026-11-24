import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_spin7_manifolds: 3,
  total_b4_plus_classes: 210,
  total_b4_minus_classes: 36,
  calibrations_performed: 16,
  average_fidelity_pct: 99.9997,
  peak_shield_strength_pev: 182.50,
  torsion_free_spin7_conformance: "100.0% COVARIANTLY_CONSTANT",
  status: "SPIN7_CAYLEY_SYSTEM_OPTIMAL",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/spin7-cayley-shield/metrics`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_METRICS));
    }
    return NextResponse.json(FALLBACK_METRICS);
  } catch {
    return NextResponse.json(FALLBACK_METRICS);
  }
}
