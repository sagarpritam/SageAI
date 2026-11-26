"use client";

import React, { useEffect, useState } from "react";
import { Network, RefreshCw, ShieldCheck, Layers } from "lucide-react";

interface KlrAlgebraRecord {
  algebra_id: string;
  lie_type: string;
  highest_weight_rank: number;
  strand_count: number;
  categorification_state: string;
}

interface KlrMetrics {
  active_algebras_count: number;
  evaluations_total: number;
  mean_shield_strength_pev: number;
  webster_klr_compliance_pct: number;
}

interface KlrEvalResult {
  algebra_id: string;
  status: string;
  canonical_basis_verified: boolean;
  klr_shield_strength_pev: number;
  klr_suppression_db: number;
  effective_fidelity_pct: number;
}

export function WebsterKlrStudio() {
  const [algebras, setAlgebras] = useState<KlrAlgebraRecord[]>([]);
  const [metrics, setMetrics] = useState<KlrMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("WEBSTER-KLR-TENSOR-01");
  const [highestWeightRank, setHighestWeightRank] = useState(3);
  const [strandCount, setStrandCount] = useState(6);
  const [shieldGain, setShieldGain] = useState(1.25);
  const [result, setResult] = useState<KlrEvalResult | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [aRes, mRes] = await Promise.all([
        fetch("/api/webster-klr-cat/algebras"),
        fetch("/api/webster-klr-cat/metrics"),
      ]);
      if (aRes.ok) {
        const aData = await aRes.json();
        setAlgebras(aData.algebras || []);
      }
      if (mRes.ok) {
        setMetrics(await mRes.json());
      }
    } catch (err) {
      console.error("Failed to load Webster KLR telemetry", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/webster-klr-cat/evaluate-klr-tensor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          algebra_id: selectedId,
          highest_weight_rank: highestWeightRank,
          strand_count: strandCount,
          shield_gain: shieldGain,
        }),
      });
      if (res.ok) {
        setResult(await res.json());
        await loadData();
      }
    } catch (err) {
      console.error("Webster KLR evaluation failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 rounded-xl border border-indigo-500/30 bg-slate-950/80 p-6 text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-indigo-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-indigo-500/20 p-2.5 text-indigo-400">
            <Network className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Webster-Khovanov-Lauda-Rouquier KLR Categorification Shield
            </h2>
            <p className="text-xs text-slate-400">
              Capability 245 · Quiver Hecke Algebras &amp; Categorified Tensor Product Canonical Bases
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Algebras
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">KLR Algebras</div>
            <div className="mt-1 text-xl font-bold text-indigo-300">{metrics.active_algebras_count}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">KLR Compliance</div>
            <div className="mt-1 text-xl font-bold text-emerald-400">
              {metrics.webster_klr_compliance_pct.toFixed(2)}%
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Evaluations</div>
            <div className="mt-1 text-xl font-bold text-white">{metrics.evaluations_total}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Mean Shield</div>
            <div className="mt-1 text-sm font-semibold text-cyan-300">
              {(metrics.mean_shield_strength_pev / 1e12).toFixed(2)} TPeV
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-indigo-300">
            <Layers className="h-4 w-4" /> Evaluate KLR Tensor Shield
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-slate-400">KLR Algebra</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              >
                {algebras.map((a) => (
                  <option key={a.algebra_id} value={a.algebra_id}>
                    {a.algebra_id} ({a.lie_type})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Highest Weight Rank</label>
              <input
                type="number"
                value={highestWeightRank}
                min={1}
                onChange={(e) => setHighestWeightRank(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Strand Count</label>
              <input
                type="number"
                value={strandCount}
                min={1}
                onChange={(e) => setStrandCount(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Shield Gain</label>
              <input
                type="number"
                step="0.05"
                value={shieldGain}
                onChange={(e) => setShieldGain(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
          <button
            onClick={handleEvaluate}
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? "Locking Canonical Basis..." : "Lock Webster KLR Tensor Shield"}
          </button>

          {result && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-emerald-300">
                <ShieldCheck className="h-4 w-4" /> {result.status}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                <span>Shield: {(result.klr_shield_strength_pev / 1e12).toFixed(2)} TPeV</span>
                <span>Suppression: {result.klr_suppression_db.toFixed(2)} dB</span>
                <span>Fidelity: {result.effective_fidelity_pct.toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="text-sm font-semibold text-indigo-300">Quiver Hecke Registry</h3>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {algebras.map((a) => (
              <div
                key={a.algebra_id}
                className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{a.algebra_id}</div>
                  <div className="text-[11px] text-slate-400">
                    {a.lie_type} · wt={a.highest_weight_rank} · strands={a.strand_count}
                  </div>
                </div>
                <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                  {a.categorification_state}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
