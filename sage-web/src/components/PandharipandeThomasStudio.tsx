"use client";

import React, { useEffect, useState } from "react";
import { Compass, RefreshCw, ShieldCheck, Layers } from "lucide-react";

interface StablePairRecord {
  pair_id: string;
  calabi_yau_fold: string;
  curve_degree: number;
  euler_char: number;
  gv_genus_bound: number;
  bps_stability_state: string;
}

interface PtBpsMetrics {
  active_pairs_count: number;
  total_evaluations: number;
  pt_bps_compliance_pct: number;
  gv_integrality_status: string;
}

interface PtBpsEvalResult {
  pair_id: string;
  status: string;
  gv_integrality_verified: boolean;
  pt_partition_residue: number;
  bps_index_bound: number;
  compliance_pct: number;
  detail: string;
}

export function PandharipandeThomasStudio() {
  const [pairs, setPairs] = useState<StablePairRecord[]>([]);
  const [metrics, setMetrics] = useState<PtBpsMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("PT-STABLE-PAIR-CY3-01");
  const [eulerChar, setEulerChar] = useState(1);
  const [curveDegree, setCurveDegree] = useState(2);
  const [barrierGain, setBarrierGain] = useState(1.25);
  const [result, setResult] = useState<PtBpsEvalResult | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [pRes, mRes] = await Promise.all([
        fetch("/api/pandharipande-thomas-bps/pairs"),
        fetch("/api/pandharipande-thomas-bps/metrics"),
      ]);
      if (pRes.ok) {
        const pData = await pRes.json();
        setPairs(pData.pairs || []);
      }
      if (mRes.ok) {
        setMetrics(await mRes.json());
      }
    } catch (err) {
      console.error("Failed to load Pandharipande-Thomas telemetry", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pandharipande-thomas-bps/evaluate-pt-bps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pair_id: selectedId,
          euler_char: eulerChar,
          curve_degree: curveDegree,
          barrier_gain: barrierGain,
        }),
      });
      if (res.ok) {
        setResult(await res.json());
        await loadData();
      }
    } catch (err) {
      console.error("Pandharipande-Thomas evaluation failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 rounded-xl border border-amber-500/30 bg-slate-950/80 p-6 text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-500/20 p-2.5 text-amber-400">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Pandharipande-Thomas &amp; Gopakumar-Vafa BPS Barrier
            </h2>
            <p className="text-xs text-slate-400">
              Capability 234 · Calabi-Yau 3-Fold Stable Pairs &amp; GV Integrality
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/20"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Pairs
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Active Stable Pairs</div>
            <div className="mt-1 text-xl font-bold text-amber-300">{metrics.active_pairs_count}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">PT-BPS Compliance</div>
            <div className="mt-1 text-xl font-bold text-emerald-400">
              {metrics.pt_bps_compliance_pct.toFixed(2)}%
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Total Evaluations</div>
            <div className="mt-1 text-xl font-bold text-white">{metrics.total_evaluations}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">GV Integrality</div>
            <div className="mt-1 text-sm font-semibold text-cyan-300">{metrics.gv_integrality_status}</div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-300">
            <Layers className="h-4 w-4" /> Evaluate PT / GV BPS Barrier
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Stable Pair Target</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              >
                {pairs.map((p) => (
                  <option key={p.pair_id} value={p.pair_id}>
                    {p.pair_id} ({p.calabi_yau_fold})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Holomorphic Euler Char (n)</label>
              <input
                type="number"
                value={eulerChar}
                onChange={(e) => setEulerChar(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Curve Degree (β)</label>
              <input
                type="number"
                value={curveDegree}
                min={1}
                onChange={(e) => setCurveDegree(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Barrier Gain</label>
              <input
                type="number"
                step="0.05"
                value={barrierGain}
                onChange={(e) => setBarrierGain(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
          <button
            onClick={handleEvaluate}
            disabled={loading}
            className="w-full rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-500 disabled:opacity-50"
          >
            {loading ? "Verifying GV Integrality..." : "Lock Pandharipande-Thomas BPS Barrier"}
          </button>

          {result && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-emerald-300">
                <ShieldCheck className="h-4 w-4" /> {result.status}
              </div>
              <div className="mt-1 text-slate-300">{result.detail}</div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                <span>PT Residue: {result.pt_partition_residue.toFixed(4)}</span>
                <span>BPS Bound: {result.bps_index_bound.toFixed(2)}</span>
                <span>Compliance: {result.compliance_pct.toFixed(2)}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="text-sm font-semibold text-amber-300">Calabi-Yau Stable Pair Registry</h3>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {pairs.map((p) => (
              <div
                key={p.pair_id}
                className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{p.pair_id}</div>
                  <div className="text-[11px] text-slate-400">
                    {p.calabi_yau_fold} · deg {p.curve_degree} · χ={p.euler_char}
                  </div>
                </div>
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                  {p.bps_stability_state}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
