import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("org_id");
    const targetUrl = orgId
      ? `${BACKEND_URL}/auth/sso/config?org_id=${encodeURIComponent(orgId)}`
      : `${BACKEND_URL}/auth/sso/config`;

    const res = await fetchBackend(targetUrl);
    const data = await safeUpstreamJson(res, {
      error: "Invalid response from SSO service",
    });
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch SSO configuration" },
      { status: 502 }
    );
  }
}

