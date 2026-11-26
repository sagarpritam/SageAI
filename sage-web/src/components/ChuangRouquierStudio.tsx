"use client";

import React, { useEffect, useState } from "react";
import { Flame, RefreshCw, ShieldCheck, Layers } from "lucide-react";

interface ComplexRecord {
  complex_id: string;
  equivalence_type: string;
  rickard_complex_terms: number;
  perverse_shift_p: number;
  equivalence_state: string;
}

interface CrMetrics {
  active_complexes_count: number;
  evaluations_total: number;
  mean_firewall_strength_pev: number;
  chuang_rouquier_compliance_pct: number;
}

interface CrEvalResult {
  complex_id: string;
  status: string;
  perverse_equivalence_verified: boolean;
  cr_firewall_strength_pev: number;
  sl2_categorification_suppression_db: number;
  effective_fidelity_pct: number;
}

export function ChuangRouquierStudio() {
  const [complexes, setComplexes] = useState<ComplexRecord[]>([]);
  const [metrics, setMetrics] = useState<CrMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("CHUANG-ROUQUIER-SL2-01");
  const [rickardTerms, setRickardTerms] = useState(4);
  const [perverseShiftP, setPerverseShiftP] = useState(2);
  const [firewallGain, setFirewallGain] = useState(1.25);
  const [result, setResult] = useState<CrEvalResult | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [cRes, mRes] = await Promise.all([
        fetch("/api/chuang-rouquier-sl2/complexes"),
        fetch("/api/chuang-rouquier-sl2/metrics"),
      ]);
      if (cRes.ok) {
        const cData = await cRes.json();
        setComplexes(cData.complexes || []);
      }
      if (mRes.ok) {
        setMetrics(await mRes.json());
      }
    } catch (err) {
      console.error("Failed to load Chuang-Rouquier telemetry", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/chuang-rouquier-sl2/evaluate-rickard-complex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complex_id: selectedId,
          rickard_terms: rickardTerms,
          perverse_shift_p: perverseShiftP,
          firewall_gain: firewallGain,
        }),
      });
      if (res.ok) {
        setResult(await res.json());
        await loadData();
      }
    } catch (err) {
      console.error("Chuang-Rouquier evaluation failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 rounded-xl border border-rose-500/30 bg-slate-950/80 p-6 text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rose-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-rose-500/20 p-2.5 text-rose-400">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Chuang-Rouquier Derived Equivalences &amp; sl_2 Categorification Firewall
            </h2>
            <p className="text-xs text-slate-400">
              Capability 247 · Splendid Rickard Complexes &amp; Broué Abelian Defect Equivalences
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Complexes
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Rickard Complexes</div>
            <div className="mt-1 text-xl font-bold text-rose-300">{metrics.active_complexes_count}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">sl_2 Compliance</div>
            <div className="mt-1 text-xl font-bold text-emerald-400">
              {metrics.chuang_rouquier_compliance_pct.toFixed(2)}%
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Evaluations</div>
            <div className="mt-1 text-xl font-bold text-white">{metrics.evaluations_total}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Mean Firewall</div>
            <div className="mt-1 text-sm font-semibold text-cyan-300">
              {(metrics.mean_firewall_strength_pev / 1e12).toFixed(2)} TPeV
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-rose-300">
            <Layers className="h-4 w-4" /> Evaluate Rickard Complex Firewall
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Derived Equivalence</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              >
                {complexes.map((c) => (
                  <option key={c.complex_id} value={c.complex_id}>
                    {c.complex_id} ({c.equivalence_type})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Rickard Terms</label>
              <input
                type="number"
                value={rickardTerms}
                min={1}
                onChange={(e) => setRickardTerms(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Perverse Shift (p)</label>
              <input
                type="number"
                value={perverseShiftP}
                min={0}
                onChange={(e) => setPerverseShiftP(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Firewall Gain</label>
              <input
                type="number"
                step="0.05"
                value={firewallGain}
                onChange={(e) => setFirewallGain(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
          <button
            onClick={handleEvaluate}
            disabled={loading}
            className="w-full rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
          >
            {loading ? "Verifying Perverse Equivalence..." : "Lock Chuang-Rouquier sl_2 Firewall"}
          </button>

          {result && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-emerald-300">
                <ShieldCheck className="h-4 w-4" /> {result.status}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                <span>Firewall: {(result.cr_firewall_strength_pev / 1e12).toFixed(2)} TPeV</span>
                <span>Suppression: {result.sl2_categorification_suppression_db.toFixed(2)} dB</span>
                <span>Fidelity: {result.effective_fidelity_pct.toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="text-sm font-semibold text-rose-300">Splendid Rickard Registry</h3>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {complexes.map((c) => (
              <div
                key={c.complex_id}
                className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{c.complex_id}</div>
                  <div className="text-[11px] text-slate-400">
                    {c.equivalence_type} · terms={c.rickard_complex_terms} · p={c.perverse_shift_p}
                  </div>
                </div>
                <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
                  {c.equivalence_state}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
