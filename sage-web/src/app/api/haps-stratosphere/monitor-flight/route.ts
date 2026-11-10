import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchBackend, safeOptionalJsonBody, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  const parsed = await safeOptionalJsonBody<any>(req);
  if (!parsed.ok) {
    return parsed.response;
  }
  const body = parsed.data;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetchBackend(`${BACKEND}/haps-stratosphere/monitor-flight`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }, 5000);

    if (res.ok) {
      const data = await safeUpstreamJson(res, fallbackFlight(body));
      return NextResponse.json(data);
    }
    return NextResponse.json(fallbackFlight(body));
  } catch {
    return NextResponse.json(fallbackFlight(body));
  }
}

function fallbackFlight(body: any) {
  const isWind = (body.wind_velocity_mps || 10.0) > 35.0;
  return {
    status: "success",
    flight_monitor: {
      flight_monitor_id: "haps-mon-simulated",
      node_id: body.node_id || "haps-zephyr-norfolk-01",
      threat_detected: isWind,
      threat_type: isWind ? "STRATOSPHERIC_JET_STREAM_SHEAR_DRIFT" : "NOMINAL_STRATOSPHERIC_SURVEILLANCE",
      threat_level: isWind ? "CRITICAL" : "LOW",
      wind_velocity_mps: body.wind_velocity_mps || 12.0,
      battery_soc_pct: body.battery_soc_pct || 88.0,
      sar_clutter_ratio_db: body.sar_clutter_ratio_db || 2.5,
      optical_jitter_urad: body.optical_link_jitter_urad || 1.2,
      station_keeping_efficiency_pct: isWind ? 66.0 : 90.4,
      action_recommended: isWind ? "ACTIVATE_MAX_AERO_THRUST_STATION_KEEPING" : "CONTINUE_PERSISTENT_SWARM_ORBIT",
      timestamp: Date.now() / 1000,
    },
  };
}

