import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const res = await fetch(`${BACKEND}/reports/${encodeURIComponent(id)}/sarif`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const data = await res
        .json()
        .catch(() => ({ detail: "SARIF export failed" }));
      return NextResponse.json(
        { error: data.detail || "SARIF export failed" },
        { status: res.status }
      );
    }

    const sarifBuffer = await res.arrayBuffer();
    const safePrefix = id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 8) || "scan";
    return new NextResponse(sarifBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="SageAI_sarif_${safePrefix}.sarif.json"`,
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

