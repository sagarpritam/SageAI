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

    const res = await fetchBackend(`${BACKEND}/orbital-debris/platforms`, {
      method: "GET",
      headers,
      cache: "no-store",
    }, 5000);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackPlatforms());
  } catch {
    return NextResponse.json(getFallbackPlatforms());
  }
}

function getFallbackPlatforms() {
  return {
    status: "success",
    platforms: [
      {
        platform_id: "laser-platform-helios-01",
        name: "Helios Spaceborne Pulsed Laser Debris Deflector",
        orbit_class: "LEO Sun-Synchronous (550 km)",
        laser_type: "Pulsed Nd:YAG 1064nm (100 kW average)",
        pulse_energy_kj: 10.0,
        beam_divergence_urad: 1.4,
        status: "ASTRODYNAMIC_FIRE_CONTROL_READY",
        debris_deflected_count: 0,
      },
      {
        platform_id: "laser-platform-aegis-orbital-02",
        name: "Aegis-GEO High-Altitude Optical Debris Broom",
        orbit_class: "Geostationary GEO (35,786 km)",
        laser_type: "High-Repetition Fiber Laser Array (50 kW)",
        pulse_energy_kj: 5.0,
        beam_divergence_urad: 0.8,
        status: "ASTRODYNAMIC_FIRE_CONTROL_READY",
        debris_deflected_count: 0,
      },
      {
        platform_id: "laser-platform-starshield-guard-03",
        name: "Starshield Polar Kinetic Fragment Deflector",
        orbit_class: "LEO Polar Constellation (1,150 km)",
        laser_type: "Pulsed Diode Laser Broom (75 kW)",
        pulse_energy_kj: 7.5,
        beam_divergence_urad: 1.2,
        status: "ASTRODYNAMIC_FIRE_CONTROL_READY",
        debris_deflected_count: 0,
      },
    ],
  };
}

