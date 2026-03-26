"use client";

import { useState, useEffect } from "react";
import { Activity, Server, Database, Clock, Loader2, Wifi, WifiOff } from "lucide-react";
import axios from "axios";

interface HealthData {
  api: string;
  database: string;
  scan_queue: number;
  uptime_seconds: number;
}

const formatUptime = (seconds: number) => {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

export function SystemHealth() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const fetchHealth = async () => {
    try {
      const { data } = await axios.get("/api/health");
      setHealth(data);
      setLastCheck(new Date());
    } catch {
      setHealth({ api: "unreachable", database: "unknown", scan_queue: 0, uptime_seconds: 0 });
      setLastCheck(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
      </div>
    );
  }

  const services = [
    {
      label: "API Server",
      status: health?.api || "unknown",
      icon: Server,
      detail: health?.uptime_seconds ? `Uptime: ${formatUptime(health.uptime_seconds)}` : "—",
    },
    {
      label: "Database",
      status: health?.database || "unknown",
      icon: Database,
      detail: health?.database === "healthy" ? "Connected" : "Status unknown",
    },
    {
      label: "Scan Queue",
      status: (health?.scan_queue || 0) > 10 ? "busy" : "healthy",
      icon: Activity,
      detail: `${health?.scan_queue || 0} pending scans`,
    },
  ];

  const statusColor = (s: string) => {
    if (s === "healthy" || s === "connected") return "bg-emerald-500";
    if (s === "busy") return "bg-amber-500";
    return "bg-red-500";
  };

  const statusText = (s: string) => {
    if (s === "healthy" || s === "connected") return "text-emerald-400";
    if (s === "busy") return "text-amber-400";
    return "text-red-400";
  };

  const allHealthy = services.every((s) => s.status === "healthy" || s.status === "connected");

  return (
    <div className="space-y-6">
      {/* Overall Status Banner */}
      <div className={`flex items-center gap-3 p-4 rounded-xl border ${
        allHealthy
          ? "bg-emerald-950/20 border-emerald-900/30"
          : "bg-red-950/20 border-red-900/30"
      }`}>
        {allHealthy ? (
          <Wifi className="w-6 h-6 text-emerald-400" />
        ) : (
          <WifiOff className="w-6 h-6 text-red-400" />
        )}
        <div>
          <p className={`text-sm font-bold ${allHealthy ? "text-emerald-400" : "text-red-400"}`}>
            {allHealthy ? "All Systems Operational" : "Service Degradation Detected"}
          </p>
          <p className="text-xs text-zinc-500">
            Last checked: {lastCheck?.toLocaleTimeString() || "—"}
          </p>
        </div>
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {services.map((svc) => (
          <div key={svc.label} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <svc.icon className="w-5 h-5 text-zinc-500" />
              <span className={`flex items-center gap-1.5 text-xs font-bold capitalize ${statusText(svc.status)}`}>
                <span className={`w-2 h-2 rounded-full ${statusColor(svc.status)} animate-pulse`} />
                {svc.status}
              </span>
            </div>
            <p className="text-sm font-bold text-white">{svc.label}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{svc.detail}</p>
          </div>
        ))}
      </div>

      {/* Refresh */}
      <div className="flex items-center gap-2 text-xs text-zinc-600">
        <Clock className="w-3 h-3" />
        Auto-refreshes every 30 seconds
      </div>
    </div>
  );
}
