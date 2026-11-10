import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang") || "en";

    const res = await fetch(
      `${BACKEND}/reports/${encodeURIComponent(id)}/debrief?lang=${encodeURIComponent(lang)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json().catch(() => ({
      detail: "Failed to parse multilingual debrief",
    }));
    return NextResponse.json(data, { status: res.status });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: "Failed to generate multilingual debrief",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 502 }
    );
  }
}

