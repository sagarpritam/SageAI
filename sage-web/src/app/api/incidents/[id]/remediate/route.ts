import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  isValidResourceId,
  safeOptionalJsonBody,
  safeUpstreamJson,
} from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidResourceId(id)) {
    return NextResponse.json({ error: "Invalid incident ID" }, { status: 400 });
  }

  const parsed = await safeOptionalJsonBody(req);
  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const res = await fetch(
      `${BACKEND}/incidents/${encodeURIComponent(id)}/remediate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(parsed.data),
      }
    );

    const data = await safeUpstreamJson(res, {
      error: "Invalid response from remediation service",
    });
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to dispatch SagePatch remediation" },
      { status: 502 }
    );
  }
}
