import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json([], { status: 200 });

  try {
    const res = await fetch(`${BACKEND}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return NextResponse.json([], { status: 200 });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const id = searchParams.get("id");

  try {
    if (action === "read" && id && /^\d+$/.test(id)) {
      const res = await fetch(
        `${BACKEND}/notifications/${encodeURIComponent(id)}/read`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json().catch(() => ({ ok: res.ok }));
      return NextResponse.json(data, { status: res.ok ? 200 : res.status });
    }

    if (action === "read-all") {
      const res = await fetch(`${BACKEND}/notifications/read-all`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({ ok: res.ok }));
      return NextResponse.json(data, { status: res.ok ? 200 : res.status });
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to notifications service" },
      { status: 502 }
    );
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
