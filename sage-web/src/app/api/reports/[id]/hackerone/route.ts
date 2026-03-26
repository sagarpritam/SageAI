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

  const res = await fetch(`${BACKEND}/reports/${id}/hackerone`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "HackerOne report generation failed" }, { status: res.status });
  }

  const mdBuffer = await res.arrayBuffer();
  return new NextResponse(mdBuffer, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown",
      "Content-Disposition": `attachment; filename="hackerone-${id.slice(0, 8)}.md"`,
    },
  });
}
