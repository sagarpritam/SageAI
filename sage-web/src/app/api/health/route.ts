import { NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/health`, {
      cache: "no-store",
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
      version: data.version || "2.0.0",
      environment: data.environment || "development",
    });
  } catch {
    return NextResponse.json({
      api: "unreachable",
      database: "unknown",
      database_latency_ms: 0,
      database_pool: null,
      scan_queue: 0,
      uptime_seconds: 0,
    });
  }
}
