"use client";

import { useState, useEffect, useCallback } from "react";
import { Activity, AlertCircle, AlertTriangle, Info, Shield } from "lucide-react";
import axios from "axios";

interface ASMEvent {
  id: string;
  event_type: string;
  severity: string;
  title: string;
  description?: string;
  created_at?: string;
}

const sevConfig: Record<string, { color: string; icon: typeof AlertCircle }> = {
  critical: { color: "border-red-500 bg-red-950/40 text-red-400", icon: AlertCircle },
  high: { color: "border-orange-500 bg-orange-950/40 text-orange-400", icon: AlertTriangle },
  medium: { color: "border-amber-500 bg-amber-950/40 text-amber-400", icon: AlertTriangle },
  low: { color: "border-blue-500 bg-blue-950/40 text-blue-400", icon: Info },
  info: { color: "border-zinc-600 bg-zinc-900/40 text-zinc-400", icon: Info },
};

export function ASMTimeline() {
  const [events, setEvents] = useState<ASMEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(() => {
    setLoading(true);
    axios
      .get("/api/asm")
      .then((r) => setEvents(Array.isArray(r.data) ? r.data : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setTimeout(() => { fetchEvents(); }, 0);
    const interval = setInterval(fetchEvents, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, [fetchEvents]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-400 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" /> Attack Surface Events
        </h3>
        <span className="text-xs text-zinc-600 font-mono">Auto-refreshes every 30s</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-zinc-900/40 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <Shield className="w-12 h-12 text-zinc-700 mx-auto" />
          <p className="text-zinc-500 font-mono text-sm">No ASM events detected yet.</p>
          <p className="text-xs text-zinc-600">Events will appear here when SageAI discovers changes to your attack surface.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-zinc-800" />

          <div className="space-y-3">
            {events.map((evt) => {
              const cfg = sevConfig[evt.severity] || sevConfig.info;
              const Icon = cfg.icon;
              return (
                <div key={evt.id} className={`relative pl-10 border-l-2 ${cfg.color} rounded-r-lg p-4`}>
                  <div className="absolute left-2 top-4 w-4 h-4 rounded-full bg-zinc-900 border-2 border-current flex items-center justify-center">
                    <Icon className="w-2.5 h-2.5" />
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white">{evt.title}</p>
                      {evt.description && <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{evt.description}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider">{evt.severity}</span>
                      <span className="text-[10px] text-zinc-600 font-mono">
                        {evt.created_at ? new Date(evt.created_at).toLocaleString() : ""}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
