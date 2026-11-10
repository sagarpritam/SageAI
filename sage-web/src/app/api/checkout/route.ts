import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

export async function POST() {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetchBackend(
      `${backendUrl}/payments/checkout`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      15000
    );

    if (!res.ok) {
      const err = await safeUpstreamJson<{ detail?: string }>(res, {});
      return NextResponse.json(
        { error: err.detail || "Failed to create checkout session" },
        { status: res.status }
      );
    }

    const data = await safeUpstreamJson(res, {
      error: "Invalid response from checkout service",
    });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Backend unreachable" },
      { status: 502 }
    );
  }
}
