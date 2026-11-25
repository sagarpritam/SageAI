import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_ARRAYS = {
  arrays: [
    {
      array_id: "SEEBECK-PACIFIC-TRENCH-01",
      location: "Mariana Trench Deep-Crustal Borehole Thermopile Array",
      cmb_depth_km: 2891.0,
      delta_temperature_k: 1250.0,
      seebeck_coefficient_uv_k: 380.0,
      figure_of_merit_zt: 3.2,
      base_conversion_efficiency_pct: 99.52,
      status: "THERMOELECTRIC_CONVERSION_ACTIVE",
    },
    {
      array_id: "SEEBECK-ICELAND-MANTLE-02",
      location: "North Atlantic Mid-Ocean Ridge Deep Mantle Vault",
      cmb_depth_km: 2885.0,
      delta_temperature_k: 1180.0,
      seebeck_coefficient_uv_k: 365.0,
      figure_of_merit_zt: 3.0,
      base_conversion_efficiency_pct: 99.48,
      status: "THERMOELECTRIC_CONVERSION_ACTIVE",
    },
    {
      array_id: "SEEBECK-AFRICAN-RIFT-03",
      location: "East African Rift Superplume Thermopile Channel",
      cmb_depth_km: 2902.0,
      delta_temperature_k: 1220.0,
      seebeck_coefficient_uv_k: 375.0,
      figure_of_merit_zt: 3.1,
      base_conversion_efficiency_pct: 99.55,
      status: "THERMOELECTRIC_CONVERSION_ACTIVE",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/core-mantle-seebeck-supergrid/arrays`, {}, 5000);
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_ARRAYS));
    }
  } catch {
    // Offline fallback
  }
  return NextResponse.json(FALLBACK_ARRAYS, { status: 200 });
}
