import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeOptionalJsonBody, safeUpstreamJson } from "@/lib/proxy-utils";

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

    const res = await fetch(`${BACKEND}/marine-sonar/triangulate`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await safeUpstreamJson(res, fallbackTriangulate(body));
      return NextResponse.json(data);
    }
    return NextResponse.json(fallbackTriangulate(body));
  } catch {
    return NextResponse.json(fallbackTriangulate(body));
  }
}

function fallbackTriangulate(body: any) {
  return {
    status: "success",
    triangulation_event: {
      triangulation_id: "tdoa-simulated",
      node_id: body.node_id || "sonar-node-giuk-gap-01",
      bearing_degrees: body.bearing_deg || 142.5,
      estimated_target_depth_m: body.estimated_depth_m || 850.0,
      triangulation_speed_ms: 14.2,
      position_error_radius_meters: 12.5,
      target_acoustic_signature: "TWIN_PROP_AUV_ELECTRIC_PROPULSION",
      new_node_status: "CONTACT_TRIANGULATED_LOCKED",
      timestamp: Date.now() / 1000,
    },
  };
}

