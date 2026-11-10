import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [decoysRes, alertsRes] = await Promise.all([
      fetch(`${BACKEND}/deception/decoys`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${BACKEND}/deception/alerts`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const decoys = decoysRes.ok
      ? await safeUpstreamJson<{ decoys?: unknown[] }>(decoysRes, { decoys: [] })
      : { decoys: [] };
    const alerts = alertsRes.ok
      ? await safeUpstreamJson<{ alerts?: unknown[] }>(alertsRes, { alerts: [] })
      : { alerts: [] };

    return NextResponse.json({
      decoys: decoys.decoys || [],
      alerts: alerts.alerts || [],
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch deception data" },
      { status: 502 }
    );
  }
}

