"use client";

import { useState, useEffect } from "react";
import { ScrollText, Loader2, ShieldCheck, LogIn, Scan, Key, UserCog } from "lucide-react";
import axios from "axios";

interface AuditEntry {
  id: string | number;
  action: string;
  actor_email?: string;
  user_id?: string | null;
  details: string | Record<string, unknown> | null;
  created_at: string | null;
}

const actionIcons: Record<string, typeof LogIn> = {
  login: LogIn,
  scan_started: Scan,
  scan_completed: ShieldCheck,
  role_change: UserCog,
  api_key_created: Key,
  api_key_revoked: Key,
  mfa_enabled: ShieldCheck,
  mfa_disabled: ShieldCheck,
};

const actionColors: Record<string, string> = {
  login: "text-blue-400 bg-blue-400/10",
  scan_started: "text-emerald-400 bg-emerald-400/10",
  scan_completed: "text-emerald-400 bg-emerald-400/10",
  role_change: "text-amber-400 bg-amber-400/10",
  api_key_created: "text-purple-400 bg-purple-400/10",
  api_key_revoked: "text-red-400 bg-red-400/10",
  mfa_enabled: "text-emerald-400 bg-emerald-400/10",
  mfa_disabled: "text-red-400 bg-red-400/10",
};

export function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get("/api/audit");
        setEntries(Array.isArray(data) ? data : []);
      } catch {
        setError("Unable to load audit log. This feature requires admin privileges.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <ScrollText className="w-5 h-5 text-emerald-400" />
        <h3 className="text-sm font-bold text-white">Organization Activity</h3>
      </div>

      {error && (
        <div
          role="alert"
          className="bg-amber-950/30 border border-amber-900/40 rounded-xl p-6 text-center text-amber-400 text-sm"
        >
          {error}
        </div>
      )}

      {!error && entries.length === 0 && (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-8 text-center">
          <ScrollText className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">No activity recorded yet.</p>
        </div>
      )}

      {entries.length > 0 && (
        <div className="bg-zinc-900/60 border border-emerald-900/30 rounded-xl overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto">
            {entries.map((entry) => {
              const Icon = actionIcons[entry.action.toLowerCase()] || ScrollText;
              const color =
                actionColors[entry.action.toLowerCase()] || "text-zinc-400 bg-zinc-400/10";
              const actorLabel = entry.actor_email || entry.user_id || "system";
              const detailsText =
                typeof entry.details === "string"
                  ? entry.details
                  : entry.details && Object.keys(entry.details).length > 0
                    ? JSON.stringify(entry.details)
                    : "No additional details";
              const timestampLabel = entry.created_at
                ? new Date(entry.created_at).toLocaleString()
                : "—";
              return (
                <div
                  key={entry.id}
                  className="flex items-start gap-4 px-5 py-4 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${color} shrink-0 mt-0.5`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-white capitalize">
                        {entry.action.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-zinc-600">•</span>
                      <span className="text-xs text-zinc-500 font-mono truncate">
                        {actorLabel}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 break-words">{detailsText}</p>
                  </div>
                  <span className="text-xs text-zinc-600 font-mono shrink-0 whitespace-nowrap">
                    {timestampLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
