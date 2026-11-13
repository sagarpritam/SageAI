"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  Server,
  RefreshCw,
  AlertOctagon,
  Clock,
  Radio,
  CheckCircle2,
  Trash2,
  Globe,
  AlertTriangle,
} from "lucide-react";

interface IsolationRecord {
  isolation_id: string;
  asset_id: string;
  asset_type: string;
  status: string;
  reason: string;
  redirect_to_honeynet: boolean;
  ttl_minutes: number;
  isolated_at: string;
}

export function SDNShieldStudio() {
  const [isolations, setIsolations] = useState<IsolationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [assetId, setAssetId] = useState("i-0a8f9c1e2b4d5e");
  const [assetType, setAssetType] = useState("AWS_EC2");
  const [reason, setReason] = useState("Autonomous C2 beaconing detected via eBPF");
  const [ttlMinutes, setTtlMinutes] = useState(60);
  const [redirectHoneynet, setRedirectHoneynet] = useState(true);

  const fetchIsolations = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/sdn-shield/isolations");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to load network isolations");
      }
      setIsolations(data.active_isolations || []);
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to load network isolations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIsolations();
  }, []);

  const triggerIsolation = async () => {
    setActionLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/sdn-shield/isolate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset_id: assetId,
          asset_type: assetType,
          reason,
          redirect_to_honeynet: redirectHoneynet,
          ttl_minutes: ttlMinutes,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to trigger network isolation");
      }
      await fetchIsolations();
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to trigger network isolation");
    } finally {
      setActionLoading(false);
    }
  };

  const releaseAsset = async (isoId: string) => {
    setErrorMsg(null);
    try {
      const res = await fetch("/api/sdn-shield/isolate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isolation_id: isoId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to release network asset");
      }
      setIsolations((prev) => prev.filter((i) => i.isolation_id !== isoId));
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to release network asset");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-slate-900 border border-cyan-500/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Autonomous SDN Ephemeral Network Isolation
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                Micro-Shield &lt;45ms SLA
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Sub-second host and container isolation across AWS Security Groups, Azure NSGs, and Kubernetes Calico/Cilium meshes with deceptive honeynet traffic deflection.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-400">Isolation SLA</div>
            <div className="text-sm font-bold text-cyan-400 font-mono">32.4 ms avg</div>
          </div>
          <button
            type="button"
            onClick={fetchIsolations}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="flex items-center justify-between bg-red-950/50 border border-red-500/40 text-red-300 p-4 rounded-xl text-sm"
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-xs text-red-400 hover:text-red-200 underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-cyan-400" />
                Target Host Containment
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                Auto-Enforcement Live
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Asset ID / Pod / Instance</label>
                <input
                  type="text"
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:border-cyan-500 outline-none"
                  placeholder="e.g. i-0a8f9c1e2b4d5e or pod/payment-worker-89f"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Infrastructure Mesh</label>
                  <select
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:border-cyan-500 outline-none"
                  >
                    <option value="AWS_EC2">AWS VPC (Security Group)</option>
                    <option value="KUBERNETES_POD">Kubernetes (Calico/Cilium)</option>
                    <option value="AZURE_VM">Azure NSG (Priority 100)</option>
                    <option value="GCP_COMPUTE">GCP VPC Firewall</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Containment TTL</label>
                  <select
                    value={ttlMinutes}
                    onChange={(e) => setTtlMinutes(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:border-cyan-500 outline-none"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={60}>60 Minutes (Default)</option>
                    <option value={180}>3 Hours</option>
                    <option value={1440}>24 Hours</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Containment Justification</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-xs font-medium text-slate-200">Deceptive Honeynet Redirection</div>
                    <div className="text-[10px] text-slate-500">Route lateral movement traffic into decoy sinkhole</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={redirectHoneynet}
                  onChange={(e) => setRedirectHoneynet(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 h-4 w-4"
                />
              </div>

              <button
                type="button"
                onClick={triggerIsolation}
                disabled={actionLoading}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                {actionLoading ? "Enforcing Micro-Shield..." : "Trigger Ephemeral Quarantine"}
              </button>
            </div>
          </div>
        </div>

        {/* Quarantines List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Active Quarantines ({isolations.length})
              </span>
              <span className="text-xs text-cyan-400 font-mono">Micro-Shield Enforcer: Active</span>
            </div>

            {isolations.length === 0 ? (
              <div className="p-12 text-center rounded-xl bg-slate-950 border border-slate-800/60 text-slate-500 space-y-2">
                <ShieldCheck className="w-8 h-8 mx-auto text-emerald-500/60 mb-2" />
                <p className="text-sm text-slate-400">No active network quarantines.</p>
                <p className="text-xs text-slate-500">All microservices and cloud workloads operating under standard ingress/egress policies.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {isolations.map((iso) => (
                  <div
                    key={iso.isolation_id}
                    className="p-4 rounded-xl bg-slate-950 border border-cyan-500/20 hover:border-cyan-500/40 transition space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-mono font-bold">
                          {iso.status}
                        </span>
                        <span className="text-xs font-mono text-cyan-300 font-bold">{iso.asset_id}</span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">{iso.asset_type}</span>
                    </div>

                    <p className="text-xs text-slate-300">{iso.reason}</p>

                    <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-amber-400">
                          <Clock className="w-3 h-3" />
                          TTL: {iso.ttl_minutes}m
                        </span>
                        {iso.redirect_to_honeynet && (
                          <span className="text-cyan-400">Honeynet Decoy: ACTIVE</span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => releaseAsset(iso.isolation_id)}
                        className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Restore Asset Network
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

