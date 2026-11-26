"use client";

import React, { useEffect, useState } from "react";
import { Shield, Compass, Activity, Lock } from "lucide-react";

interface WEntropyFlow {
  flow_id: string;
  name: string;
  manifold_dim: number;
  entropy_defect: number;
  perelman_barrier_strength_pev: number;
  w_entropy_suppression_db: number;
  status: string;
}

interface WEntropyEval {
  flow_id: string;
  status: string;
  entropy_defect: number;
  w_entropy_suppression_db: number;
  effective_fidelity_pct: number;
}

interface WEntropyMetrics {
  active_flows_count: number;
  evaluations_total: number;
  mean_barrier_strength_pev: number;
  mean_w_entropy_suppression_db: number;
  perelman_entropy_compliance_pct: number;
}

export function PerelmanWEntropyStudio() {
  const [flows, setFlows] = useState<WEntropyFlow[]>([]);
  const [metrics, setMetrics] = useState<WEntropyMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("PERELMAN-W-ENTROPY-01");
  const [evaluation, setEvaluation] = useState<WEntropyEval | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [fRes, mRes] = await Promise.all([
        fetch("/api/perelman-w-entropy/flows"),
        fetch("/api/perelman-w-entropy/metrics"),
      ]);
      if (fRes.ok) {
        const d = await fRes.json();
        setFlows(d.flows || []);
      }
      if (mRes.ok) setMetrics(await mRes.json());
    } catch {
      // handled by API fallback
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/perelman-w-entropy/evaluate-w-entropy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flow_id: selectedId, tau_scale: 1.5, kappa_noncollapse: 0.95, barrier_gain: 1.25 }),
      });
      if (res.ok) {
        setEvaluation(await res.json());
        await loadData();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-slate-950/60 border border-indigo-500/20 rounded-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
            <Compass className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Perelman-Hamilton W-Entropy &amp; Geometrization Barrier (Cap 231)
            </h2>
            <p className="text-sm text-slate-400">
              Wave 70 — W-Entropy Monotonicity, Ricci Neckpinch Surgery &amp; Thurston Geometrization
            </p>
          </div>
        </div>
        <button
          onClick={handleEvaluate}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? "Evaluating W-Entropy..." : "Evaluate W-Entropy"}
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Active Flows</div>
            <div className="text-2xl font-bold text-indigo-400 mt-1">{metrics.active_flows_count}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Evaluations</div>
            <div className="text-2xl font-bold text-white mt-1">{metrics.evaluations_total}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Mean Suppression</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">
              {metrics.mean_w_entropy_suppression_db} dB
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Compliance</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {metrics.perelman_entropy_compliance_pct}%
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {flows.map((f) => (
          <button
            key={f.flow_id}
            onClick={() => setSelectedId(f.flow_id)}
            className={`text-left p-4 rounded-xl border transition ${
              selectedId === f.flow_id
                ? "bg-indigo-950/40 border-indigo-500/60"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-indigo-400">{f.flow_id}</span>
              <Lock className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-sm font-semibold text-white mt-2">{f.name}</div>
            <div className="text-xs text-slate-400 mt-1">Manifold Dim: {f.manifold_dim}</div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
              <span>{f.w_entropy_suppression_db} dB</span>
              <span className="text-indigo-400">{f.status}</span>
            </div>
          </button>
        ))}
      </div>

      {evaluation && (
        <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/40 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-indigo-400" />
            <div>
              <div className="text-sm font-semibold text-white">
                {evaluation.flow_id} — {evaluation.status}
              </div>
              <div className="text-xs text-slate-400">
                Suppression: {evaluation.w_entropy_suppression_db} dB | Fidelity:{" "}
                {evaluation.effective_fidelity_pct}%
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-300">
            <Activity className="w-4 h-4" />
            <span>Entropy Defect: {evaluation.entropy_defect}</span>
          </div>
        </div>
      )}
    </div>
  );
}
