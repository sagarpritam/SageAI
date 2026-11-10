import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const res = await fetch(`${BACKEND}/reports/${encodeURIComponent(id)}/hackerone`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "HackerOne report generation failed" },
        { status: res.status }
      );
    }

    const mdBuffer = await res.arrayBuffer();
    const safePrefix = id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 8) || "scan";
    return new NextResponse(mdBuffer, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": `attachment; filename="hackerone-${safePrefix}.md"`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to connect to report service",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 502 }
    );
  }
}
