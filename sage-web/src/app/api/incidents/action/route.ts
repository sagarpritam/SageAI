import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  fetchBackend,
  isValidResourceId,
  safeJsonBody,
  safeUpstreamJson,
} from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await safeJsonBody<{ incident_id?: unknown; action?: unknown }>(req);
  if (!parsed.ok) {
    return parsed.response;
  }

  const { incident_id, action } = parsed.data;
  if (!isValidResourceId(incident_id)) {
    return NextResponse.json({ error: "Invalid incident_id" }, { status: 400 });
  }
  if (typeof action !== "string" || !action.trim()) {
    return NextResponse.json({ error: "Action is required" }, { status: 400 });
  }

  try {
    const res = await fetchBackend(
      `${BACKEND}/incidents/${encodeURIComponent(incident_id)}/action`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: action.trim() }),
      }
    );

    const data = await safeUpstreamJson(res, {
      error: "Invalid response from incident service",
    });
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to execute containment action" },
      { status: 502 }
    );
  }
}
