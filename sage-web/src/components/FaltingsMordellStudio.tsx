"use client";

import React, { useEffect, useState } from "react";
import { Shield, Flame, Activity, Lock } from "lucide-react";

interface MordellCurve {
  curve_id: string;
  name: string;
  genus_g: number;
  arakelov_height_defect: number;
  faltings_firewall_strength_pev: number;
  mordell_finiteness_suppression_db: number;
  status: string;
}

interface MordellEval {
  curve_id: string;
  status: string;
  arakelov_height_defect: number;
  mordell_finiteness_suppression_db: number;
  effective_fidelity_pct: number;
}

interface MordellMetrics {
  active_curves_count: number;
  evaluations_total: number;
  mean_firewall_strength_pev: number;
  mean_mordell_finiteness_suppression_db: number;
  faltings_mordell_compliance_pct: number;
}

export function FaltingsMordellStudio() {
  const [curves, setCurves] = useState<MordellCurve[]>([]);
  const [metrics, setMetrics] = useState<MordellMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("FALTINGS-MORDELL-GENUS2-01");
  const [evaluation, setEvaluation] = useState<MordellEval | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [cRes, mRes] = await Promise.all([
        fetch("/api/faltings-mordell-finiteness/curves"),
        fetch("/api/faltings-mordell-finiteness/metrics"),
      ]);
      if (cRes.ok) {
        const d = await cRes.json();
        setCurves(d.curves || []);
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
      const res = await fetch("/api/faltings-mordell-finiteness/evaluate-mordell-finiteness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ curve_id: selectedId, genus_g: 2, bad_primes_count: 3, firewall_gain: 1.25 }),
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
    <div className="space-y-6 p-6 bg-slate-950/60 border border-amber-500/20 rounded-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <Flame className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Faltings Mordell-Shafarevich Height Finiteness Firewall (Cap 223)
            </h2>
            <p className="text-sm text-slate-400">
              Wave 67 — Arakelov Modular Heights, Genus &gt;= 2 Finiteness &amp; Tate Isogeny Theorem
            </p>
          </div>
        </div>
        <button
          onClick={handleEvaluate}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? "Verifying Finiteness..." : "Evaluate Mordell Finiteness"}
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Active Curves</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">{metrics.active_curves_count}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Evaluations</div>
            <div className="text-2xl font-bold text-white mt-1">{metrics.evaluations_total}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Mean Suppression</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">
              {metrics.mean_mordell_finiteness_suppression_db} dB
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Compliance</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {metrics.faltings_mordell_compliance_pct}%
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
                ? "bg-amber-950/40 border-amber-500/60"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-400">{c.curve_id}</span>
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-sm font-semibold text-white mt-2">{c.name}</div>
            <div className="text-xs text-slate-400 mt-1">Genus g={c.genus_g}</div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
              <span>{c.mordell_finiteness_suppression_db} dB</span>
              <span className="text-amber-400">{c.status}</span>
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
                {evaluation.curve_id} — {evaluation.status}
              </div>
              <div className="text-xs text-slate-400">
                Suppression: {evaluation.mordell_finiteness_suppression_db} dB | Fidelity:{" "}
                {evaluation.effective_fidelity_pct}%
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
            <Activity className="w-4 h-4" />
            <span>Arakelov Defect: {evaluation.arakelov_height_defect}</span>
          </div>
        </div>
      )}
    </div>
  );
}
