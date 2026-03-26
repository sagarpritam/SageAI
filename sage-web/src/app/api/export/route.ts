import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const res = await fetch(`${BACKEND}/export`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Export failed" }, { status: res.status });
  }

  const blob = await res.arrayBuffer();
  const contentType = res.headers.get("content-type") || "application/json";
  return new NextResponse(blob, {
    status: 200,
    headers: { "Content-Type": contentType, "Content-Disposition": `attachment; filename="sageai-export.${body.format || "json"}"` },
  });
}
