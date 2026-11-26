"use client";

import React, { useEffect, useState } from "react";
import { Shield, Flame, Activity, Lock } from "lucide-react";

interface MilnorSymbol {
  symbol_id: string;
  name: string;
  k_degree_n: number;
  norm_residue_defect: number;
  milnor_firewall_strength_pev: number;
  steinberg_suppression_db: number;
  status: string;
}

interface SymbolEval {
  symbol_id: string;
  status: string;
  norm_residue_defect: number;
  steinberg_suppression_db: number;
  effective_fidelity_pct: number;
}

interface SymbolMetrics {
  active_symbols_count: number;
  evaluations_total: number;
  mean_firewall_strength_pev: number;
  mean_steinberg_suppression_db: number;
  milnor_k_theory_compliance_pct: number;
}

export function MilnorKTheoryStudio() {
  const [symbols, setSymbols] = useState<MilnorSymbol[]>([]);
  const [metrics, setMetrics] = useState<SymbolMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("MILNOR-K2-SYMBOL-01");
  const [evaluation, setEvaluation] = useState<SymbolEval | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [sRes, mRes] = await Promise.all([
        fetch("/api/milnor-norm-residue/symbols"),
        fetch("/api/milnor-norm-residue/metrics"),
      ]);
      if (sRes.ok) {
        const d = await sRes.json();
        setSymbols(d.symbols || []);
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
      const res = await fetch("/api/milnor-norm-residue/evaluate-milnor-symbol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol_id: selectedId, k_degree_n: 2, torsion_m: 5, firewall_gain: 1.25 }),
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
              Milnor K-Theory &amp; Norm Residue Symbol Firewall (Cap 229)
            </h2>
            <p className="text-sm text-slate-400">
              Wave 69 — Steinberg Symbol Ring K_n^M(F), Matsumoto &amp; Merkurjev-Suslin
            </p>
          </div>
        </div>
        <button
          onClick={handleEvaluate}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? "Evaluating Symbol..." : "Evaluate Milnor Symbol"}
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Active Symbols</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">{metrics.active_symbols_count}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Evaluations</div>
            <div className="text-2xl font-bold text-white mt-1">{metrics.evaluations_total}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Mean Suppression</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">
              {metrics.mean_steinberg_suppression_db} dB
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Compliance</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {metrics.milnor_k_theory_compliance_pct}%
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {symbols.map((s) => (
          <button
            key={s.symbol_id}
            onClick={() => setSelectedId(s.symbol_id)}
            className={`text-left p-4 rounded-xl border transition ${
              selectedId === s.symbol_id
                ? "bg-amber-950/40 border-amber-500/60"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-400">{s.symbol_id}</span>
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-sm font-semibold text-white mt-2">{s.name}</div>
            <div className="text-xs text-slate-400 mt-1">K-Degree n={s.k_degree_n}</div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
              <span>{s.steinberg_suppression_db} dB</span>
              <span className="text-amber-400">{s.status}</span>
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
                {evaluation.symbol_id} — {evaluation.status}
              </div>
              <div className="text-xs text-slate-400">
                Suppression: {evaluation.steinberg_suppression_db} dB | Fidelity:{" "}
                {evaluation.effective_fidelity_pct}%
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
            <Activity className="w-4 h-4" />
            <span>Norm Residue Defect: {evaluation.norm_residue_defect}</span>
          </div>
        </div>
      )}
    </div>
  );
}
