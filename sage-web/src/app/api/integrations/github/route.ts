import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchBackend, safeJsonBody, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const res = await fetchBackend(`${BACKEND}/integrations/github/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await safeUpstreamJson(res, {
      error: "Invalid response from GitHub integration service",
    });
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to GitHub integration service" },
      { status: 502 }
    );
  }
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = await safeJsonBody<{ pat?: unknown }>(req);
  if (!parsed.ok) {
    return parsed.response;
  }

  const pat = parsed.data.pat;
  if (!pat || typeof pat !== "string" || !pat.trim()) {
    return NextResponse.json({ error: "GitHub PAT is required" }, { status: 400 });
  }

  try {
    const res = await fetchBackend(`${BACKEND}/integrations/github/setup`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: pat.trim() }),
    });
    const data = await safeUpstreamJson(res, {
      error: "Invalid response from GitHub integration service",
    });
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to GitHub integration service" },
      { status: 502 }
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const res = await fetchBackend(`${BACKEND}/integrations/github/remove`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await safeUpstreamJson(res, {
      error: "Invalid response from GitHub integration service",
    });
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to GitHub integration service" },
      { status: 502 }
    );
  }
}
