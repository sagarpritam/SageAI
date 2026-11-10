import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeUpstreamJson } from "@/lib/proxy-utils";

export async function GET() {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BACKEND_URL && (process.env.VERCEL === "1" || process.env.CI === "true")) {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }

  try {
    const res = await fetch(`${backendUrl}/scans`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch scans" },
        { status: res.status }
      );
    }

    const data = await safeUpstreamJson(res, []);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Backend unreachable" },
      { status: 502 }
    );
  }
}
