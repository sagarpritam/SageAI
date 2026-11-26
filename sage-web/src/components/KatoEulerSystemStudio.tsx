"use client";

import React, { useEffect, useState } from "react";
import { Shield, Lock, Activity, GitBranch } from "lucide-react";

interface KatoSystem {
  system_id: string;
  name: string;
  prime_p: number;
  reciprocity_defect: number;
  kato_shield_strength_pev: number;
  euler_system_suppression_db: number;
  status: string;
}

interface KatoEval {
  system_id: string;
  status: string;
  reciprocity_defect: number;
  euler_system_suppression_db: number;
  effective_fidelity_pct: number;
}

interface KatoMetrics {
  active_systems_count: number;
  evaluations_total: number;
  mean_shield_strength_pev: number;
  mean_euler_system_suppression_db: number;
  kato_euler_compliance_pct: number;
}

export function KatoEulerSystemStudio() {
  const [systems, setSystems] = useState<KatoSystem[]>([]);
  const [metrics, setMetrics] = useState<KatoMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("KATO-EULER-ZETA-01");
  const [evaluation, setEvaluation] = useState<KatoEval | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [sRes, mRes] = await Promise.all([
        fetch("/api/kato-euler-system/systems"),
        fetch("/api/kato-euler-system/metrics"),
      ]);
      if (sRes.ok) {
        const d = await sRes.json();
        setSystems(d.systems || []);
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
      const res = await fetch("/api/kato-euler-system/evaluate-euler-system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system_id: selectedId, prime_p: 5, weight_k: 2, shield_gain: 1.25 }),
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
              Kato Euler System & p-Adic BSD Shield (Cap 221)
            </h2>
            <p className="text-sm text-slate-400">
              Wave 67 — Beilinson-Kato Zeta Elements, Explicit Reciprocity & Selmer Bounds
            </p>
          </div>
        </div>
        <button
          onClick={handleEvaluate}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? "Evaluating Euler System..." : "Evaluate Euler System"}
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Active Systems</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{metrics.active_systems_count}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Evaluations</div>
            <div className="text-2xl font-bold text-white mt-1">{metrics.evaluations_total}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Mean Suppression</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">
              {metrics.mean_euler_system_suppression_db} dB
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Compliance</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {metrics.kato_euler_compliance_pct}%
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {systems.map((s) => (
          <button
            key={s.system_id}
            onClick={() => setSelectedId(s.system_id)}
            className={`text-left p-4 rounded-xl border transition ${
              selectedId === s.system_id
                ? "bg-emerald-950/40 border-emerald-500/60"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-400">{s.system_id}</span>
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-sm font-semibold text-white mt-2">{s.name}</div>
            <div className="text-xs text-slate-400 mt-1">Prime p={s.prime_p}</div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
              <span>{s.euler_system_suppression_db} dB</span>
              <span className="text-emerald-400">{s.status}</span>
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
                {evaluation.system_id} — {evaluation.status}
              </div>
              <div className="text-xs text-slate-400">
                Suppression: {evaluation.euler_system_suppression_db} dB | Fidelity:{" "}
                {evaluation.effective_fidelity_pct}%
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-300">
            <Activity className="w-4 h-4" />
            <span>Reciprocity Defect: {evaluation.reciprocity_defect}</span>
          </div>
        </div>
      )}
    </div>
  );
}
