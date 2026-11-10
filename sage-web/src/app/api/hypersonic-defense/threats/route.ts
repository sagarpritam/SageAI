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

    const res = await fetchBackend(`${BACKEND}/hypersonic-defense/threats`, {
      method: "GET",
      headers,
      cache: "no-store",
    }, 5000);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackThreats());
  } catch {
    return NextResponse.json(getFallbackThreats());
  }
}

function getFallbackThreats() {
  return {
    status: "success",
    threats: [
      {
        threat_id: "threat-hgv-glider-avangard",
        name: "Avangard Class Hypersonic Glide Vehicle",
        velocity_mach: 24.5,
        altitude_km: 68.0,
        plasma_density_cm3: 8.5e12,
        cross_range_maneuver: "ATMOSPHERIC_SKIP_GLIDE",
        status: "TRACKING_ACTIVE",
        sensor_fusion: "SBIRS_IR_PLUS_OTHR",
        time_to_impact_sec: 142.0,
        interceptions_count: 0,
      },
      {
        threat_id: "threat-scramjet-zircon-02",
        name: "Scramjet Powered Hypersonic Cruise Missile",
        velocity_mach: 9.2,
        altitude_km: 32.0,
        plasma_density_cm3: 2.1e12,
        cross_range_maneuver: "WEAVING_EVASION",
        status: "TRACKING_ACTIVE",
        sensor_fusion: "AEGIS_SPY6_RADAR",
        time_to_impact_sec: 215.0,
        interceptions_count: 0,
      },
      {
        threat_id: "threat-waverider-glide-03",
        name: "Mach 18 Wedge Waverider Glider",
        velocity_mach: 18.0,
        altitude_km: 55.0,
        plasma_density_cm3: 5.4e12,
        cross_range_maneuver: "S-TURN_DESYNC",
        status: "TRACKING_ACTIVE",
        sensor_fusion: "PWSA_SPACE_TRACKING_LAYER",
        time_to_impact_sec: 180.0,
        interceptions_count: 0,
      },
    ],
  };
}

