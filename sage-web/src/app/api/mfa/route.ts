import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchBackend, safeOptionalJsonBody, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action"); // 'setup', 'verify', or 'disable'

  try {
    if (action === "setup") {
      const res = await fetchBackend(`${BACKEND}/auth/mfa/setup`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await safeUpstreamJson(res, { detail: "MFA setup failed" });
      return NextResponse.json(data, { status: res.status });
    }

    if (action === "verify" || action === "disable") {
      const parsed = await safeOptionalJsonBody<{ code?: unknown }>(req);
      if (!parsed.ok) {
        return parsed.response;
      }
      const code =
        typeof parsed.data.code === "string" ? parsed.data.code.trim() : "";
      if (!code) {
        return NextResponse.json({ error: "MFA code is required" }, { status: 400 });
      }
      const res = await fetchBackend(`${BACKEND}/auth/mfa/${action}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });
      const data = await safeUpstreamJson(res, {
        detail: "MFA verification failed",
      });
      return NextResponse.json(data, { status: res.status });
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to MFA service" },
      { status: 502 }
    );
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
