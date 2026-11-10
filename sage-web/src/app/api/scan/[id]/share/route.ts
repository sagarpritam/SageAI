import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isValidResourceId, safeUpstreamJson } from "@/lib/proxy-utils";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidResourceId(id)) {
    return NextResponse.json({ error: "Invalid scan ID" }, { status: 400 });
  }

  try {
    const res = await fetch(`${backendUrl}/scan/${encodeURIComponent(id)}/share`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const data = await safeUpstreamJson<{ detail?: string }>(res, {});
      return NextResponse.json(
        { error: data.detail || "Failed to generate share link" },
        { status: res.status }
      );
    }

    const data = await safeUpstreamJson(res, {
      error: "Invalid response from share service",
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error connecting to backend:", error);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}
