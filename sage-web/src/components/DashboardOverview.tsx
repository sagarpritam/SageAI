"use client";

import { useState, useEffect } from "react";
import { BarChart3, Shield, AlertTriangle, Zap } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { AnalyticsCharts } from "./AnalyticsCharts";

interface ScanSummary {
  id: string;
  target: string;
  status: string;
  risk_score?: number;
  created_at?: string;
}

export function DashboardOverview() {
  const [recentScans, setRecentScans] = useState<ScanSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/scans")
      .then((r) => setRecentScans(r.data.slice(0, 5)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalScans = recentScans.length;
  const avgRisk = totalScans
    ? Math.round(recentScans.reduce((s, r) => s + (r.risk_score || 0), 0) / totalScans)
    : 0;
  const criticalCount = recentScans.filter((s) => (s.risk_score || 0) >= 70).length;

  const cards = [
    { label: "Total Scans", value: totalScans, icon: BarChart3, color: "text-emerald-400" },
    { label: "Avg Risk Score", value: avgRisk, icon: Shield, color: avgRisk >= 70 ? "text-red-400" : avgRisk >= 40 ? "text-amber-400" : "text-emerald-400" },
    { label: "Critical Targets", value: criticalCount, icon: AlertTriangle, color: "text-red-400" },
  ];

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-zinc-900/60 border border-emerald-900/30 rounded-xl p-6 flex items-center gap-4">
            <c.icon className={`w-8 h-8 ${c.color}`} />
            <div>
              <p className="text-3xl font-black text-white">{loading ? "—" : c.value}</p>
              <p className="text-sm text-zinc-400 font-mono">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <AnalyticsCharts />

      {/* Recent Scans */}
      <div>
        <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4" /> Recent Scans
        </h3>
        {loading ? (
          <p className="text-zinc-500 font-mono text-sm animate-pulse">Loading scan history...</p>
        ) : recentScans.length === 0 ? (
          <p className="text-zinc-500 font-mono text-sm">No scans yet. Run your first scan from the homepage.</p>
        ) : (
          <div className="space-y-2">
            {recentScans.map((scan) => (
              <div key={scan.id} className="flex items-center justify-between bg-zinc-900/40 border border-zinc-800 rounded-lg px-4 py-3">
                <div>
                  <p className="text-white font-mono text-sm">{scan.target}</p>
                  <p className="text-xs text-zinc-500">{scan.created_at ? new Date(scan.created_at).toLocaleString() : "—"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    scan.status === "completed" ? "bg-emerald-900/50 text-emerald-400" : "bg-zinc-800 text-zinc-400"
                  }`}>
                    {scan.status}
                  </span>
                  {scan.risk_score !== undefined && (
                    <span className={`text-sm font-black ${
                      scan.risk_score >= 70 ? "text-red-400" : scan.risk_score >= 40 ? "text-amber-400" : "text-emerald-400"
                    }`}>
                      {scan.risk_score}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <Link href="/history" className="text-xs text-emerald-500/60 hover:text-emerald-400 font-mono mt-3 inline-block transition-colors">
          View all scans →
        </Link>
      </div>
    </div>
  );
}
