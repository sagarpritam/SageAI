import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchBackend, safeJsonBody, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";
const DEFAULT_EMAIL_CONFIG = {
  recipients: [],
  frequency: "weekly",
  enabled: false,
};

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const res = await fetchBackend(`${BACKEND}/email-reports/config`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return NextResponse.json(DEFAULT_EMAIL_CONFIG);
    const data = await safeUpstreamJson(res, DEFAULT_EMAIL_CONFIG);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(DEFAULT_EMAIL_CONFIG);
  }
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = await safeJsonBody(req);
  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const res = await fetchBackend(`${BACKEND}/email-reports/config`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsed.data),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to save" }, { status: res.status });
    }
    const data = await safeUpstreamJson(res, { ok: true });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to email report service" },
      { status: 502 }
    );
  }
}
