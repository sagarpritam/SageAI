import { NextRequest, NextResponse } from "next/server";
import { safeOptionalJsonBody, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  const parsed = await safeOptionalJsonBody(req);
  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/auth/sso/saml/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsed.data),
    });

    const data = await safeUpstreamJson(res, {
      error: "Invalid response from SAML service",
    });
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to initiate SAML login flow" },
      { status: 502 }
    );
  }
}

