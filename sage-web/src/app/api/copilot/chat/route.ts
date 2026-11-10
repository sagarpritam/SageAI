import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeJsonBody, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("sageai_jwt")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await safeJsonBody<{ stream?: unknown }>(req);
  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const body = parsed.data;
    const isStream = body.stream !== false; // Default to streaming if not explicitly false

    const backendRes = await fetch(`${BACKEND}/copilot/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...body,
        stream: isStream,
      }),
    });

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: `Backend error: ${backendRes.statusText || backendRes.status}` },
        { status: backendRes.status }
      );
    }

    if (isStream && backendRes.body) {
      // Pipe through the Server-Sent Events stream
      return new Response(backendRes.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // JSON response fallback
    const data = await safeUpstreamJson(backendRes, {
      error: "Invalid response from SageAI Copilot backend",
    });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to SageAI Copilot backend" },
      { status: 502 }
    );
  }
}
