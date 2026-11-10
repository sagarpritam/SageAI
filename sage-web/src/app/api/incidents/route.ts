import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchBackend, safeJsonBody, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetchBackend(`${BACKEND}/incidents`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await safeUpstreamJson(res, {
      error: "Invalid response from incident service",
    });
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch incidents" },
      { status: 502 }
    );
  }
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await safeJsonBody(req);
  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const res = await fetchBackend(`${BACKEND}/incidents/ingest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsed.data),
    });

    const data = await safeUpstreamJson(res, {
      error: "Invalid response from incident service",
    });
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to ingest incident" },
      { status: 502 }
    );
  }
}

