import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  isStandaloneOfflineMode,
  isValidResourceId,
  offlineBackendResponse,
  safeUpstreamJson,
} from "@/lib/proxy-utils";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidResourceId(id)) {
    return NextResponse.json({ error: "Invalid scan ID" }, { status: 400 });
  }

  if (isStandaloneOfflineMode()) {
    return offlineBackendResponse(
      "Scan status backend not configured (set BACKEND_URL on Vercel)"
    );
  }

  try {
    const backendRes = await fetch(`${backendUrl}/scan/${encodeURIComponent(id)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(8000),
    });

    if (backendRes.status === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await safeUpstreamJson(backendRes, {
      error: "Invalid response from scan service",
    });
    return NextResponse.json(data, { status: backendRes.status });
  } catch {
    return offlineBackendResponse("Failed to connect to scan status service");
  }
}
