"use client";

import React, { useEffect, useState } from "react";
import { Network, RefreshCw, ShieldCheck, Layers } from "lucide-react";

interface TheoryRecord {
  theory_id: string;
  factorization_algebra: string;
  effective_scale_l: number;
  loop_order: number;
  renormalization_state: string;
}

interface CostelloMetrics {
  active_theories_count: number;
  evaluations_total: number;
  mean_shield_strength_pev: number;
  costello_bv_compliance_pct: number;
}

interface CostelloEvalResult {
  theory_id: string;
  status: string;
  rg_flow_counterterm_verified: boolean;
  costello_shield_strength_pev: number;
  bv_renorm_suppression_db: number;
  effective_fidelity_pct: number;
}

export function CostelloBvRenormStudio() {
  const [theories, setTheories] = useState<TheoryRecord[]>([]);
  const [metrics, setMetrics] = useState<CostelloMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("COSTELLO-BV-RENORM-01");
  const [loopOrder, setLoopOrder] = useState(2);
  const [scaleCutoff, setScaleCutoff] = useState(0.01);
  const [shieldGain, setShieldGain] = useState(1.25);
  const [result, setResult] = useState<CostelloEvalResult | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [tRes, mRes] = await Promise.all([
        fetch("/api/costello-bv-renorm/theories"),
        fetch("/api/costello-bv-renorm/metrics"),
      ]);
      if (tRes.ok) {
        const tData = await tRes.json();
        setTheories(tData.theories || []);
      }
      if (mRes.ok) {
        setMetrics(await mRes.json());
      }
    } catch (err) {
      console.error("Failed to load Costello BV telemetry", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/costello-bv-renorm/evaluate-bv-renorm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theory_id: selectedId,
          loop_order: loopOrder,
          scale_cutoff: scaleCutoff,
          shield_gain: shieldGain,
        }),
      });
      if (res.ok) {
        setResult(await res.json());
        await loadData();
      }
    } catch (err) {
      console.error("Costello BV evaluation failed", err);
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
              Kevin Costello Factorization Algebra &amp; BV Renormalization Shield
            </h2>
            <p className="text-xs text-slate-400">
              Capability 239 · Effective Quantum Master Equation &amp; RG Flow Counterterms
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Theories
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Active Theories</div>
            <div className="mt-1 text-xl font-bold text-indigo-300">{metrics.active_theories_count}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">BV Compliance</div>
            <div className="mt-1 text-xl font-bold text-emerald-400">
              {metrics.costello_bv_compliance_pct.toFixed(2)}%
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
            <Layers className="h-4 w-4" /> Evaluate BV Renormalization Shield
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Factorization Theory</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              >
                {theories.map((t) => (
                  <option key={t.theory_id} value={t.theory_id}>
                    {t.theory_id} ({t.factorization_algebra})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Loop Order</label>
              <input
                type="number"
                value={loopOrder}
                min={1}
                onChange={(e) => setLoopOrder(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">RG Scale Cutoff (L)</label>
              <input
                type="number"
                step="0.001"
                value={scaleCutoff}
                onChange={(e) => setScaleCutoff(Number(e.target.value))}
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
            {loading ? "Locking RG Counterterms..." : "Lock Costello BV Renormalization Shield"}
          </button>

          {result && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-emerald-300">
                <ShieldCheck className="h-4 w-4" /> {result.status}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                <span>Shield: {(result.costello_shield_strength_pev / 1e12).toFixed(2)} TPeV</span>
                <span>Suppression: {result.bv_renorm_suppression_db.toFixed(2)} dB</span>
                <span>Fidelity: {result.effective_fidelity_pct.toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="text-sm font-semibold text-indigo-300">Factorization Algebra Registry</h3>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {theories.map((t) => (
              <div
                key={t.theory_id}
                className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{t.theory_id}</div>
                  <div className="text-[11px] text-slate-400">
                    {t.factorization_algebra} · L={t.effective_scale_l} · {t.loop_order}-loop
                  </div>
                </div>
                <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                  {t.renormalization_state}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
