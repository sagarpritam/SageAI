"use client";

import React, { useEffect, useState } from "react";
import { Network, RefreshCw, ShieldCheck, Layers } from "lucide-react";

interface QuiverRecord {
  quiver_id: string;
  dynkin_type: string;
  dimension_vector: string;
  framing_rank: number;
  equivariant_weight: number;
  yangian_level: number;
  stable_envelope_state: string;
}

interface QuiverMetrics {
  active_quivers_count: number;
  total_evaluations: number;
  nakajima_quiver_compliance_pct: number;
  yangian_r_matrix_status: string;
}

interface QuiverEvalResult {
  quiver_id: string;
  status: string;
  stable_envelope_verified: boolean;
  r_matrix_spectral_gap: number;
  yangian_representation_norm: number;
  compliance_pct: number;
  detail: string;
}

export function NakajimaQuiverStudio() {
  const [quivers, setQuivers] = useState<QuiverRecord[]>([]);
  const [metrics, setMetrics] = useState<QuiverMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("NAKAJIMA-QUIVER-ADE-01");
  const [framingRank, setFramingRank] = useState(2);
  const [equivariantWeight, setEquivariantWeight] = useState(3);
  const [shieldGain, setShieldGain] = useState(1.25);
  const [result, setResult] = useState<QuiverEvalResult | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [qRes, mRes] = await Promise.all([
        fetch("/api/nakajima-quiver-yangian/quivers"),
        fetch("/api/nakajima-quiver-yangian/metrics"),
      ]);
      if (qRes.ok) {
        const qData = await qRes.json();
        setQuivers(qData.quivers || []);
      }
      if (mRes.ok) {
        setMetrics(await mRes.json());
      }
    } catch (err) {
      console.error("Failed to load Nakajima Quiver telemetry", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/nakajima-quiver-yangian/evaluate-quiver-yangian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quiver_id: selectedId,
          framing_rank: framingRank,
          equivariant_weight: equivariantWeight,
          shield_gain: shieldGain,
        }),
      });
      if (res.ok) {
        setResult(await res.json());
        await loadData();
      }
    } catch (err) {
      console.error("Nakajima Quiver evaluation failed", err);
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
              Nakajima Quiver Variety &amp; Quantum Loop Yangian Shield
            </h2>
            <p className="text-xs text-slate-400">
              Capability 233 · Maulik-Okounkov Stable Envelopes &amp; Equivariant Cohomology
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Quivers
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Active Quivers</div>
            <div className="mt-1 text-xl font-bold text-indigo-300">{metrics.active_quivers_count}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Yangian Compliance</div>
            <div className="mt-1 text-xl font-bold text-emerald-400">
              {metrics.nakajima_quiver_compliance_pct.toFixed(2)}%
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Total Evaluations</div>
            <div className="mt-1 text-xl font-bold text-white">{metrics.total_evaluations}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">R-Matrix Status</div>
            <div className="mt-1 text-sm font-semibold text-cyan-300">{metrics.yangian_r_matrix_status}</div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-indigo-300">
            <Layers className="h-4 w-4" /> Evaluate Quiver Yangian Shield
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Quiver Variety</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              >
                {quivers.map((q) => (
                  <option key={q.quiver_id} value={q.quiver_id}>
                    {q.quiver_id} ({q.dynkin_type})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Framing Rank (w)</label>
              <input
                type="number"
                value={framingRank}
                min={1}
                max={16}
                onChange={(e) => setFramingRank(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Equivariant Weight (ℏ)</label>
              <input
                type="number"
                value={equivariantWeight}
                min={1}
                max={32}
                onChange={(e) => setEquivariantWeight(Number(e.target.value))}
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
            {loading ? "Locking Stable Envelope..." : "Lock Nakajima Quiver Yangian Shield"}
          </button>

          {result && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-emerald-300">
                <ShieldCheck className="h-4 w-4" /> {result.status}
              </div>
              <div className="mt-1 text-slate-300">{result.detail}</div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                <span>Spectral Gap: {result.r_matrix_spectral_gap.toFixed(4)}</span>
                <span>Rep Norm: {result.yangian_representation_norm.toFixed(4)}</span>
                <span>Compliance: {result.compliance_pct.toFixed(2)}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="text-sm font-semibold text-indigo-300">Registered Quiver Varieties</h3>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {quivers.map((q) => (
              <div
                key={q.quiver_id}
                className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{q.quiver_id}</div>
                  <div className="text-[11px] text-slate-400">
                    Type {q.dynkin_type} · Dim {q.dimension_vector} · Level {q.yangian_level}
                  </div>
                </div>
                <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                  {q.stable_envelope_state}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
