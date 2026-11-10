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

    const res = await fetchBackend(`${BACKEND}/deep-space-laser/terminals`, {
      method: "GET",
      headers,
      cache: "no-store",
    }, 5000);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackTerminals());
  } catch {
    return NextResponse.json(getFallbackTerminals());
  }
}

function getFallbackTerminals() {
  return {
    status: "success",
    terminals: [
      {
        terminal_id: "dsoc-terminal-earth-palomar",
        name: "Palomar 5-Meter Optical Ground Receiver",
        location: "Palomar Observatory, California, USA",
        aperture_m: 5.0,
        laser_power_watts: 500.0,
        wavelength_nm: 1550.0,
        point_ahead_angle_urad: 1.15,
        distance_km: 0.0,
        status: "ASTRONOMICAL_BEAM_LOCKED",
        target_node: "LUNAR_GATEWAY_L1",
        frames_transmitted: 1420,
      },
      {
        terminal_id: "dsoc-terminal-lunar-gateway",
        name: "Lunar Gateway Deep-Space Optical Transceiver",
        location: "Moon Near-Rectilinear Halo Orbit (NRHO)",
        aperture_m: 0.8,
        laser_power_watts: 100.0,
        wavelength_nm: 1550.0,
        point_ahead_angle_urad: 1.22,
        distance_km: 384400.0,
        status: "ASTRONOMICAL_BEAM_LOCKED",
        target_node: "MARS_RECON_ORBITER_01",
        frames_transmitted: 3850,
      },
      {
        terminal_id: "dsoc-terminal-mars-recon-01",
        name: "Mars Reconnaissance DSOC Transponder",
        location: "Mars Areocentric Orbit (Sun-Mars L4/L5)",
        aperture_m: 0.3,
        laser_power_watts: 20.0,
        wavelength_nm: 1550.0,
        point_ahead_angle_urad: 1.08,
        distance_km: 225000000.0,
        status: "ASTRONOMICAL_BEAM_LOCKED",
        target_node: "EARTH_PALOMAR_STATION",
        frames_transmitted: 920,
      },
    ],
  };
}

