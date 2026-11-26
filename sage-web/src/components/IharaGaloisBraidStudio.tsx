"use client";

import React, { useEffect, useState } from "react";
import { Shield, GitBranch, Activity, Lock } from "lucide-react";

interface BraidProfile {
  braid_id: string;
  name: string;
  fundamental_group: string;
  gt_hat_cocycle_defect: number;
  ihara_shield_strength_pev: number;
  braid_monodromy_suppression_db: number;
  status: string;
}

interface BraidEvaluation {
  braid_id: string;
  status: string;
  gt_hat_cocycle_defect: number;
  monodromy_verified: boolean;
  puncture_count: number;
  profinite_depth: number;
  ihara_shield_strength_pev: number;
  braid_monodromy_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: string;
}

interface BraidMetrics {
  active_braids_count: number;
  evaluations_total: number;
  mean_shield_strength_pev: number;
  mean_braid_monodromy_suppression_db: number;
  profinite_braid_compliance_pct: number;
}

export function IharaGaloisBraidStudio() {
  const [braids, setBraids] = useState<BraidProfile[]>([]);
  const [metrics, setMetrics] = useState<BraidMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("IHARA-P1-MINUS3-01");
  const [evaluation, setEvaluation] = useState<BraidEvaluation | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [bRes, mRes] = await Promise.all([
        fetch("/api/ihara-galois-braid/braids"),
        fetch("/api/ihara-galois-braid/metrics"),
      ]);
      if (bRes.ok) {
        const d = await bRes.json();
        setBraids(d.braids || []);
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
      const res = await fetch("/api/ihara-galois-braid/evaluate-profinite-braid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          braid_id: selectedId,
          puncture_count: 3,
          profinite_depth: 4,
          shield_gain: 1.25,
        }),
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
              Ihara Galois Braid & Profinite Fundamental Group Shield (Cap 215)
            </h2>
            <p className="text-sm text-slate-400">
              Wave 65 — Grothendieck-Teichmuller GT-hat Associator & Profinite Braid Monodromy
            </p>
          </div>
        </div>
        <button
          onClick={handleEvaluate}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? "Evaluating Profinite Braid..." : "Evaluate Profinite Braid"}
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Active Braids</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{metrics.active_braids_count}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Evaluations</div>
            <div className="text-2xl font-bold text-white mt-1">{metrics.evaluations_total}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Mean Suppression</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">
              {metrics.mean_braid_monodromy_suppression_db} dB
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Compliance</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {metrics.profinite_braid_compliance_pct}%
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {braids.map((b) => (
          <button
            key={b.braid_id}
            onClick={() => setSelectedId(b.braid_id)}
            className={`text-left p-4 rounded-xl border transition ${
              selectedId === b.braid_id
                ? "bg-emerald-950/40 border-emerald-500/60"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-400">{b.braid_id}</span>
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-sm font-semibold text-white mt-2">{b.name}</div>
            <div className="text-xs text-slate-400 mt-1 font-mono">{b.fundamental_group}</div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
              <span>{b.braid_monodromy_suppression_db} dB</span>
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
                {evaluation.braid_id} — {evaluation.status}
              </div>
              <div className="text-xs text-slate-400">
                Suppression: {evaluation.braid_monodromy_suppression_db} dB | Fidelity:{" "}
                {evaluation.effective_fidelity_pct}%
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-300">
            <Activity className="w-4 h-4" />
            <span>GT-hat Defect: {evaluation.gt_hat_cocycle_defect}</span>
          </div>
        </div>
      )}
    </div>
  );
}
