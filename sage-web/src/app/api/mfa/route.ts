import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action"); // 'setup', 'verify', or 'disable'

  if (action === "setup") {
    const res = await fetch(`${BACKEND}/auth/mfa/setup`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json(await res.json(), { status: res.status });
  }

  const { code } = await req.json();

  if (action === "verify" || action === "disable") {
    const res = await fetch(`${BACKEND}/auth/mfa/${action}?code=${code}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json(await res.json(), { status: res.status });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
