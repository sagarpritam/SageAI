"use client";

import React, { useEffect, useState } from "react";
import { Network, RefreshCw, ShieldCheck, Layers } from "lucide-react";

interface BranelineRecord {
  braneline_id: string;
  gauge_group: string;
  twist_parameter_t: number;
  hecke_eigenvalue_rank: number;
  brane_state: string;
}

interface KwMetrics {
  active_branelines_count: number;
  evaluations_total: number;
  mean_shield_strength_pev: number;
  kapustin_witten_compliance_pct: number;
}

interface KwEvalResult {
  braneline_id: string;
  status: string;
  hitchin_fibration_verified: boolean;
  kw_shield_strength_pev: number;
  s_duality_suppression_db: number;
  effective_fidelity_pct: number;
}

export function KapustinWittenStudio() {
  const [branelines, setBranelines] = useState<BranelineRecord[]>([]);
  const [metrics, setMetrics] = useState<KwMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("KAPUSTIN-WITTEN-SDUAL-01");
  const [heckeRank, setHeckeRank] = useState(3);
  const [twistT, setTwistT] = useState(1.0);
  const [shieldGain, setShieldGain] = useState(1.25);
  const [result, setResult] = useState<KwEvalResult | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [bRes, mRes] = await Promise.all([
        fetch("/api/kapustin-witten-sduality/branelines"),
        fetch("/api/kapustin-witten-sduality/metrics"),
      ]);
      if (bRes.ok) {
        const bData = await bRes.json();
        setBranelines(bData.branelines || []);
      }
      if (mRes.ok) {
        setMetrics(await mRes.json());
      }
    } catch (err) {
      console.error("Failed to load Kapustin-Witten telemetry", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/kapustin-witten-sduality/evaluate-s-duality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          braneline_id: selectedId,
          hecke_rank: heckeRank,
          twist_t: twistT,
          shield_gain: shieldGain,
        }),
      });
      if (res.ok) {
        setResult(await res.json());
        await loadData();
      }
    } catch (err) {
      console.error("Kapustin-Witten evaluation failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 rounded-xl border border-indigo-500/30 bg-slate-950/80 p-6 text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-indigo-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-indigo-500/20 p-2.5 text-indigo-400">
            <Network className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Kapustin-Witten Geometric Langlands &amp; S-Duality Gauge Shield
            </h2>
            <p className="text-xs text-slate-400">
              Capability 242 · Electric-Magnetic S-Duality &amp; Hitchin Fibration Hecke Eigensheaves
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Branelines
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Active Branelines</div>
            <div className="mt-1 text-xl font-bold text-indigo-300">{metrics.active_branelines_count}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">S-Duality Compliance</div>
            <div className="mt-1 text-xl font-bold text-emerald-400">
              {metrics.kapustin_witten_compliance_pct.toFixed(2)}%
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Evaluations</div>
            <div className="mt-1 text-xl font-bold text-white">{metrics.evaluations_total}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Mean Shield</div>
            <div className="mt-1 text-sm font-semibold text-cyan-300">
              {(metrics.mean_shield_strength_pev / 1e12).toFixed(2)} TPeV
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-indigo-300">
            <Layers className="h-4 w-4" /> Evaluate S-Duality Gauge Shield
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Dual Gauge Braneline</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              >
                {branelines.map((b) => (
                  <option key={b.braneline_id} value={b.braneline_id}>
                    {b.braneline_id} ({b.gauge_group})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Hecke Eigenvalue Rank</label>
              <input
                type="number"
                value={heckeRank}
                min={1}
                onChange={(e) => setHeckeRank(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Twist Parameter (t)</label>
              <input
                type="number"
                step="0.1"
                value={twistT}
                onChange={(e) => setTwistT(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Shield Gain</label>
              <input
                type="number"
                step="0.05"
                value={shieldGain}
                onChange={(e) => setShieldGain(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
          <button
            onClick={handleEvaluate}
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? "Locking Hitchin Fibration..." : "Lock Kapustin-Witten S-Duality Shield"}
          </button>

          {result && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-emerald-300">
                <ShieldCheck className="h-4 w-4" /> {result.status}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                <span>Shield: {(result.kw_shield_strength_pev / 1e12).toFixed(2)} TPeV</span>
                <span>Suppression: {result.s_duality_suppression_db.toFixed(2)} dB</span>
                <span>Fidelity: {result.effective_fidelity_pct.toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="text-sm font-semibold text-indigo-300">Langlands Dual Braneline Registry</h3>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {branelines.map((b) => (
              <div
                key={b.braneline_id}
                className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{b.braneline_id}</div>
                  <div className="text-[11px] text-slate-400">
                    {b.gauge_group} · t={b.twist_parameter_t} · rank {b.hecke_eigenvalue_rank}
                  </div>
                </div>
                <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                  {b.brane_state}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
