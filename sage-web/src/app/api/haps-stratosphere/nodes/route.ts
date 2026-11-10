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

    const res = await fetchBackend(`${BACKEND}/haps-stratosphere/nodes`, {
      method: "GET",
      headers,
      cache: "no-store",
    }, 5000);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackNodes());
  } catch {
    return NextResponse.json(getFallbackNodes());
  }
}

function getFallbackNodes() {
  return {
    status: "success",
    nodes: [
      {
        node_id: "haps-zephyr-norfolk-01",
        name: "Zephyr-S Sovereign Naval Ingress Sentinel",
        altitude_km: 20.4,
        wingspan_meters: 25.0,
        payload: "Sub-Millimeter Ku-Band SAR + SWIR Multi-Spectral",
        sar_resolution_m: 0.15,
        battery_soc_pct: 88.5,
        optical_isl_active: true,
        status: "STATION_KEEPING_NOMINAL",
        telemetry_frames_downlinked: 2840,
      },
      {
        node_id: "haps-stratobus-malacca-02",
        name: "Stratobus Airship Chokepoint Radar Array",
        altitude_km: 21.2,
        wingspan_meters: 115.0,
        payload: "Conformal Multi-Beam AESA Radar Array",
        sar_resolution_m: 0.20,
        battery_soc_pct: 92.0,
        optical_isl_active: true,
        status: "STATION_KEEPING_NOMINAL",
        telemetry_frames_downlinked: 3910,
      },
      {
        node_id: "haps-aerostar-svalbard-03",
        name: "Aerostar Stratospheric Polar Super-Pressure Mesh",
        altitude_km: 19.8,
        wingspan_meters: 32.0,
        payload: "Sub-Millimeter Inverse SAR + ESM RF Sniffer",
        sar_resolution_m: 0.18,
        battery_soc_pct: 79.4,
        optical_isl_active: true,
        status: "STATION_KEEPING_NOMINAL",
        telemetry_frames_downlinked: 1650,
      },
    ],
  };
}

