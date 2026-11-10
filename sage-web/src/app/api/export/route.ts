import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeJsonBody, sanitizeExportFormat } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = await safeJsonBody<{ format?: unknown; type?: unknown }>(req);
  if (!parsed.ok) {
    return parsed.response;
  }

  const safeFormat = sanitizeExportFormat(parsed.data.format);
  if (!safeFormat) {
    return NextResponse.json(
      { error: "Unsupported export format" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`${BACKEND}/export`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...parsed.data, format: safeFormat }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Export failed" }, { status: res.status });
    }

    const blob = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "application/json";
    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="sageai-export.${safeFormat}"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to export service" },
      { status: 502 }
    );
  }
}
