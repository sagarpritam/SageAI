import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ALLOWED_ORG_ROLES,
  isStandaloneOfflineMode,
  isValidResourceId,
  offlineBackendResponse,
  safeJsonBody,
  safeUpstreamJson,
} from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (isStandaloneOfflineMode()) {
    return offlineBackendResponse("Organization service not configured (set BACKEND_URL)");
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") || "plan";

  const endpoints: Record<string, string> = {
    plan: "/org/plan",
    stats: "/org/stats",
    users: "/org/users",
    plans: "/org/plans",
  };

  try {
    const res = await fetch(`${BACKEND}${endpoints[action] || "/org/plan"}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
    });
    const data = await safeUpstreamJson(res, {
      error: "Invalid response from organization service",
    });
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to organization service" },
      { status: 502 }
    );
  }
}

export async function PATCH(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = await safeJsonBody<{ user_id?: unknown; role?: unknown }>(req);
  if (!parsed.ok) {
    return parsed.response;
  }

  const { user_id, role } = parsed.data;
  if (!isValidResourceId(user_id)) {
    return NextResponse.json({ error: "Invalid user_id" }, { status: 400 });
  }
  if (typeof role !== "string" || !ALLOWED_ORG_ROLES.has(role)) {
    return NextResponse.json(
      { error: "Role must be 'admin' or 'member'" },
      { status: 400 }
    );
  }

  if (isStandaloneOfflineMode()) {
    return offlineBackendResponse("Organization service not configured (set BACKEND_URL)");
  }

  try {
    const res = await fetch(
      `${BACKEND}/org/users/${encodeURIComponent(user_id)}/role?role=${encodeURIComponent(role)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(8000),
      }
    );
    const data = await safeUpstreamJson(res, {
      error: "Invalid response from organization service",
    });
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to organization service" },
      { status: 502 }
    );
  }
}
