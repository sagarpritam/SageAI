import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-response";
import { safeJsonBody, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  const parsed = await safeJsonBody(req);
  if (!parsed.ok) {
    return parsed.response;
  }

  if (!process.env.BACKEND_URL && (process.env.VERCEL === "1" || process.env.CI === "true")) {
    return NextResponse.json(
      { error: "SSO authentication backend not configured (set BACKEND_URL on Vercel)" },
      { status: 502 }
    );
  }

  try {
    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (clientIp) {
      headers["X-Forwarded-For"] = clientIp;
    }

    const backendRes = await fetch(`${BACKEND_URL}/auth/sso/saml/acs`, {
      method: "POST",
      headers,
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(8000),
    });

    const data = await safeUpstreamJson<{ detail?: string; access_token?: unknown }>(
      backendRes,
      {}
    );
    if (!backendRes.ok) {
      return apiError(data.detail || "SAML Authentication failed", backendRes.status);
    }

    if (typeof data.access_token !== "string" || !data.access_token) {
      return NextResponse.json(
        { error: "Invalid response from SAML service" },
        { status: 502 }
      );
    }

    const access_token = data.access_token;
    const response = NextResponse.json({ success: true, access_token });
    response.cookies.set("sageai_jwt", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to SAML authentication service" },
      { status: 502 }
    );
  }
}
