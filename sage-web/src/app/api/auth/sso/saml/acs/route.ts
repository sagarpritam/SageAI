import { NextRequest, NextResponse } from "next/server";
import { apiError, handleRouteError } from "@/lib/api-response";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (clientIp) {
      headers["X-Forwarded-For"] = clientIp;
    }

    const backendRes = await fetch(`${BACKEND_URL}/auth/sso/saml/acs`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await backendRes.json();
    if (!backendRes.ok) {
      return apiError(data.detail || "SAML Authentication failed", backendRes.status);
    }

    const { access_token } = data;

    // Create response and set HttpOnly cookie
    const response = NextResponse.json({ success: true, access_token });
    response.cookies.set("sageai_jwt", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    return handleRouteError(err);
  }
}

