import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchBackend, safeJsonBody, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await safeJsonBody(req);
  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const res = await fetchBackend(`${BACKEND}/deep-analysis/audit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(parsed.data),
    }, 45000);

    if (res.ok) {
      const data = await safeUpstreamJson(res, {});
      return NextResponse.json(data);
    }
    const errData = await safeUpstreamJson(res, {});
    return NextResponse.json(errData, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to run deep attack analysis" },
      { status: 502 }
    );
  }
}

