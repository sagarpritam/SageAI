"use client";

import React, { useEffect, useState } from "react";
import { Shield, Compass, Activity, Lock } from "lucide-react";

interface RibetForm {
  form_id: string;
  name: string;
  minimal_level: number;
  congruence_defect: number;
  ribet_barrier_strength_pev: number;
  level_lowering_suppression_db: number;
  status: string;
}

interface RibetEval {
  form_id: string;
  status: string;
  congruence_defect: number;
  level_lowering_suppression_db: number;
  effective_fidelity_pct: number;
}

interface RibetMetrics {
  active_forms_count: number;
  evaluations_total: number;
  mean_barrier_strength_pev: number;
  mean_level_lowering_suppression_db: number;
  level_lowering_compliance_pct: number;
}

export function RibetLevelLoweringStudio() {
  const [forms, setForms] = useState<RibetForm[]>([]);
  const [metrics, setMetrics] = useState<RibetMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("RIBET-LEVEL-LOWER-P5-01");
  const [evaluation, setEvaluation] = useState<RibetEval | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [fRes, mRes] = await Promise.all([
        fetch("/api/ribet-level-lowering/forms"),
        fetch("/api/ribet-level-lowering/metrics"),
      ]);
      if (fRes.ok) {
        const d = await fRes.json();
        setForms(d.forms || []);
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
      const res = await fetch("/api/ribet-level-lowering/evaluate-level-lowering", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form_id: selectedId, residual_prime_p: 5, serre_weight_k: 2, barrier_gain: 1.25 }),
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
              Ribet Level-Lowering & Serre Modularity Barrier (Cap 219)
            </h2>
            <p className="text-sm text-slate-400">
              Wave 66 — Epsilon Conjecture, Serre Mod-p Modularity & Carayol Congruence
            </p>
          </div>
        </div>
        <button
          onClick={handleEvaluate}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? "Lowering Level..." : "Evaluate Level-Lowering"}
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Active Forms</div>
            <div className="text-2xl font-bold text-indigo-400 mt-1">{metrics.active_forms_count}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Evaluations</div>
            <div className="text-2xl font-bold text-white mt-1">{metrics.evaluations_total}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Mean Suppression</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">
              {metrics.mean_level_lowering_suppression_db} dB
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Compliance</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {metrics.level_lowering_compliance_pct}%
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {forms.map((f) => (
          <button
            key={f.form_id}
            onClick={() => setSelectedId(f.form_id)}
            className={`text-left p-4 rounded-xl border transition ${
              selectedId === f.form_id
                ? "bg-indigo-950/40 border-indigo-500/60"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-indigo-400">{f.form_id}</span>
              <Lock className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-sm font-semibold text-white mt-2">{f.name}</div>
            <div className="text-xs text-slate-400 mt-1">Minimal Level N={f.minimal_level}</div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
              <span>{f.level_lowering_suppression_db} dB</span>
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
                {evaluation.form_id} — {evaluation.status}
              </div>
              <div className="text-xs text-slate-400">
                Suppression: {evaluation.level_lowering_suppression_db} dB | Fidelity:{" "}
                {evaluation.effective_fidelity_pct}%
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-300">
            <Activity className="w-4 h-4" />
            <span>Defect: {evaluation.congruence_defect}</span>
          </div>
        </div>
      )}
    </div>
  );
}
