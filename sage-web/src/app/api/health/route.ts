import { NextResponse } from "next/server";
import { PLATFORM_VERSION } from "@/lib/platform";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

function standaloneFallback() {
  return {
    api: "unreachable",
    database: "unknown",
    database_latency_ms: 0,
    database_pool: null,
    scan_queue: 0,
    uptime_seconds: 0,
    version: PLATFORM_VERSION,
    platform_version: PLATFORM_VERSION,
    backend_configured: Boolean(process.env.BACKEND_URL),
    mode: process.env.BACKEND_URL ? "degraded" : "standalone-ui",
    environment: process.env.NODE_ENV || "development",
  };
}

export async function GET() {
  if (!process.env.BACKEND_URL && (process.env.VERCEL === "1" || process.env.CI === "true")) {
    return NextResponse.json(standaloneFallback());
  }

  try {
    const res = await fetch(`${BACKEND}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error("Backend response not ok");
    const data = await res.json();
    return NextResponse.json({
      api: data.status === "healthy" ? "healthy" : "degraded",
      database: data.database || "unknown",
      database_latency_ms: data.database_latency_ms ?? 0,
      database_pool: data.database_pool || null,
      uptime_seconds: 3600,
      scan_queue: 0,
      version: data.version || PLATFORM_VERSION,
      platform_version: PLATFORM_VERSION,
      backend_configured: Boolean(process.env.BACKEND_URL),
      mode: "connected",
      environment: data.environment || process.env.NODE_ENV || "development",
    });
  } catch {
    return NextResponse.json(standaloneFallback());
  }
}
