import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  isValidResourceId,
  safeJsonBody,
  safeUpstreamJson,
} from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!isValidResourceId(id)) {
    return NextResponse.json({ error: "Invalid patch ID" }, { status: 400 });
  }

  const parsed = await safeJsonBody(req);
  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const res = await fetch(
      `${BACKEND}/autofix/patches/${encodeURIComponent(id)}/reject`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      }
    );
    const data = await safeUpstreamJson(res, {
      error: "Invalid response from autofix service",
    });
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to autofix service" },
      { status: 502 }
    );
  }
}
