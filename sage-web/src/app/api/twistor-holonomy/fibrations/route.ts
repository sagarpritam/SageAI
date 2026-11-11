import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  fibrations: [
    {
      fibration_id: "TWISTOR-PENROSE-CP3-01",
      sector: "CP^3 Projective Null-Ray Incidence Enclave (Geneva)",
      chern_c1_twistor: 4,
      base_conformal_invariance_pct: 99.998,
      base_null_shear_norm: 1.2e-16,
      status: "TWISTOR_COHOMOLOGY_LOCKED",
    },
    {
      fibration_id: "TWISTOR-KODAIRA-NONLINEAR-02",
      sector: "Kodaira-Spencer H^1(PT_+, O(2)) Non-Linear Graviton Node",
      chern_c1_twistor: 4,
      base_conformal_invariance_pct: 99.997,
      base_null_shear_norm: 1.9e-16,
      status: "TWISTOR_COHOMOLOGY_LOCKED",
    },
    {
      fibration_id: "TWISTOR-AMBITWISTOR-NULL-03",
      sector: "Ward-Sparling Ambitwistor String Holonomy Relay (Cis-Lunar)",
      chern_c1_twistor: 0,
      base_conformal_invariance_pct: 99.999,
      base_null_shear_norm: 8.4e-17,
      status: "TWISTOR_COHOMOLOGY_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/twistor-holonomy/fibrations`,
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

