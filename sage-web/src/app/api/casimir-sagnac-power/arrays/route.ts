import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  arrays: [
    {
      array_id: "CAS-SAGNAC-ORBIT-01",
      location: "Equatorial MEO Superconducting Ring-Resonator Array",
      sagnac_beta_rim: 0.38,
      default_pump_mhz: 420.0,
      cavity_q_factor: 6400000.0,
      base_efficiency_pct: 97.12,
      status: "CASIMIR_SAGNAC_LOCKED",
    },
    {
      array_id: "CAS-SAGNAC-CRUST-02",
      location: "Deep-Crustal Granite Niobium Sagnac Toroid Vault",
      sagnac_beta_rim: 0.44,
      default_pump_mhz: 680.0,
      cavity_q_factor: 8900000.0,
      base_efficiency_pct: 97.78,
      status: "CASIMIR_SAGNAC_LOCKED",
    },
    {
      array_id: "CAS-SAGNAC-L2-03",
      location: "Sun-Earth L2 Cryogenic High-Q Casimir Squeezer",
      sagnac_beta_rim: 0.49,
      default_pump_mhz: 960.0,
      cavity_q_factor: 11500000.0,
      base_efficiency_pct: 98.24,
      status: "CASIMIR_SAGNAC_LOCKED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/casimir-sagnac-power/arrays`,
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

