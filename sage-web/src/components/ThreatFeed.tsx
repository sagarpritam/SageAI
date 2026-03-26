"use client";

import { useState, useEffect } from "react";
import { Rss, ExternalLink, Loader2, AlertTriangle, Shield, Info } from "lucide-react";
import axios from "axios";

interface ThreatItem {
  id: string;
  title: string;
  severity: string;
  source: string;
  published: string;
  url: string;
}

const sevColors: Record<string, string> = {
  critical: "bg-red-600 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-black",
  low: "bg-emerald-600 text-white",
};

const sevIcons: Record<string, typeof Shield> = {
  critical: AlertTriangle,
  high: AlertTriangle,
  medium: Info,
  low: Shield,
};

export function ThreatFeed() {
  const [items, setItems] = useState<ThreatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    axios
      .get("/api/threat-feed")
      .then((r) => setItems(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? items : items.filter((i) => i.severity === filter);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Rss className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Threat Intelligence Feed</h3>
          <span className="text-xs text-zinc-500 font-mono">({filtered.length} items)</span>
        </div>
        <div className="flex gap-1.5">
          {["all", "critical", "high", "medium"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all ${
                filter === f
                  ? "bg-emerald-900/40 text-emerald-400 border border-emerald-500/50"
                  : "bg-zinc-800/50 text-zinc-500 border border-zinc-800 hover:text-zinc-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-8 text-center">
          <Shield className="w-8 h-8 text-emerald-400/30 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">No threats matching this filter.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const sev = item.severity?.toLowerCase() || "low";
            const Icon = sevIcons[sev] || Info;
            return (
              <div
                key={item.id}
                className="flex items-start gap-4 bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 hover:border-emerald-900/40 transition-colors"
              >
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 mt-0.5 ${sevColors[sev] || "bg-zinc-700 text-white"}`}>
                  <Icon className="w-3 h-3" /> {item.severity}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">{item.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                    <span className="font-mono">{item.id}</span>
                    <span>•</span>
                    <span>{item.source}</span>
                    <span>•</span>
                    <span>{new Date(item.published).toLocaleDateString()}</span>
                  </div>
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-emerald-400 transition-colors shrink-0"
                  aria-label={`View ${item.id}`}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
