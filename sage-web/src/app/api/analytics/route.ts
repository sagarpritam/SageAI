import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch org stats and recent scans in parallel
  const [statsRes, scansRes] = await Promise.all([
    fetch(`${BACKEND}/org/stats`, { headers: { Authorization: `Bearer ${token}` } }),
    fetch(`${BACKEND}/scans`, { headers: { Authorization: `Bearer ${token}` } }),
  ]);

  const stats = statsRes.ok ? await statsRes.json() : {};
  const scans = scansRes.ok ? await scansRes.json() : [];

  // Build scan trend (last 7 days)
  interface ScanRecord {
    created_at?: string;
    status: string;
    risk_score?: number;
    risk_level?: string;
  }
  const now = new Date();
  const trend: { date: string; count: number; avgRisk: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayScans = scans.filter((s: ScanRecord) =>
      s.created_at?.startsWith(dateStr) && s.status === "completed"
    );
    const avg = dayScans.length
      ? Math.round(dayScans.reduce((a: number, s: ScanRecord) => a + (s.risk_score || 0), 0) / dayScans.length)
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
    totalCompleted: scans.filter((s: ScanRecord) => s.status === "completed").length,
  });
}
