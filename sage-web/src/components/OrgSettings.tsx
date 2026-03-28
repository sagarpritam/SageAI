"use client";

import { useState, useEffect } from "react";
import { Building2, BarChart3, Crown } from "lucide-react";
import axios from "axios";

interface PlanInfo {
  organization: string;
  plan: string;
  plan_details: Record<string, unknown>;
  usage: { scans_used: number; users_count: number };
}

export function OrgSettings() {
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get("/api/org?action=plan").catch(() => null),
      axios.get("/api/org?action=stats").catch(() => null),
    ]).then(([p, s]) => {
      if (p?.data) setPlan(p.data);
      if (s?.data) setStats(s.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-zinc-500 font-mono text-sm animate-pulse">Loading organization info...</p>;

  return (
    <div className="space-y-6">
      {/* Org Info */}
      <div className="bg-zinc-900/60 border border-emerald-900/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">{plan?.organization || "Your Organization"}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-black/30 rounded-lg p-4 text-center">
            <Crown className={`w-6 h-6 mx-auto mb-2 ${plan?.plan === "pro" ? "text-amber-400" : "text-zinc-500"}`} />
            <p className="text-sm font-bold text-white uppercase">{plan?.plan || "free"}</p>
            <p className="text-xs text-zinc-500">Current Plan</p>
          </div>
          <div className="bg-black/30 rounded-lg p-4 text-center">
            <p className="text-2xl font-black text-emerald-400">{plan?.usage?.scans_used ?? 0}</p>
            <p className="text-xs text-zinc-500">Total Scans</p>
          </div>
          <div className="bg-black/30 rounded-lg p-4 text-center">
            <p className="text-2xl font-black text-emerald-400">{plan?.usage?.users_count ?? 0}</p>
            <p className="text-xs text-zinc-500">Team Members</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-sm font-bold text-zinc-400 flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-emerald-400" /> Risk Distribution
          </h3>
          <div className="flex gap-3 flex-wrap">
            {Object.entries((stats.risk_distribution as Record<string, number>) || {}).map(([level, count]) => (
              <div key={level} className={`px-3 py-2 rounded-lg text-sm font-bold ${
                level === "critical" ? "bg-red-900/40 text-red-400" :
                level === "high" ? "bg-orange-900/40 text-orange-400" :
                level === "medium" ? "bg-amber-900/40 text-amber-400" :
                "bg-emerald-900/40 text-emerald-400"
              }`}>
                {level}: {count}
              </div>
            ))}
            {!stats.risk_distribution || Object.keys(stats.risk_distribution as object).length === 0 && (
              <p className="text-zinc-600 text-xs font-mono">No completed scans yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Upgrade CTA / Billing */}
      {plan?.plan !== "pro" && plan?.plan !== "enterprise" ? (
        <a href="/pricing" className="block bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 rounded-xl p-5 text-center transition-all">
          <p className="text-lg font-black text-white">Upgrade to Pro</p>
          <p className="text-sm text-emerald-200/80">Unlock unlimited scans, PDF Reports, Intel Hub, and Auto-Fix.</p>
        </a>
      ) : (
        <button 
          onClick={async () => {
             const res = await fetch('/api/billing/portal', { method: 'POST' });
             if (res.ok) {
                const data = await res.json();
                if (data.portal_url) window.location.href = data.portal_url;
             } else {
                alert("Failed to open billing portal. Contact support.");
             }
          }}
          className="w-full mt-4 block bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl p-4 text-center transition-all font-bold text-white shadow-sm"
        >
          Manage Billing (Stripe Portal)
        </button>
      )}
    </div>
  );
}
