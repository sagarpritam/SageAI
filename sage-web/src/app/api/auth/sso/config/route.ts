import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("org_id");
    const targetUrl = orgId
      ? `${BACKEND_URL}/auth/sso/config?org_id=${encodeURIComponent(orgId)}`
      : `${BACKEND_URL}/auth/sso/config`;

    const res = await fetch(targetUrl);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch SSO configuration", detail: error?.message },
      { status: 502 }
    );
  }
}

