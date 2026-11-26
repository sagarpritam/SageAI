"use client";

import React, { useEffect, useState } from "react";
import { Shield, Lock, Activity, GitBranch } from "lucide-react";

interface AbcBound {
  bound_id: string;
  name: string;
  epsilon: number;
  radical_defect: number;
  szpiro_shield_strength_pev: number;
  abc_radical_suppression_db: number;
  status: string;
}

interface AbcEval {
  bound_id: string;
  status: string;
  radical_defect: number;
  abc_radical_suppression_db: number;
  effective_fidelity_pct: number;
}

interface AbcMetrics {
  active_bounds_count: number;
  evaluations_total: number;
  mean_shield_strength_pev: number;
  mean_abc_radical_suppression_db: number;
  szpiro_abc_compliance_pct: number;
}

export function SzpiroAbcHeightStudio() {
  const [bounds, setBounds] = useState<AbcBound[]>([]);
  const [metrics, setMetrics] = useState<AbcMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("SZPIRO-DISCRIMINANT-01");
  const [evaluation, setEvaluation] = useState<AbcEval | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [bRes, mRes] = await Promise.all([
        fetch("/api/szpiro-abc-height/bounds"),
        fetch("/api/szpiro-abc-height/metrics"),
      ]);
      if (bRes.ok) {
        const d = await bRes.json();
        setBounds(d.bounds || []);
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
      const res = await fetch("/api/szpiro-abc-height/evaluate-abc-radical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bound_id: selectedId, conductor_n: 11, szpiro_exponent: 6.0, shield_gain: 1.25 }),
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
              Szpiro Discriminant &amp; ABC Radical Height Shield (Cap 224)
            </h2>
            <p className="text-sm text-slate-400">
              Wave 68 — Szpiro Discriminant Bounds, Masser-Oesterle ABC &amp; Vojta Height Inequalities
            </p>
          </div>
        </div>
        <button
          onClick={handleEvaluate}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? "Evaluating ABC Radical..." : "Evaluate ABC Radical"}
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Active Bounds</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{metrics.active_bounds_count}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Evaluations</div>
            <div className="text-2xl font-bold text-white mt-1">{metrics.evaluations_total}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Mean Suppression</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">
              {metrics.mean_abc_radical_suppression_db} dB
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Compliance</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {metrics.szpiro_abc_compliance_pct}%
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bounds.map((b) => (
          <button
            key={b.bound_id}
            onClick={() => setSelectedId(b.bound_id)}
            className={`text-left p-4 rounded-xl border transition ${
              selectedId === b.bound_id
                ? "bg-emerald-950/40 border-emerald-500/60"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-400">{b.bound_id}</span>
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-sm font-semibold text-white mt-2">{b.name}</div>
            <div className="text-xs text-slate-400 mt-1">Epsilon: {b.epsilon}</div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
              <span>{b.abc_radical_suppression_db} dB</span>
              <span className="text-emerald-400">{b.status}</span>
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
                {evaluation.bound_id} — {evaluation.status}
              </div>
              <div className="text-xs text-slate-400">
                Suppression: {evaluation.abc_radical_suppression_db} dB | Fidelity:{" "}
                {evaluation.effective_fidelity_pct}%
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-300">
            <Activity className="w-4 h-4" />
            <span>Radical Defect: {evaluation.radical_defect}</span>
          </div>
        </div>
      )}
    </div>
  );
}
