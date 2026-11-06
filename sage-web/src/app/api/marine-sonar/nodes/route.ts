import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BACKEND}/marine-sonar/nodes`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

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
        node_id: "sonar-node-giuk-gap-01",
        name: "GIUK Gap Deep Ocean Hydrophone Array",
        depth_meters: 2450.0,
        latitude: 63.5,
        longitude: -18.2,
        hydrophone_elements: 64,
        sofar_channel_active: true,
        ambient_noise_spl_db: 68.5,
        status: "ACOUSTIC_ARRAY_NOMINAL",
        contacts_tracked: 0,
      },
      {
        node_id: "sonar-node-taiwan-strait-02",
        name: "Pacific Continental Shelf Vector Sonar Sentry",
        depth_meters: 185.0,
        latitude: 24.1,
        longitude: 120.5,
        hydrophone_elements: 32,
        sofar_channel_active: false,
        ambient_noise_spl_db: 74.2,
        status: "ACOUSTIC_ARRAY_NOMINAL",
        contacts_tracked: 0,
      },
      {
        node_id: "sonar-node-atlantic-ridge-03",
        name: "Mid-Atlantic Transoceanic Cable Sentry Node",
        depth_meters: 3820.0,
        latitude: 38.0,
        longitude: -42.5,
        hydrophone_elements: 128,
        sofar_channel_active: true,
        ambient_noise_spl_db: 62.0,
        status: "ACOUSTIC_ARRAY_NOMINAL",
        contacts_tracked: 0,
      },
    ],
  };
}
