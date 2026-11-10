import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchBackend, isValidResourceId, safeUpstreamJson } from "@/lib/proxy-utils";

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
  if (!isValidResourceId(id)) {
    return NextResponse.json({ error: "Invalid CVE identifier" }, { status: 400 });
  }

  try {
    const res = await fetchBackend(`${BACKEND}/rules/cve/${encodeURIComponent(id)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const data = await safeUpstreamJson(res, {});
      return NextResponse.json(data);
    }
    const errData = await safeUpstreamJson(res, {});
    return NextResponse.json(errData, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to synthesize rules for CVE" },
      { status: 502 }
    );
  }
}
