import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isValidResourceId, safeUpstreamJson } from "@/lib/proxy-utils";

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

  const { id } = await params;
  if (!isValidResourceId(id)) {
    return NextResponse.json({ error: "Invalid scan ID" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("lang") || "en";
  if (!isValidResourceId(lang)) {
    return NextResponse.json({ error: "Invalid language code" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${BACKEND}/reports/${encodeURIComponent(id)}/debrief?lang=${encodeURIComponent(lang)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await safeUpstreamJson(res, {
      detail: "Failed to parse multilingual debrief",
    });
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate multilingual debrief" },
      { status: 502 }
    );
  }
}
