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

    const res = await fetchBackend(`${BACKEND}/drone-swarm-shield/sites`, {
      method: "GET",
      headers,
      cache: "no-store",
    }, 5000);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackSites());
  } catch {
    return NextResponse.json(getFallbackSites());
  }
}

function getFallbackSites() {
  return {
    status: "success",
    sites: [
      {
        site_id: "site-subsea-landing-bude",
        name: "Cornwall Subsea Cable Landing Station Air-Defense Zone",
        location: "Bude, United Kingdom",
        defense_system: "HPM_HIGH_POWER_MICROWAVE_ARRAY",
        radar_type: "3D_MMWAVE_AESA_RADAR",
        optical_sensors: "DUAL_THERMAL_SWIR_OPTICAL_TURRET",
        coverage_radius_km: 8.5,
        status: "AIRSPACE_SECURED",
        swarms_neutralized: 3,
        rf_jamming_active: false,
      },
      {
        site_id: "site-datacenter-virginia-01",
        name: "Ashburn Sovereign Compute Bunker & AI Enclave",
        location: "Ashburn, Virginia, USA",
        defense_system: "MULTI_BEAM_DIRECTED_ENERGY_LASER",
        radar_type: "SOLID_STATE_C_BAND_RADAR",
        optical_sensors: "HIGH_SPEED_OPTICAL_TRACKER",
        coverage_radius_km: 12.0,
        status: "AIRSPACE_SECURED",
        swarms_neutralized: 5,
        rf_jamming_active: false,
      },
      {
        site_id: "site-substation-grid-austin",
        name: "Texas ERCOT Inter-Grid 500kV Sovereign Substation",
        location: "Austin, Texas, USA",
        defense_system: "HPM_PULSE_AND_RF_DISRUPTOR",
        radar_type: "MICRO_DOPPLER_RADAR_ARRAY",
        optical_sensors: "LONG_RANGE_EO_IR_CAMERAS",
        coverage_radius_km: 6.0,
        status: "AIRSPACE_SECURED",
        swarms_neutralized: 2,
        rf_jamming_active: false,
      },
    ],
  };
}

