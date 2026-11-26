"use client";

import React, { useEffect, useState } from "react";
import { Flame, RefreshCw, ShieldCheck, Layers } from "lucide-react";

interface ClusterRecord {
  cluster_id: string;
  cluster_type: string;
  seed_rank: number;
  mutation_depth: number;
  cluster_state: string;
}

interface FzMetrics {
  active_clusters_count: number;
  evaluations_total: number;
  mean_firewall_strength_pev: number;
  fomin_zelevinsky_compliance_pct: number;
}

interface FzEvalResult {
  cluster_id: string;
  status: string;
  laurent_positivity_verified: boolean;
  fz_firewall_strength_pev: number;
  cluster_algebra_suppression_db: number;
  effective_fidelity_pct: number;
}

export function FominZelevinskyStudio() {
  const [clusters, setClusters] = useState<ClusterRecord[]>([]);
  const [metrics, setMetrics] = useState<FzMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("FOMIN-ZELEVINSKY-CLUSTER-01");
  const [seedRank, setSeedRank] = useState(5);
  const [mutationDepth, setMutationDepth] = useState(4);
  const [firewallGain, setFirewallGain] = useState(1.25);
  const [result, setResult] = useState<FzEvalResult | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [cRes, mRes] = await Promise.all([
        fetch("/api/fomin-zelevinsky-cluster/clusters"),
        fetch("/api/fomin-zelevinsky-cluster/metrics"),
      ]);
      if (cRes.ok) {
        const cData = await cRes.json();
        setClusters(cData.clusters || []);
      }
      if (mRes.ok) {
        setMetrics(await mRes.json());
      }
    } catch (err) {
      console.error("Failed to load Fomin-Zelevinsky telemetry", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/fomin-zelevinsky-cluster/evaluate-cluster-mutation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cluster_id: selectedId,
          seed_rank: seedRank,
          mutation_depth: mutationDepth,
          firewall_gain: firewallGain,
        }),
      });
      if (res.ok) {
        setResult(await res.json());
        await loadData();
      }
    } catch (err) {
      console.error("Fomin-Zelevinsky evaluation failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 rounded-xl border border-rose-500/30 bg-slate-950/80 p-6 text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rose-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-rose-500/20 p-2.5 text-rose-400">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Fomin-Zelevinsky Cluster Algebra &amp; Laurent Phenomenon Firewall
            </h2>
            <p className="text-xs text-slate-400">
              Capability 250 · Exchange Matrix Mutations &amp; Total Positivity Laurent Polynomials
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Clusters
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Cluster Seeds</div>
            <div className="mt-1 text-xl font-bold text-rose-300">{metrics.active_clusters_count}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Laurent Compliance</div>
            <div className="mt-1 text-xl font-bold text-emerald-400">
              {metrics.fomin_zelevinsky_compliance_pct.toFixed(2)}%
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Evaluations</div>
            <div className="mt-1 text-xl font-bold text-white">{metrics.evaluations_total}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Mean Firewall</div>
            <div className="mt-1 text-sm font-semibold text-cyan-300">
              {(metrics.mean_firewall_strength_pev / 1e12).toFixed(2)} TPeV
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-rose-300">
            <Layers className="h-4 w-4" /> Evaluate Cluster Mutation Firewall
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Cluster Seed</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              >
                {clusters.map((c) => (
                  <option key={c.cluster_id} value={c.cluster_id}>
                    {c.cluster_id} ({c.cluster_type})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Seed Rank</label>
              <input
                type="number"
                value={seedRank}
                min={1}
                onChange={(e) => setSeedRank(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Mutation Depth</label>
              <input
                type="number"
                value={mutationDepth}
                min={1}
                onChange={(e) => setMutationDepth(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Firewall Gain</label>
              <input
                type="number"
                step="0.05"
                value={firewallGain}
                onChange={(e) => setFirewallGain(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
          <button
            onClick={handleEvaluate}
            disabled={loading}
            className="w-full rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
          >
            {loading ? "Verifying Laurent Positivity..." : "Lock Fomin-Zelevinsky Cluster Firewall"}
          </button>

          {result && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-emerald-300">
                <ShieldCheck className="h-4 w-4" /> {result.status}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                <span>Firewall: {(result.fz_firewall_strength_pev / 1e12).toFixed(2)} TPeV</span>
                <span>Suppression: {result.cluster_algebra_suppression_db.toFixed(2)} dB</span>
                <span>Fidelity: {result.effective_fidelity_pct.toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="text-sm font-semibold text-rose-300">Cluster Exchange Registry</h3>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {clusters.map((c) => (
              <div
                key={c.cluster_id}
                className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{c.cluster_id}</div>
                  <div className="text-[11px] text-slate-400">
                    {c.cluster_type} · rank={c.seed_rank} · depth={c.mutation_depth}
                  </div>
                </div>
                <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
                  {c.cluster_state}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
