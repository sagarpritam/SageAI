import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  cavities: [
    {
      cavity_id: "SCHWINGER-L5-OPTICAL-01",
      location: "Lagrange L5 Solar-Seeded Breit-Wheeler Cavity Array",
      base_field_ratio_e_ec: 0.86,
      base_recovery_efficiency_pct: 93.8,
      nominal_gross_gw: 195.0,
      status: "PAIR_CASCADE_OPTIMAL",
    },
    {
      cavity_id: "SCHWINGER-CRUSTAL-SUPER-02",
      location: "Sub-Crustal Cryogenic Niobium Super-Cavity (Swiss Alps)",
      base_field_ratio_e_ec: 0.82,
      base_recovery_efficiency_pct: 94.2,
      nominal_gross_gw: 178.0,
      status: "PAIR_CASCADE_OPTIMAL",
    },
    {
      cavity_id: "SCHWINGER-BREIT-WHEELER-03",
      location: "Cis-Lunar Gamma-Seeded Vacuum Deceleration Ring",
      base_field_ratio_e_ec: 0.90,
      base_recovery_efficiency_pct: 93.4,
      nominal_gross_gw: 212.0,
      status: "PAIR_CASCADE_OPTIMAL",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/schwinger-vacuum/cavities`,
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

