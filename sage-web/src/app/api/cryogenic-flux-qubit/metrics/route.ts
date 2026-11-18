import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_METRICS = {
  active_cryo_enclaves: 3,
  total_phase_slip_clamps: 18,
  dilution_base_temperature_mk: 14.8,
  average_confinement_pct: 99.9997,
  peak_attenuation_db: 182.5,
  superconducting_state: "MEISSNER_JOSEPHSON_FLUX_LOCKED",
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/cryogenic-flux-qubit/metrics`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_METRICS));
    }
  } catch {
    // fallback
  }
  return NextResponse.json(FALLBACK_METRICS);
}

