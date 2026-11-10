import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const res = await fetch(`${BACKEND}/org/audit-logs`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch audit log" },
        { status: res.status }
      );
    }

    const data = await safeUpstreamJson(res, []);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to audit log service" },
      { status: 502 }
    );
  }
}
