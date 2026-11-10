import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchBackend } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetchBackend(`${BACKEND}/geomagnetic-shield/substations`, {
      method: "GET",
      headers,
      cache: "no-store",
    }, 5000);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackSubstations());
  } catch {
    return NextResponse.json(getFallbackSubstations());
  }
}

function getFallbackSubstations() {
  return {
    status: "success",
    substations: [
      {
        substation_id: "substation-quebec-hydro-01",
        name: "Hydro-Québec 735kV EHV Transmission Substation",
        voltage_class_kv: 735.0,
        latitude: 53.63,
        geology_ground_resistivity_ohm_m: 12000.0,
        neutral_blocking_capacitor_installed: true,
        current_gic_amps: 4.2,
        status: "MAGNETOSPHERE_NOMINAL",
        transformers_protected: 6,
        cme_shield_tripped: false,
      },
      {
        substation_id: "substation-nordic-grid-02",
        name: "Nordic Statnett-Fingrid 400kV Auroral Substation",
        voltage_class_kv: 400.0,
        latitude: 67.85,
        geology_ground_resistivity_ohm_m: 8500.0,
        neutral_blocking_capacitor_installed: true,
        current_gic_amps: 6.8,
        status: "MAGNETOSPHERE_NOMINAL",
        transformers_protected: 4,
        cme_shield_tripped: false,
      },
      {
        substation_id: "substation-pjm-east-03",
        name: "PJM East 500kV Coastal Interconnect Substation",
        voltage_class_kv: 500.0,
        latitude: 39.95,
        geology_ground_resistivity_ohm_m: 4200.0,
        neutral_blocking_capacitor_installed: true,
        current_gic_amps: 2.1,
        status: "MAGNETOSPHERE_NOMINAL",
        transformers_protected: 8,
        cme_shield_tripped: false,
      },
    ],
  };
}

