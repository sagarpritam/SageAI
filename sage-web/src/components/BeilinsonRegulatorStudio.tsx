"use client";

import React, { useEffect, useState } from "react";
import { Shield, Compass, Activity, Lock } from "lucide-react";

interface BeilinsonRegulator {
  regulator_id: string;
  name: string;
  chow_weight: number;
  regulator_defect: number;
  beilinson_barrier_strength_pev: number;
  regulator_suppression_db: number;
  status: string;
}

interface RegulatorEval {
  regulator_id: string;
  status: string;
  regulator_defect: number;
  regulator_suppression_db: number;
  effective_fidelity_pct: number;
}

interface RegulatorMetrics {
  active_regulators_count: number;
  evaluations_total: number;
  mean_barrier_strength_pev: number;
  mean_regulator_suppression_db: number;
  beilinson_regulator_compliance_pct: number;
}

export function BeilinsonRegulatorStudio() {
  const [regulators, setRegulators] = useState<BeilinsonRegulator[]>([]);
  const [metrics, setMetrics] = useState<RegulatorMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("BEILINSON-REGULATOR-K2-01");
  const [evaluation, setEvaluation] = useState<RegulatorEval | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [rRes, mRes] = await Promise.all([
        fetch("/api/beilinson-deligne-regulator/regulators"),
        fetch("/api/beilinson-deligne-regulator/metrics"),
      ]);
      if (rRes.ok) {
        const d = await rRes.json();
        setRegulators(d.regulators || []);
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
      const res = await fetch("/api/beilinson-deligne-regulator/evaluate-beilinson-regulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regulator_id: selectedId, motivic_weight: 2, chow_codimension: 2, barrier_gain: 1.25 }),
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
              Beilinson-Deligne Regulator &amp; Higher Chow Barrier (Cap 228)
            </h2>
            <p className="text-sm text-slate-400">
              Wave 69 — Motivic Cohomology Regulators, Deligne-Beilinson &amp; Bloch Higher Chow
            </p>
          </div>
        </div>
        <button
          onClick={handleEvaluate}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? "Evaluating Regulator..." : "Evaluate Beilinson Regulator"}
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Active Regulators</div>
            <div className="text-2xl font-bold text-indigo-400 mt-1">{metrics.active_regulators_count}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Evaluations</div>
            <div className="text-2xl font-bold text-white mt-1">{metrics.evaluations_total}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Mean Suppression</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">
              {metrics.mean_regulator_suppression_db} dB
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Compliance</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {metrics.beilinson_regulator_compliance_pct}%
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {regulators.map((r) => (
          <button
            key={r.regulator_id}
            onClick={() => setSelectedId(r.regulator_id)}
            className={`text-left p-4 rounded-xl border transition ${
              selectedId === r.regulator_id
                ? "bg-indigo-950/40 border-indigo-500/60"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-indigo-400">{r.regulator_id}</span>
              <Lock className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-sm font-semibold text-white mt-2">{r.name}</div>
            <div className="text-xs text-slate-400 mt-1">Chow Weight: {r.chow_weight}</div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
              <span>{r.regulator_suppression_db} dB</span>
              <span className="text-indigo-400">{r.status}</span>
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
                {evaluation.regulator_id} — {evaluation.status}
              </div>
              <div className="text-xs text-slate-400">
                Suppression: {evaluation.regulator_suppression_db} dB | Fidelity:{" "}
                {evaluation.effective_fidelity_pct}%
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-300">
            <Activity className="w-4 h-4" />
            <span>Regulator Defect: {evaluation.regulator_defect}</span>
          </div>
        </div>
      )}
    </div>
  );
}
