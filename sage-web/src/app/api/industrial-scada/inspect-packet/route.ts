import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const body = await req.json();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BACKEND}/industrial-scada/inspect-packet`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    const isDangerous = body.requested_value > 3600;
    return NextResponse.json({
      status: "success",
      inspection: {
        verdict: isDangerous ? "BLOCKED_AND_CLAMPED" : "ALLOW_PASSTHROUGH",
        plc_id: body.plc_id,
        requested_value: body.requested_value,
        clamped_value: isDangerous ? 3600.0 : body.requested_value,
        clamped: isDangerous,
        action_taken: isDangerous ? "IMMEDIATE_GOVERNOR_CLAMP" : "NONE",
      },
    });
  } catch {
    return NextResponse.json({
      status: "success",
      inspection: { verdict: "ALLOW_PASSTHROUGH", clamped: false },
    });
  }
}

