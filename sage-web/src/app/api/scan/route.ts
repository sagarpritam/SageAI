import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Redis } from "@upstash/redis";
import {
  decodeJwtPayload,
  isStandaloneOfflineMode,
  offlineBackendResponse,
  safeJsonBody,
  safeUpstreamJson,
  validateScanTarget,
} from "@/lib/proxy-utils";

let redis: Redis | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv();
  }
} catch {
  console.warn("Upstash Redis is not configured. Skipping fast pre-check.");
}

export async function POST(req: Request) {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in to scan." },
      { status: 401 }
    );
  }

  const claims = decodeJwtPayload(token);
  const userId = typeof claims?.sub === "string" && claims.sub ? claims.sub : "unknown";

  const parsedBody = await safeJsonBody<{ target?: unknown }>(req);
  if (!parsedBody.ok) {
    return parsedBody.response;
  }

  const targetCheck = validateScanTarget(parsedBody.data.target);
  if (!targetCheck.ok) {
    return NextResponse.json({ error: targetCheck.error }, { status: 400 });
  }
  const cleanTarget = targetCheck.url;

  // Optional Redis-based rate limiting (fast pre-check; degrade gracefully if unavailable)
  if (redis) {
    try {
      const isPro = await redis.get(`is_pro:${userId}`);
      if (!isPro) {
        const scanCount = await redis.incr(`scan_count:${userId}`);
        if (scanCount > 3) {
          return NextResponse.json(
            { error: "Free limit reached.", limitReached: true },
            { status: 403 }
          );
        }
      }
    } catch {
      console.warn("Redis rate-limit pre-check failed; deferring to backend.");
    }
  }

  if (isStandaloneOfflineMode()) {
    return offlineBackendResponse(
      "Scan engine backend not configured (set BACKEND_URL on Vercel)"
    );
  }

  try {
    const backendRes = await fetch(`${backendUrl}/scan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ target: cleanTarget }),
      signal: AbortSignal.timeout(10000),
    });

    // Relay 402 Payment Required from backend
    if (backendRes.status === 402) {
      const err = await safeUpstreamJson<{ detail?: string }>(backendRes, {});
      return NextResponse.json(
        { error: err.detail || "Scan limit reached.", limitReached: true },
        { status: 402 }
      );
    }

    const data = await safeUpstreamJson(backendRes, {
      error: "Invalid response from scan service",
    });
    return NextResponse.json(data, { status: backendRes.status });
  } catch {
    return offlineBackendResponse("Failed to connect to scan engine service");
  }
}
