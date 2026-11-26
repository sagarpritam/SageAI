"use client";

import React, { useEffect, useState } from "react";
import { Shield, Lock, Activity, GitBranch } from "lucide-react";

interface MmpModel {
  model_id: string;
  name: string;
  dimension: number;
  discrepancy_defect: number;
  kollar_shield_strength_pev: number;
  mmp_suppression_db: number;
  status: string;
}

interface MmpEval {
  model_id: string;
  status: string;
  discrepancy_defect: number;
  mmp_suppression_db: number;
  effective_fidelity_pct: number;
}

interface MmpMetrics {
  active_models_count: number;
  evaluations_total: number;
  mean_shield_strength_pev: number;
  mean_mmp_suppression_db: number;
  kollar_birkar_compliance_pct: number;
}

export function KollarBirkarStudio() {
  const [models, setModels] = useState<MmpModel[]>([]);
  const [metrics, setMetrics] = useState<MmpMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("KOLLAR-LOG-CANONICAL-01");
  const [evaluation, setEvaluation] = useState<MmpEval | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [mRes, mtRes] = await Promise.all([
        fetch("/api/kollar-birkar-mmp/models"),
        fetch("/api/kollar-birkar-mmp/metrics"),
      ]);
      if (mRes.ok) {
        const d = await mRes.json();
        setModels(d.models || []);
      }
      if (mtRes.ok) setMetrics(await mtRes.json());
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
      const res = await fetch("/api/kollar-birkar-mmp/evaluate-mmp-threshold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model_id: selectedId, variety_dimension: 3, epsilon_lc: 0.05, shield_gain: 1.25 }),
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
    <div className="space-y-6 p-6 bg-slate-950/60 border border-emerald-500/20 rounded-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <GitBranch className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Kollar-Birkar Minimal Model Program &amp; Log Canonical Shield (Cap 230)
            </h2>
            <p className="text-sm text-slate-400">
              Wave 70 — Log Canonical Thresholds, BAB Fano Boundedness &amp; Mori Contractions
            </p>
          </div>
        </div>
        <button
          onClick={handleEvaluate}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? "Evaluating MMP..." : "Evaluate MMP Threshold"}
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Active Models</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{metrics.active_models_count}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Evaluations</div>
            <div className="text-2xl font-bold text-white mt-1">{metrics.evaluations_total}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Mean Suppression</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">
              {metrics.mean_mmp_suppression_db} dB
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Compliance</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {metrics.kollar_birkar_compliance_pct}%
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {models.map((m) => (
          <button
            key={m.model_id}
            onClick={() => setSelectedId(m.model_id)}
            className={`text-left p-4 rounded-xl border transition ${
              selectedId === m.model_id
                ? "bg-emerald-950/40 border-emerald-500/60"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-400">{m.model_id}</span>
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-sm font-semibold text-white mt-2">{m.name}</div>
            <div className="text-xs text-slate-400 mt-1">Dimension: {m.dimension}</div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
              <span>{m.mmp_suppression_db} dB</span>
              <span className="text-emerald-400">{m.status}</span>
            </div>
          </button>
        ))}
      </div>

      {evaluation && (
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-sm font-semibold text-white">
                {evaluation.model_id} — {evaluation.status}
              </div>
              <div className="text-xs text-slate-400">
                Suppression: {evaluation.mmp_suppression_db} dB | Fidelity:{" "}
                {evaluation.effective_fidelity_pct}%
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-300">
            <Activity className="w-4 h-4" />
            <span>Discrepancy Defect: {evaluation.discrepancy_defect}</span>
          </div>
        </div>
      )}
    </div>
  );
}
