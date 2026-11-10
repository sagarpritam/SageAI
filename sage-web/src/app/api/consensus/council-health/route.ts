import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${BACKEND}/consensus/council-health`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await safeUpstreamJson(res, {
      error: "Invalid response from consensus service",
    });
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch AI Council health" },
      { status: 502 }
    );
  }
}

