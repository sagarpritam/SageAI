"use client";

import React, { useEffect, useState } from "react";
import { Shield, Compass, Activity, Lock } from "lucide-react";

interface HeegnerPairing {
  pairing_id: string;
  name: string;
  discriminant_d: number;
  height_pairing_defect: number;
  gross_zagier_barrier_strength_pev: number;
  heegner_height_suppression_db: number;
  status: string;
}

interface PairingEval {
  pairing_id: string;
  status: string;
  height_pairing_defect: number;
  heegner_height_suppression_db: number;
  effective_fidelity_pct: number;
}

interface PairingMetrics {
  active_pairings_count: number;
  evaluations_total: number;
  mean_barrier_strength_pev: number;
  mean_heegner_height_suppression_db: number;
  gross_zagier_compliance_pct: number;
}

export function GrossZagierHeegnerStudio() {
  const [pairings, setPairings] = useState<HeegnerPairing[]>([]);
  const [metrics, setMetrics] = useState<PairingMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("GROSS-ZAGIER-HEEGNER-01");
  const [evaluation, setEvaluation] = useState<PairingEval | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [pRes, mRes] = await Promise.all([
        fetch("/api/gross-zagier-heegner/pairings"),
        fetch("/api/gross-zagier-heegner/metrics"),
      ]);
      if (pRes.ok) {
        const d = await pRes.json();
        setPairings(d.pairings || []);
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
      const res = await fetch("/api/gross-zagier-heegner/evaluate-height-pairing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pairing_id: selectedId, conductor_n: 37, analytic_rank: 1, barrier_gain: 1.25 }),
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
              Gross-Zagier Height Pairing & Heegner Point Barrier (Cap 222)
            </h2>
            <p className="text-sm text-slate-400">
              Wave 67 — L&apos;(E,1) Neron-Tate Canonical Heights & Kolyvagin Systems
            </p>
          </div>
        </div>
        <button
          onClick={handleEvaluate}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? "Evaluating Height..." : "Evaluate Height Pairing"}
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Active Pairings</div>
            <div className="text-2xl font-bold text-indigo-400 mt-1">{metrics.active_pairings_count}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Evaluations</div>
            <div className="text-2xl font-bold text-white mt-1">{metrics.evaluations_total}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Mean Suppression</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">
              {metrics.mean_heegner_height_suppression_db} dB
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Compliance</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {metrics.gross_zagier_compliance_pct}%
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pairings.map((p) => (
          <button
            key={p.pairing_id}
            onClick={() => setSelectedId(p.pairing_id)}
            className={`text-left p-4 rounded-xl border transition ${
              selectedId === p.pairing_id
                ? "bg-indigo-950/40 border-indigo-500/60"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-indigo-400">{p.pairing_id}</span>
              <Lock className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-sm font-semibold text-white mt-2">{p.name}</div>
            <div className="text-xs text-slate-400 mt-1">Discriminant D={p.discriminant_d}</div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
              <span>{p.heegner_height_suppression_db} dB</span>
              <span className="text-indigo-400">{p.status}</span>
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
                {evaluation.pairing_id} — {evaluation.status}
              </div>
              <div className="text-xs text-slate-400">
                Suppression: {evaluation.heegner_height_suppression_db} dB | Fidelity:{" "}
                {evaluation.effective_fidelity_pct}%
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-300">
            <Activity className="w-4 h-4" />
            <span>Height Defect: {evaluation.height_pairing_defect}</span>
          </div>
        </div>
      )}
    </div>
  );
}
