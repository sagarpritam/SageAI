"use client";

import React, { useEffect, useState } from "react";
import { Compass, RefreshCw, ShieldCheck, Layers } from "lucide-react";

interface CrystalRecord {
  crystal_id: string;
  crystal_type: string;
  kashiwara_operators_e_f: number;
  string_cone_dim: number;
  crystal_state: string;
}

interface KashiwaraMetrics {
  active_crystals_count: number;
  evaluations_total: number;
  mean_barrier_strength_pev: number;
  kashiwara_crystal_compliance_pct: number;
}

interface KashiwaraEvalResult {
  crystal_id: string;
  status: string;
  littelmann_path_verified: boolean;
  kashiwara_barrier_strength_pev: number;
  crystal_graph_suppression_db: number;
  effective_fidelity_pct: number;
}

export function KashiwaraCrystalStudio() {
  const [crystals, setCrystals] = useState<CrystalRecord[]>([]);
  const [metrics, setMetrics] = useState<KashiwaraMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("KASHIWARA-CRYSTAL-B-01");
  const [operatorRank, setOperatorRank] = useState(6);
  const [stringConeDim, setStringConeDim] = useState(4);
  const [barrierGain, setBarrierGain] = useState(1.25);
  const [result, setResult] = useState<KashiwaraEvalResult | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [cRes, mRes] = await Promise.all([
        fetch("/api/kashiwara-crystal-graph/crystals"),
        fetch("/api/kashiwara-crystal-graph/metrics"),
      ]);
      if (cRes.ok) {
        const cData = await cRes.json();
        setCrystals(cData.crystals || []);
      }
      if (mRes.ok) {
        setMetrics(await mRes.json());
      }
    } catch (err) {
      console.error("Failed to load Kashiwara telemetry", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/kashiwara-crystal-graph/evaluate-crystal-graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crystal_id: selectedId,
          operator_rank: operatorRank,
          string_cone_dim: stringConeDim,
          barrier_gain: barrierGain,
        }),
      });
      if (res.ok) {
        setResult(await res.json());
        await loadData();
      }
    } catch (err) {
      console.error("Kashiwara evaluation failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 rounded-xl border border-amber-500/30 bg-slate-950/80 p-6 text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-500/20 p-2.5 text-amber-400">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Masaki Kashiwara Crystal Graph &amp; Global Basis Barrier
            </h2>
            <p className="text-xs text-slate-400">
              Capability 249 · Kashiwara Operators e_i / f_i &amp; Littelmann Path String Cones
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/20"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Crystals
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Crystal Graphs</div>
            <div className="mt-1 text-xl font-bold text-amber-300">{metrics.active_crystals_count}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Crystal Compliance</div>
            <div className="mt-1 text-xl font-bold text-emerald-400">
              {metrics.kashiwara_crystal_compliance_pct.toFixed(2)}%
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Evaluations</div>
            <div className="mt-1 text-xl font-bold text-white">{metrics.evaluations_total}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Mean Barrier</div>
            <div className="mt-1 text-sm font-semibold text-cyan-300">
              {(metrics.mean_barrier_strength_pev / 1e12).toFixed(2)} TPeV
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-300">
            <Layers className="h-4 w-4" /> Evaluate Crystal Graph Barrier
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Crystal Graph</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              >
                {crystals.map((c) => (
                  <option key={c.crystal_id} value={c.crystal_id}>
                    {c.crystal_id} ({c.crystal_type})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Operator Rank</label>
              <input
                type="number"
                value={operatorRank}
                min={1}
                onChange={(e) => setOperatorRank(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">String Cone Dim</label>
              <input
                type="number"
                value={stringConeDim}
                min={1}
                onChange={(e) => setStringConeDim(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Barrier Gain</label>
              <input
                type="number"
                step="0.05"
                value={barrierGain}
                onChange={(e) => setBarrierGain(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
          <button
            onClick={handleEvaluate}
            disabled={loading}
            className="w-full rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-500 disabled:opacity-50"
          >
            {loading ? "Verifying Littelmann Path..." : "Lock Kashiwara Crystal Graph Barrier"}
          </button>

          {result && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-emerald-300">
                <ShieldCheck className="h-4 w-4" /> {result.status}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                <span>Barrier: {(result.kashiwara_barrier_strength_pev / 1e12).toFixed(2)} TPeV</span>
                <span>Suppression: {result.crystal_graph_suppression_db.toFixed(2)} dB</span>
                <span>Fidelity: {result.effective_fidelity_pct.toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="text-sm font-semibold text-amber-300">Global Crystal Registry</h3>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {crystals.map((c) => (
              <div
                key={c.crystal_id}
                className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{c.crystal_id}</div>
                  <div className="text-[11px] text-slate-400">
                    {c.crystal_type} · ops={c.kashiwara_operators_e_f} · cone={c.string_cone_dim}
                  </div>
                </div>
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                  {c.crystal_state}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
