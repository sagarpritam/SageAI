import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

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

    const decoys = decoysRes.ok ? await decoysRes.json() : { decoys: [] };
    const alerts = alertsRes.ok ? await alertsRes.json() : { alerts: [] };

    return NextResponse.json({
      decoys: decoys.decoys || [],
      alerts: alerts.alerts || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch deception data", detail: error?.message },
      { status: 502 }
    );
  }
}

