"use client";

import React, { useEffect, useState } from "react";
import { Shield, Compass, Activity, Lock } from "lucide-react";

interface ModularCurve {
  curve_id: string;
  name: string;
  conductor_level: number;
  q_expansion_defect: number;
  shimura_barrier_strength_pev: number;
  eigenform_suppression_db: number;
  status: string;
}

interface ModularEvaluation {
  curve_id: string;
  status: string;
  q_expansion_defect: number;
  eigenform_verified: boolean;
  level_n: number;
  q_truncation_order: number;
  shimura_barrier_strength_pev: number;
  eigenform_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: string;
}

interface ModularMetrics {
  active_curves_count: number;
  evaluations_total: number;
  mean_barrier_strength_pev: number;
  mean_eigenform_suppression_db: number;
  modular_parametrization_compliance_pct: number;
}

export function ShimuraTaniyamaStudio() {
  const [curves, setCurves] = useState<ModularCurve[]>([]);
  const [metrics, setMetrics] = useState<ModularMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("SHIMURA-X0-11-ELLIPTIC-01");
  const [evaluation, setEvaluation] = useState<ModularEvaluation | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [cRes, mRes] = await Promise.all([
        fetch("/api/shimura-taniyama-modular/curves"),
        fetch("/api/shimura-taniyama-modular/metrics"),
      ]);
      if (cRes.ok) {
        const d = await cRes.json();
        setCurves(d.curves || []);
      }
      if (mRes.ok) {
        setMetrics(await mRes.json());
      }
    } catch {
      // fallback handled by API
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "/api/shimura-taniyama-modular/evaluate-modular-parametrization",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            curve_id: selectedId,
            level_n: 11,
            q_truncation_order: 8,
            barrier_gain: 1.25,
          }),
        }
      );
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
              Shimura-Taniyama Modular Parametrization & Eigenform Barrier (Cap 216)
            </h2>
            <p className="text-sm text-slate-400">
              Wave 65 — Weight-2 Cusp Eigenforms, Heegner Points & X_0(N) Modularity
            </p>
          </div>
        </div>
        <button
          onClick={handleEvaluate}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? "Evaluating Eigenform..." : "Evaluate Modular Parametrization"}
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Active Curves</div>
            <div className="text-2xl font-bold text-indigo-400 mt-1">{metrics.active_curves_count}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Evaluations</div>
            <div className="text-2xl font-bold text-white mt-1">{metrics.evaluations_total}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Mean Suppression</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">
              {metrics.mean_eigenform_suppression_db} dB
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Compliance</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {metrics.modular_parametrization_compliance_pct}%
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {curves.map((c) => (
          <button
            key={c.curve_id}
            onClick={() => setSelectedId(c.curve_id)}
            className={`text-left p-4 rounded-xl border transition ${
              selectedId === c.curve_id
                ? "bg-indigo-950/40 border-indigo-500/60"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-indigo-400">{c.curve_id}</span>
              <Lock className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-sm font-semibold text-white mt-2">{c.name}</div>
            <div className="text-xs text-slate-400 mt-1">Conductor Level N={c.conductor_level}</div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
              <span>{c.eigenform_suppression_db} dB</span>
              <span className="text-indigo-400">{c.status}</span>
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
                {evaluation.curve_id} — {evaluation.status}
              </div>
              <div className="text-xs text-slate-400">
                Suppression: {evaluation.eigenform_suppression_db} dB | Fidelity:{" "}
                {evaluation.effective_fidelity_pct}%
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-300">
            <Activity className="w-4 h-4" />
            <span>q-Defect: {evaluation.q_expansion_defect}</span>
          </div>
        </div>
      )}
    </div>
  );
}
