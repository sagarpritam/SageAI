"use client";

import React, { useState, useEffect } from "react";
import {
  Radio,
  Biohazard,
  ShieldAlert,
  ShieldCheck,
  Plus,
  RefreshCw,
  Zap,
  AlertTriangle,
  Server,
  Layers,
  KeyRound,
  ExternalLink,
  Flame,
  CheckCircle2,
} from "lucide-react";

interface CanaryToken {
  canary_id: string;
  token_type: string;
  ecosystem: string;
  deployment_target: string;
  token_preview: string;
  status: string;
  tripwire_count: number;
  deployed_at: string;
}

export function CanaryFabricCenter() {
  const [canaries, setCanaries] = useState<CanaryToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [tripwireLoading, setTripwireLoading] = useState(false);
  const [latestBreachEvent, setLatestBreachEvent] = useState<any>(null);

  // New Canary Form state
  const [newType, setNewType] = useState("CLOUD_IAM");
  const [newTarget, setNewTarget] = useState("s3://corp-secrets-vault/.env");
  const [newMemo, setNewMemo] = useState("AWS STS Session Token decoy for exfiltration probe");

  const fetchCanaries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/canary-fabric/tokens");
      if (res.ok) {
        const data = await res.json();
        setCanaries(data.canaries || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCanaries();
  }, []);

  const deployToken = async () => {
    setDeploying(true);
    try {
      const res = await fetch("/api/canary-fabric/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token_type: newType,
          deployment_target: newTarget,
          memo: newMemo,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCanaries((prev) => [data.canary, ...prev]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeploying(false);
    }
  };

  const simulateTripwire = async (canaryId: string) => {
    setTripwireLoading(true);
    setLatestBreachEvent(null);
    try {
      const res = await fetch("/api/canary-fabric/tripwire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canary_id: canaryId,
          attacker_ip: "198.51.100.74",
          user_agent: "python-requests/2.31.0 (AdversaryExfiltrationScript)",
          target_service: "AWS STS GetCallerIdentity",
          auto_isolate_host: true,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLatestBreachEvent(data.event);
        setCanaries((prev) =>
          prev.map((c) =>
            c.canary_id === canaryId
              ? { ...c, status: "TRIPWIRE_TRIGGERED_ACTIVE_ALERT", tripwire_count: c.tripwire_count + 1 }
              : c
          )
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTripwireLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-red-950/30 to-slate-900 border border-amber-500/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Dynamic Synthetic Honeytoken &amp; Active Canary Fabric
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                Phase 6.3 &bull; Zero False Positive Tripwires
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Plant high-entropy synthetic bait credentials across AWS Secrets, GitHub repos, databases, and Active Directory with autonomous sub-second SDN quarantine upon access.
            </p>
          </div>
        </div>

        <button
          onClick={fetchCanaries}
          disabled={loading}
          className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Breach Alert Banner */}
      {latestBreachEvent && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/50 space-y-2 animate-pulse font-mono">
          <div className="flex items-center justify-between text-xs font-bold text-red-300">
            <div className="flex items-center gap-2">
              <Biohazard className="w-4 h-4 text-red-400" />
              <span>{latestBreachEvent.alert_severity}</span>
            </div>
            <span className="text-[10px] text-slate-400">{latestBreachEvent.timestamp}</span>
          </div>
          <div className="text-xs text-slate-200">
            Adversary IP: <span className="text-amber-400 font-bold">{latestBreachEvent.attacker_ip}</span> accessed
            honeytoken <span className="text-red-400 font-bold">{latestBreachEvent.canary_id}</span> via{" "}
            <span className="text-cyan-300">{latestBreachEvent.target_service}</span>.
          </div>
          {latestBreachEvent.sdn_containment && (
            <div className="p-2.5 rounded bg-slate-950/80 border border-red-500/30 text-[11px] text-emerald-400 flex items-center justify-between">
              <span>Autonomous Action: SDN Quarantine Enforced ({latestBreachEvent.sdn_containment.isolation_id})</span>
              <span className="text-cyan-400">Honeynet Decoy Redirection Active</span>
            </div>
          )}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Deploy New Honeytoken */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                Synthesize New Honeytoken
              </span>
              <span className="text-xs text-amber-400 font-mono">Autonomous Trap</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Honeytoken Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:border-amber-500 outline-none"
                >
                  <option value="CLOUD_IAM">AWS IAM STS Session Key (ASIA...)</option>
                  <option value="GIT_REPO_SECRET">GitHub Decoy Token (ghp_...)</option>
                  <option value="DATABASE_TABLE">PostgreSQL Synthetic Vault Record</option>
                  <option value="ACTIVE_DIRECTORY_SPN">Active Directory Decoy SPN Account</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Deployment Location / Target</label>
                <input
                  type="text"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:border-amber-500 outline-none"
                  placeholder="e.g., s3://corp-secrets/.env or repo: payments/.env"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Operational Memo</label>
                <input
                  type="text"
                  value={newMemo}
                  onChange={(e) => setNewMemo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:border-amber-500 outline-none"
                />
              </div>

              <button
                onClick={deployToken}
                disabled={deploying}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs transition shadow-lg shadow-amber-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deploying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {deploying ? "Deploying Canary..." : "Plant Synthetic Honeytoken"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Active Canaries & Tripwire Simulators */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Monitored Honeytokens ({canaries.length})
              </span>
              <span className="text-xs text-emerald-400 font-mono">Tripwire Listener Active</span>
            </div>

            <div className="space-y-3">
              {canaries.map((c) => (
                <div
                  key={c.canary_id}
                  className={`p-3.5 rounded-xl border transition space-y-2 ${
                    c.status.includes("TRIPWIRE")
                      ? "bg-red-950/30 border-red-500/40"
                      : "bg-slate-950 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                        {c.token_type}
                      </span>
                      <span className="text-xs font-mono text-slate-200 font-bold">{c.canary_id}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        c.status.includes("TRIPWIRE")
                          ? "bg-red-500/20 text-red-300 font-bold"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400">
                    Target: <span className="text-slate-200">{c.deployment_target}</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    Bait Preview: {c.token_preview}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Tripwire Trips: {c.tripwire_count}
                    </span>
                    <button
                      onClick={() => simulateTripwire(c.canary_id)}
                      disabled={tripwireLoading}
                      className="px-2.5 py-1 rounded bg-red-600/80 hover:bg-red-500 text-white font-mono text-[11px] transition flex items-center gap-1.5"
                    >
                      <Zap className="w-3 h-3" />
                      Simulate Attacker Access
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

