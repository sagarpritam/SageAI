"use client";

import React, { useEffect, useState } from "react";
import { Shield, Compass, Activity, Lock } from "lucide-react";

interface ShimuraVariety {
  variety_id: string;
  name: string;
  dimension: number;
  special_point_defect: number;
  andre_oort_barrier_strength_pev: number;
  special_points_suppression_db: number;
  status: string;
}

interface VarietyEval {
  variety_id: string;
  status: string;
  special_point_defect: number;
  special_points_suppression_db: number;
  effective_fidelity_pct: number;
}

interface VarietyMetrics {
  active_varieties_count: number;
  evaluations_total: number;
  mean_barrier_strength_pev: number;
  mean_special_points_suppression_db: number;
  andre_oort_compliance_pct: number;
}

export function AndreOortShimuraStudio() {
  const [varieties, setVarieties] = useState<ShimuraVariety[]>([]);
  const [metrics, setMetrics] = useState<VarietyMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("ANDRE-OORT-CM-POINTS-01");
  const [evaluation, setEvaluation] = useState<VarietyEval | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [vRes, mRes] = await Promise.all([
        fetch("/api/andre-oort-shimura/varieties"),
        fetch("/api/andre-oort-shimura/metrics"),
      ]);
      if (vRes.ok) {
        const d = await vRes.json();
        setVarieties(d.varieties || []);
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
      const res = await fetch("/api/andre-oort-shimura/evaluate-special-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variety_id: selectedId, shimura_dimension: 2, cm_discriminant: 19, barrier_gain: 1.25 }),
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
              Andre-Oort &amp; Shimura Special Points Barrier (Cap 225)
            </h2>
            <p className="text-sm text-slate-400">
              Wave 68 — CM Special Points, Zilber-Pink Unlikely Intersections &amp; Pila O-Minimal Counting
            </p>
          </div>
        </div>
        <button
          onClick={handleEvaluate}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? "Evaluating Special Points..." : "Evaluate Special Points"}
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Active Varieties</div>
            <div className="text-2xl font-bold text-indigo-400 mt-1">{metrics.active_varieties_count}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Evaluations</div>
            <div className="text-2xl font-bold text-white mt-1">{metrics.evaluations_total}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Mean Suppression</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">
              {metrics.mean_special_points_suppression_db} dB
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Compliance</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {metrics.andre_oort_compliance_pct}%
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {varieties.map((v) => (
          <button
            key={v.variety_id}
            onClick={() => setSelectedId(v.variety_id)}
            className={`text-left p-4 rounded-xl border transition ${
              selectedId === v.variety_id
                ? "bg-indigo-950/40 border-indigo-500/60"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-indigo-400">{v.variety_id}</span>
              <Lock className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-sm font-semibold text-white mt-2">{v.name}</div>
            <div className="text-xs text-slate-400 mt-1">Dimension: {v.dimension}</div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
              <span>{v.special_points_suppression_db} dB</span>
              <span className="text-indigo-400">{v.status}</span>
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
                {evaluation.variety_id} — {evaluation.status}
              </div>
              <div className="text-xs text-slate-400">
                Suppression: {evaluation.special_points_suppression_db} dB | Fidelity:{" "}
                {evaluation.effective_fidelity_pct}%
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-300">
            <Activity className="w-4 h-4" />
            <span>Special Point Defect: {evaluation.special_point_defect}</span>
          </div>
        </div>
      )}
    </div>
  );
}
