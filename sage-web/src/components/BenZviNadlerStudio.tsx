"use client";

import React, { useEffect, useState } from "react";
import { Compass, RefreshCw, ShieldCheck, Layers } from "lucide-react";

interface BettiStackRecord {
  stack_id: string;
  spectral_stack: string;
  nilpotent_cone_rank: number;
  singular_support_order: number;
  spectral_state: string;
}

interface BznMetrics {
  active_stacks_count: number;
  evaluations_total: number;
  mean_barrier_strength_pev: number;
  ben_zvi_nadler_compliance_pct: number;
}

interface BznEvalResult {
  stack_id: string;
  status: string;
  nilpotent_singular_support_verified: boolean;
  bzn_barrier_strength_pev: number;
  betti_langlands_suppression_db: number;
  effective_fidelity_pct: number;
}

export function BenZviNadlerStudio() {
  const [stacks, setStacks] = useState<BettiStackRecord[]>([]);
  const [metrics, setMetrics] = useState<BznMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("BENZVI-NADLER-BETTI-01");
  const [nilpotentRank, setNilpotentRank] = useState(3);
  const [supportOrder, setSupportOrder] = useState(2);
  const [barrierGain, setBarrierGain] = useState(1.25);
  const [result, setResult] = useState<BznEvalResult | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [sRes, mRes] = await Promise.all([
        fetch("/api/ben-zvi-nadler-betti/stacks"),
        fetch("/api/ben-zvi-nadler-betti/metrics"),
      ]);
      if (sRes.ok) {
        const sData = await sRes.json();
        setStacks(sData.stacks || []);
      }
      if (mRes.ok) {
        setMetrics(await mRes.json());
      }
    } catch (err) {
      console.error("Failed to load Ben-Zvi-Nadler telemetry", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ben-zvi-nadler-betti/evaluate-betti-langlands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stack_id: selectedId,
          nilpotent_rank: nilpotentRank,
          support_order: supportOrder,
          barrier_gain: barrierGain,
        }),
      });
      if (res.ok) {
        setResult(await res.json());
        await loadData();
      }
    } catch (err) {
      console.error("Ben-Zvi-Nadler evaluation failed", err);
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
              Ben-Zvi-Nadler Spectral Langlands &amp; Betti Stack Barrier
            </h2>
            <p className="text-xs text-slate-400">
              Capability 243 · Nilpotent Singular Support &amp; Betti Character Field Theory
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/20"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Stacks
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Betti Stacks</div>
            <div className="mt-1 text-xl font-bold text-amber-300">{metrics.active_stacks_count}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Betti Compliance</div>
            <div className="mt-1 text-xl font-bold text-emerald-400">
              {metrics.ben_zvi_nadler_compliance_pct.toFixed(2)}%
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
            <Layers className="h-4 w-4" /> Evaluate Betti Langlands Barrier
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Spectral Stack</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              >
                {stacks.map((s) => (
                  <option key={s.stack_id} value={s.stack_id}>
                    {s.stack_id} ({s.spectral_stack})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Nilpotent Cone Rank</label>
              <input
                type="number"
                value={nilpotentRank}
                min={1}
                onChange={(e) => setNilpotentRank(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Singular Support Order</label>
              <input
                type="number"
                value={supportOrder}
                min={1}
                onChange={(e) => setSupportOrder(Number(e.target.value))}
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
            {loading ? "Verifying Nilpotent Support..." : "Lock Ben-Zvi-Nadler Betti Barrier"}
          </button>

          {result && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-emerald-300">
                <ShieldCheck className="h-4 w-4" /> {result.status}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                <span>Barrier: {(result.bzn_barrier_strength_pev / 1e12).toFixed(2)} TPeV</span>
                <span>Suppression: {result.betti_langlands_suppression_db.toFixed(2)} dB</span>
                <span>Fidelity: {result.effective_fidelity_pct.toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="text-sm font-semibold text-amber-300">Betti Spectral Stack Registry</h3>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {stacks.map((s) => (
              <div
                key={s.stack_id}
                className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{s.stack_id}</div>
                  <div className="text-[11px] text-slate-400">
                    {s.spectral_stack} · nilp={s.nilpotent_cone_rank} · supp={s.singular_support_order}
                  </div>
                </div>
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                  {s.spectral_state}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
