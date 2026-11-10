import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(`${BACKEND}/integrations/github/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return NextResponse.json(await res.json(), { status: res.status });
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { pat } = await req.json();
  if (!pat || typeof pat !== "string" || !pat.trim()) {
    return NextResponse.json({ error: "GitHub PAT is required" }, { status: 400 });
  }

  const res = await fetch(`${BACKEND}/integrations/github/setup`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token: pat.trim() }),
  });
  return NextResponse.json(await res.json(), { status: res.status });
}

export async function DELETE() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(`${BACKEND}/integrations/github/remove`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
