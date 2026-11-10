import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  isStandaloneOfflineMode,
  isValidResourceId,
  offlineBackendResponse,
  safeJsonBody,
  safeUpstreamJson,
} from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (isStandaloneOfflineMode()) {
    return offlineBackendResponse("Webhook service not configured (set BACKEND_URL)");
  }

  try {
    const res = await fetch(`${BACKEND}/webhooks`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
    });
    const data = await safeUpstreamJson(res, {
      error: "Invalid response from webhook service",
    });
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to webhook service" },
      { status: 502 }
    );
  }
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = await safeJsonBody(req);
  if (!parsed.ok) {
    return parsed.response;
  }

  if (isStandaloneOfflineMode()) {
    return offlineBackendResponse("Webhook service not configured (set BACKEND_URL)");
  }

  try {
    const res = await fetch(`${BACKEND}/webhooks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(8000),
    });
    const data = await safeUpstreamJson(res, {
      error: "Invalid response from webhook service",
    });
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to webhook service" },
      { status: 502 }
    );
  }
}

export async function DELETE(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Missing webhook ID" }, { status: 400 });
  if (!isValidResourceId(id)) {
    return NextResponse.json({ error: "Invalid webhook ID" }, { status: 400 });
  }

  if (isStandaloneOfflineMode()) {
    return offlineBackendResponse("Webhook service not configured (set BACKEND_URL)");
  }

  try {
    const res = await fetch(`${BACKEND}/webhooks/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
    });

    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }
    const data = await safeUpstreamJson(res, {
      error: "Invalid response from webhook service",
    });
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to webhook service" },
      { status: 502 }
    );
  }
}
