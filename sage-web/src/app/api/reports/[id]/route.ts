import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchBackend, isValidResourceId, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!isValidResourceId(id)) {
    return NextResponse.json({ error: "Invalid scan ID" }, { status: 400 });
  }

  try {
    const res = await fetchBackend(`${BACKEND}/reports/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const data = await safeUpstreamJson<{ detail?: string }>(res, {
        detail: "Report generation failed",
      });
      return NextResponse.json(
        { error: data.detail || "Failed" },
        { status: res.status }
      );
    }

    const data = await safeUpstreamJson(res, {
      error: "Invalid response from report service",
    });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to report service" },
      { status: 502 }
    );
  }
}
