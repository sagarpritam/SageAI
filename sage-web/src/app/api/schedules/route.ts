import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  fetchBackend,
  isValidResourceId,
  safeJsonBody,
  safeUpstreamJson,
} from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const res = await fetchBackend(`${BACKEND}/schedules`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await safeUpstreamJson(res, {
      error: "Invalid response from schedule service",
    });
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to schedule service" },
      { status: 502 }
    );
  }
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = await safeJsonBody<{ target?: unknown; frequency?: unknown }>(req);
  if (!parsed.ok) {
    return parsed.response;
  }

  const target =
    typeof parsed.data.target === "string" ? parsed.data.target.trim() : "";
  if (!target) {
    return NextResponse.json(
      { error: "Schedule target is required" },
      { status: 400 }
    );
  }
  const frequency =
    typeof parsed.data.frequency === "string" && parsed.data.frequency.trim()
      ? parsed.data.frequency.trim()
      : "weekly";

  try {
    const res = await fetchBackend(
      `${BACKEND}/schedules?target=${encodeURIComponent(target)}&frequency=${encodeURIComponent(frequency)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await safeUpstreamJson(res, {
      error: "Invalid response from schedule service",
    });
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to schedule service" },
      { status: 502 }
    );
  }
}

export async function DELETE(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing schedule id" }, { status: 400 });
  if (!isValidResourceId(id)) {
    return NextResponse.json({ error: "Invalid schedule id" }, { status: 400 });
  }

  try {
    const res = await fetchBackend(`${BACKEND}/schedules/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await safeUpstreamJson(res, {
      error: "Invalid response from schedule service",
    });
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to schedule service" },
      { status: 502 }
    );
  }
}
