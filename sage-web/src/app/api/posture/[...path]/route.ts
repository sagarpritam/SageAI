import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAllowedPosturePath, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { path } = await params;
  if (!isAllowedPosturePath(path)) {
    return NextResponse.json(
      { error: "Invalid posture endpoint path" },
      { status: 400 }
    );
  }

  const subpath = path.join("/");
  const url = new URL(req.url);
  const queryString = url.searchParams.toString();
  const targetUrl = `${BACKEND}/posture/${subpath}${queryString ? `?${queryString}` : ""}`;

  try {
    const res = await fetch(targetUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const data = await safeUpstreamJson<{ detail?: string }>(res, {
        detail: "Posture request failed",
      });
      return NextResponse.json(
        { error: data.detail || "Posture request failed" },
        { status: res.status }
      );
    }

    const data = await safeUpstreamJson(res, {
      error: "Invalid response from posture service",
    });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to posture service" },
      { status: 502 }
    );
  }
}
