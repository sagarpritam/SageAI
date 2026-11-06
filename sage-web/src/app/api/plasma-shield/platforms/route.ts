import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BACKEND}/plasma-shield/platforms`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

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
        platform_id: "plasma-shield-aegis-orbital-01",
        name: "Aegis-Orbital Megawatt Magnetic Plasma Sentinel",
        orbit_class: "LEO Polar Defense Grid (750 km)",
        power_capacity_mw: 2.5,
        plasma_density_cm3: 1.4e15,
        magnetic_field_tesla: 8.5,
        electron_temp_ev: 18.2,
        status: "PLASMA_CONFINEMENT_READY",
        threats_deflected_count: 0,
      },
      {
        platform_id: "plasma-shield-hyperion-geo-02",
        name: "Hyperion-GEO Strategic High-Altitude Plasma Guard",
        orbit_class: "Geostationary GEO (35,786 km)",
        power_capacity_mw: 5.0,
        plasma_density_cm3: 2.8e15,
        magnetic_field_tesla: 12.0,
        electron_temp_ev: 24.5,
        status: "PLASMA_CONFINEMENT_READY",
        threats_deflected_count: 0,
      },
      {
        platform_id: "plasma-shield-lagrange-l1-03",
        name: "Lagrange Point L1 Deep-Space Solar Ingress Shield",
        orbit_class: "Earth-Sun L1 Halo Orbit (1,500,000 km)",
        power_capacity_mw: 10.0,
        plasma_density_cm3: 4.5e15,
        magnetic_field_tesla: 15.0,
        electron_temp_ev: 32.0,
        status: "PLASMA_CONFINEMENT_READY",
        threats_deflected_count: 0,
      },
    ],
  };
}
