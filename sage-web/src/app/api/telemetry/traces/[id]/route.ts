import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchBackend, isValidResourceId, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!isValidResourceId(id)) {
    return NextResponse.json({ error: "Invalid trace ID" }, { status: 400 });
  }

  try {
    const res = await fetchBackend(`${BACKEND}/telemetry/traces/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await safeUpstreamJson(res, {
      error: "Invalid response from telemetry service",
    });
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to telemetry service" },
      { status: 502 }
    );
  }
}
