import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (clientIp) {
      headers["X-Forwarded-For"] = clientIp;
    }

    const backendRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    const data = await backendRes.json();
    if (!backendRes.ok) {
      return NextResponse.json({ error: data.detail || "Login failed" }, { status: backendRes.status });
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
