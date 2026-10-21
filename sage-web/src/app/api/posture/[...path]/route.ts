import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subpath = path.join("/");
  const url = new URL(req.url);
  const queryString = url.searchParams.toString();
  const targetUrl = `${BACKEND}/posture/${subpath}${queryString ? `?${queryString}` : ""}`;

  const res = await fetch(targetUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ detail: "Posture request failed" }));
    return NextResponse.json({ error: data.detail || "Failed" }, { status: res.status });
  }

  return NextResponse.json(await res.json());
}
