import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchBackend, safeJsonBody, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  const parsed = await safeJsonBody(req);
  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetchBackend(`${BACKEND}/enclave/sanitize-egress`, {
      method: "POST",
      headers,
      body: JSON.stringify(parsed.data),
    });

    if (res.ok) {
      const data = await safeUpstreamJson(res, {});
      return NextResponse.json(data);
    }

    const err = await safeUpstreamJson(res, {});
    return NextResponse.json(err, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Zero egress sanitization failed" },
      { status: 502 }
    );
  }
}

