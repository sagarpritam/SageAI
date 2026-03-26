import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const framework = req.nextUrl.searchParams.get("framework") || "soc2";

  const res = await fetch(`${BACKEND}/compliance/report?framework=${framework}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Compliance report generation failed" }, { status: res.status });
  }

  return NextResponse.json(await res.json());
}
