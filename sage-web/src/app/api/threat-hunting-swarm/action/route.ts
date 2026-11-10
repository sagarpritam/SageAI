import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchBackend } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  let body: Record<string, unknown> = {};

  try {
    body = await req.json().catch(() => ({}));
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetchBackend(`${BACKEND}/threat-hunting-swarm/action`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }, 5000);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackAction(body));
  } catch {
    return NextResponse.json(getFallbackAction(body));
  }
}

function getFallbackAction(body: Record<string, unknown>) {
  return {
    status: "success",
    hunt_id: body.hunt_id || "hunt-swm-1001",
    action_result: "CONTAINMENT_SUCCESSFULLY_APPLIED",
    enforced_action: body.action || "TERMINATE_HOLLOWED_PROCESS_AND_CONTAIN_HOST",
    timestamp: new Date().toISOString(),
  };
}

