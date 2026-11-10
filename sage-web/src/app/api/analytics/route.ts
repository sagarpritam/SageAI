import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  isStandaloneOfflineMode,
  offlineBackendResponse,
  safeUpstreamJson,
} from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

interface ScanRecord {
  created_at?: string;
  status: string;
  risk_score?: number;
  risk_level?: string;
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (isStandaloneOfflineMode()) {
    return offlineBackendResponse("Analytics backend not configured (set BACKEND_URL)");
  }

  try {
    // Fetch org stats and recent scans in parallel
    const [statsRes, scansRes] = await Promise.all([
      fetch(`${BACKEND}/org/stats`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(8000),
      }),
      fetch(`${BACKEND}/scans`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(8000),
      }),
    ]);

    const stats = statsRes.ok ? await safeUpstreamJson<Record<string, unknown>>(statsRes, {}) : {};
    const rawScans = scansRes.ok ? await safeUpstreamJson<unknown>(scansRes, []) : [];
    const scans: ScanRecord[] = Array.isArray(rawScans) ? (rawScans as ScanRecord[]) : [];

    // Build scan trend (last 7 days)
    const now = new Date();
    const trend: { date: string; count: number; avgRisk: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayScans = scans.filter(
        (s) => s.created_at?.startsWith(dateStr) && s.status === "completed"
      );
      const avg = dayScans.length
        ? Math.round(
            dayScans.reduce((a, s) => a + (s.risk_score || 0), 0) / dayScans.length
          )
        : 0;
      trend.push({ date: dateStr, count: dayScans.length, avgRisk: avg });
    }

    // Severity breakdown
    const severityCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    for (const s of scans) {
      if (s.status === "completed" && s.risk_level) {
        const level = s.risk_level as keyof typeof severityCounts;
        if (level in severityCounts) severityCounts[level]++;
      }
    }

    return NextResponse.json({
      stats,
      trend,
      severityCounts,
      totalCompleted: scans.filter((s) => s.status === "completed").length,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to analytics service" },
      { status: 502 }
    );
  }
}
