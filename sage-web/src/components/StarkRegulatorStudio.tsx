"use client";

import React, { useEffect, useState } from "react";
import { Shield, Flame, Activity, Lock } from "lucide-react";

interface StarkRegulator {
  regulator_id: string;
  name: string;
  artin_l_order: number;
  artin_regulator_defect: number;
  stark_firewall_strength_pev: number;
  ray_class_suppression_db: number;
  status: string;
}

interface StarkEvaluation {
  regulator_id: string;
  status: string;
  artin_regulator_defect: number;
  stark_unit_verified: boolean;
  vanishing_order_r: number;
  class_number_h: number;
  stark_firewall_strength_pev: number;
  ray_class_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: string;
}

interface StarkMetrics {
  active_regulators_count: number;
  evaluations_total: number;
  mean_firewall_strength_pev: number;
  mean_ray_class_suppression_db: number;
  stark_regulator_compliance_pct: number;
}

export function StarkRegulatorStudio() {
  const [regulators, setRegulators] = useState<StarkRegulator[]>([]);
  const [metrics, setMetrics] = useState<StarkMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("STARK-RANK1-ABELIAN-01");
  const [evaluation, setEvaluation] = useState<StarkEvaluation | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [rRes, mRes] = await Promise.all([
        fetch("/api/stark-regulator-values/regulators"),
        fetch("/api/stark-regulator-values/metrics"),
      ]);
      if (rRes.ok) {
        const d = await rRes.json();
        setRegulators(d.regulators || []);
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
        "/api/stark-regulator-values/evaluate-stark-regulator",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            regulator_id: selectedId,
            vanishing_order_r: 1,
            class_number_h: 1,
            firewall_gain: 1.25,
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
    <div className="space-y-6 p-6 bg-slate-950/60 border border-amber-500/20 rounded-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <Flame className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Stark Regulator & Artin L-Function Special Values Firewall (Cap 217)
            </h2>
            <p className="text-sm text-slate-400">
              Wave 65 — Rank-1 Abelian Stark Units, Brumer-Stark & Gross p-Adic Regulators
            </p>
          </div>
        </div>
        <button
          onClick={handleEvaluate}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? "Evaluating Stark Regulator..." : "Evaluate Stark Regulator"}
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Active Regulators</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">{metrics.active_regulators_count}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Evaluations</div>
            <div className="text-2xl font-bold text-white mt-1">{metrics.evaluations_total}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Mean Suppression</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">
              {metrics.mean_ray_class_suppression_db} dB
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Compliance</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {metrics.stark_regulator_compliance_pct}%
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
                ? "bg-amber-950/40 border-amber-500/60"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-400">{r.regulator_id}</span>
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-sm font-semibold text-white mt-2">{r.name}</div>
            <div className="text-xs text-slate-400 mt-1">Vanishing Order r={r.artin_l_order}</div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
              <span>{r.ray_class_suppression_db} dB</span>
              <span className="text-amber-400">{r.status}</span>
            </div>
          </button>
        ))}
      </div>

      {evaluation && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-sm font-semibold text-white">
                {evaluation.regulator_id} — {evaluation.status}
              </div>
              <div className="text-xs text-slate-400">
                Suppression: {evaluation.ray_class_suppression_db} dB | Fidelity:{" "}
                {evaluation.effective_fidelity_pct}%
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
            <Activity className="w-4 h-4" />
            <span>Regulator Defect: {evaluation.artin_regulator_defect}</span>
          </div>
        </div>
      )}
    </div>
  );
}
