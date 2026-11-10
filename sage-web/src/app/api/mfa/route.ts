import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action"); // 'setup', 'verify', or 'disable'

  try {
    if (action === "setup") {
      const res = await fetch(`${BACKEND}/auth/mfa/setup`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({ detail: "MFA setup failed" }));
      return NextResponse.json(data, { status: res.status });
    }

    if (action === "verify" || action === "disable") {
      const body = await req.json().catch(() => ({}));
      const code = typeof body.code === "string" ? body.code.trim() : "";
      if (!code) {
        return NextResponse.json({ error: "MFA code is required" }, { status: 400 });
      }
      const res = await fetch(`${BACKEND}/auth/mfa/${action}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({ detail: "MFA verification failed" }));
      return NextResponse.json(data, { status: res.status });
    }
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to connect to MFA service",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
