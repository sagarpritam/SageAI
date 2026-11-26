"use client";

import React, { useEffect, useState } from "react";
import { Network, RefreshCw, ShieldCheck, Layers } from "lucide-react";

interface CohomologyRecord {
  cohomology_id: string;
  target_variety: string;
  quantum_parameter_q: number;
  equivariant_torus_rank: number;
  stable_envelope_state: string;
}

interface MaulikMetrics {
  active_cohomologies_count: number;
  evaluations_total: number;
  mean_shield_strength_pev: number;
  maulik_okounkov_compliance_pct: number;
}

interface MaulikEvalResult {
  cohomology_id: string;
  status: string;
  baxter_q_operator_verified: boolean;
  maulik_shield_strength_pev: number;
  quantum_cohomology_suppression_db: number;
  effective_fidelity_pct: number;
}

export function MaulikOkounkovStudio() {
  const [cohomologies, setCohomologies] = useState<CohomologyRecord[]>([]);
  const [metrics, setMetrics] = useState<MaulikMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("MAULIK-OKOUNKOV-QC-01");
  const [torusRank, setTorusRank] = useState(4);
  const [quantumDegree, setQuantumDegree] = useState(3);
  const [shieldGain, setShieldGain] = useState(1.25);
  const [result, setResult] = useState<MaulikEvalResult | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [cRes, mRes] = await Promise.all([
        fetch("/api/maulik-okounkov-qc/cohomologies"),
        fetch("/api/maulik-okounkov-qc/metrics"),
      ]);
      if (cRes.ok) {
        const cData = await cRes.json();
        setCohomologies(cData.cohomologies || []);
      }
      if (mRes.ok) {
        setMetrics(await mRes.json());
      }
    } catch (err) {
      console.error("Failed to load Maulik-Okounkov telemetry", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/maulik-okounkov-qc/evaluate-quantum-cohomology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cohomology_id: selectedId,
          torus_rank: torusRank,
          quantum_degree: quantumDegree,
          shield_gain: shieldGain,
        }),
      });
      if (res.ok) {
        setResult(await res.json());
        await loadData();
      }
    } catch (err) {
      console.error("Maulik-Okounkov evaluation failed", err);
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
              Maulik-Okounkov Quantum Cohomology &amp; R-Matrix Stable Envelope Shield
            </h2>
            <p className="text-xs text-slate-400">
              Capability 236 · Baxter Q-Operators &amp; Equivariant Quantum Multiplication
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Cohomologies
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Active Varieties</div>
            <div className="mt-1 text-xl font-bold text-indigo-300">{metrics.active_cohomologies_count}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">MO Compliance</div>
            <div className="mt-1 text-xl font-bold text-emerald-400">
              {metrics.maulik_okounkov_compliance_pct.toFixed(2)}%
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Evaluations</div>
            <div className="mt-1 text-xl font-bold text-white">{metrics.evaluations_total}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Mean Shield (PeV)</div>
            <div className="mt-1 text-sm font-semibold text-cyan-300">
              {(metrics.mean_shield_strength_pev / 1e12).toFixed(2)} TPeV
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-indigo-300">
            <Layers className="h-4 w-4" /> Evaluate Quantum Cohomology Shield
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Target Variety</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              >
                {cohomologies.map((c) => (
                  <option key={c.cohomology_id} value={c.cohomology_id}>
                    {c.cohomology_id} ({c.target_variety})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Torus Rank</label>
              <input
                type="number"
                value={torusRank}
                min={1}
                onChange={(e) => setTorusRank(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Quantum Degree (β)</label>
              <input
                type="number"
                value={quantumDegree}
                min={1}
                onChange={(e) => setQuantumDegree(Number(e.target.value))}
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
            {loading ? "Locking Baxter Q-Operator..." : "Lock Maulik-Okounkov Quantum Shield"}
          </button>

          {result && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-emerald-300">
                <ShieldCheck className="h-4 w-4" /> {result.status}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                <span>Shield: {(result.maulik_shield_strength_pev / 1e12).toFixed(2)} TPeV</span>
                <span>Suppression: {result.quantum_cohomology_suppression_db.toFixed(2)} dB</span>
                <span>Fidelity: {result.effective_fidelity_pct.toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="text-sm font-semibold text-indigo-300">Quantum Cohomology Registry</h3>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {cohomologies.map((c) => (
              <div
                key={c.cohomology_id}
                className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{c.cohomology_id}</div>
                  <div className="text-[11px] text-slate-400">
                    {c.target_variety} · q={c.quantum_parameter_q} · rank {c.equivariant_torus_rank}
                  </div>
                </div>
                <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                  {c.stable_envelope_state}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
