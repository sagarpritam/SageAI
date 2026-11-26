"use client";

import React, { useEffect, useState } from "react";
import { Shield, Lock, Activity, GitBranch } from "lucide-react";

interface QuaternionCorrespondence {
  correspondence_id: string;
  name: string;
  discriminant_d: number;
  quaternion_defect: number;
  jacquet_shield_strength_pev: number;
  quaternion_suppression_db: number;
  status: string;
}

interface QuaternionEval {
  correspondence_id: string;
  status: string;
  quaternion_defect: number;
  quaternion_suppression_db: number;
  effective_fidelity_pct: number;
}

interface QuaternionMetrics {
  active_correspondences_count: number;
  evaluations_total: number;
  mean_shield_strength_pev: number;
  mean_quaternion_suppression_db: number;
  jacquet_langlands_compliance_pct: number;
}

export function JacquetLanglandsStudio() {
  const [correspondences, setCorrespondences] = useState<QuaternionCorrespondence[]>([]);
  const [metrics, setMetrics] = useState<QuaternionMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("JACQUET-LANGLANDS-GL2-01");
  const [evaluation, setEvaluation] = useState<QuaternionEval | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [cRes, mRes] = await Promise.all([
        fetch("/api/jacquet-langlands-quaternion/correspondences"),
        fetch("/api/jacquet-langlands-quaternion/metrics"),
      ]);
      if (cRes.ok) {
        const d = await cRes.json();
        setCorrespondences(d.correspondences || []);
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
      const res = await fetch("/api/jacquet-langlands-quaternion/evaluate-quaternion-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correspondence_id: selectedId, quaternion_discriminant: 6, level_n: 11, shield_gain: 1.25 }),
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
              Jacquet-Langlands Correspondence &amp; Quaternion Shimura Shield (Cap 227)
            </h2>
            <p className="text-sm text-slate-400">
              Wave 69 — GL(2) &lt;-&gt; D^x Automorphic Transfer, Shimura Curves &amp; Eichler-Shimura
            </p>
          </div>
        </div>
        <button
          onClick={handleEvaluate}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? "Evaluating Transfer..." : "Evaluate Quaternion Transfer"}
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Active Transfers</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{metrics.active_correspondences_count}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Evaluations</div>
            <div className="text-2xl font-bold text-white mt-1">{metrics.evaluations_total}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Mean Suppression</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">
              {metrics.mean_quaternion_suppression_db} dB
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Compliance</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {metrics.jacquet_langlands_compliance_pct}%
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {correspondences.map((c) => (
          <button
            key={c.correspondence_id}
            onClick={() => setSelectedId(c.correspondence_id)}
            className={`text-left p-4 rounded-xl border transition ${
              selectedId === c.correspondence_id
                ? "bg-emerald-950/40 border-emerald-500/60"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-400">{c.correspondence_id}</span>
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-sm font-semibold text-white mt-2">{c.name}</div>
            <div className="text-xs text-slate-400 mt-1">Discriminant D={c.discriminant_d}</div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
              <span>{c.quaternion_suppression_db} dB</span>
              <span className="text-emerald-400">{c.status}</span>
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
                {evaluation.correspondence_id} — {evaluation.status}
              </div>
              <div className="text-xs text-slate-400">
                Suppression: {evaluation.quaternion_suppression_db} dB | Fidelity:{" "}
                {evaluation.effective_fidelity_pct}%
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-300">
            <Activity className="w-4 h-4" />
            <span>Quaternion Defect: {evaluation.quaternion_defect}</span>
          </div>
        </div>
      )}
    </div>
  );
}
