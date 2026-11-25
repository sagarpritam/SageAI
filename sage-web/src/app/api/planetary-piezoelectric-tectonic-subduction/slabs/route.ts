import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/planetary-piezoelectric-tectonic-subduction/slabs`, { method: "GET" }, 8000);
    if (res.ok) return NextResponse.json(await safeUpstreamJson(res, { slabs: [] }));
  } catch {
    // Fallback when standalone offline
  }

  return NextResponse.json(
    {
      slabs: [
        {
          slab_id: "SUBDUCTION-CASCADIA-MEGATHRUST-01",
          name: "Cascadia Juan de Fuca Quartz-Olivine Piezo Array 01",
          slab_depth_km: 42.0,
          tremor_frequency_hz: 0.45,
          stress_relief_mpa: 18.4,
          nominal_capacity_gw: 9.200,
          piezo_flux_mw: 804.0,
          subduction_coupling_state: "PIEZO_SUBDUCTION_STRESS_LOCKED",
          piezo_efficiency_pct: 98.2,
        },
        {
          slab_id: "SUBDUCTION-NANKAI-TROUGH-02",
          name: "Nankai Trough Slow-Slip Tremor Harvester 02",
          slab_depth_km: 35.0,
          tremor_frequency_hz: 0.62,
          stress_relief_mpa: 22.1,
          nominal_capacity_gw: 7.400,
          piezo_flux_mw: 647.0,
          subduction_coupling_state: "PIEZO_SUBDUCTION_STRESS_LOCKED",
          piezo_efficiency_pct: 97.8,
        },
        {
          slab_id: "SUBDUCTION-MARIANA-TRENCH-03",
          name: "Mariana Wadati-Benioff Deep Olivine Spinel Array 03",
          slab_depth_km: 110.0,
          tremor_frequency_hz: 0.28,
          stress_relief_mpa: 31.5,
          nominal_capacity_gw: 8.600,
          piezo_flux_mw: 751.0,
          subduction_coupling_state: "PIEZO_SUBDUCTION_STRESS_LOCKED",
          piezo_efficiency_pct: 98.5,
        },
      ],
    },
    { status: 200 }
  );
}
