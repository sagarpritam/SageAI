"use client";

import React, { useState, useEffect } from "react";
import { Shield, Activity, RefreshCw, Zap, Lock, AlertTriangle, Binary } from "lucide-react";

interface AlgebraicVariety {
  variety_id: string;
  name: string;
  finite_field_q: number;
  cohomology_weight_w: number;
  betti_number_bw: number;
  frobenius_purity_verified: boolean;
  base_fidelity_pct: number;
}

interface WeilTelemetry {
  variety_id: string;
  status: string;
  frobenius_purity_defect: number;
  frobenius_purity_verified: boolean;
  finite_field_q: number;
  cohomology_weight_w: number;
  frobenius_eigenvalue_modulus: number;
  weil_barrier_strength_pev: number;
  zeta_pole_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export function WeilFrobeniusPurityStudio() {
  const [varieties, setVarieties] = useState<AlgebraicVariety[]>([]);
  const [selectedVariety, setSelectedVariety] = useState<string>("");
  const [finiteFieldQ, setFiniteFieldQ] = useState<number>(7);
  const [cohomologyWeightW, setCohomologyWeightW] = useState<number>(1);
  const [barrierGain, setBarrierGain] = useState<number>(1.25);
  const [telemetry, setTelemetry] = useState<WeilTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVarieties = async () => {
    try {
      const res = await fetch("/api/weil-conjectures-purity/varieties");
      if (!res.ok) throw new Error("Failed to fetch varieties");
      const data = await res.json();
      setVarieties(data.varieties || []);
      if (data.varieties?.length > 0 && !selectedVariety) {
        setSelectedVariety(data.varieties[0].variety_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching varieties");
    }
  };

  useEffect(() => {
    fetchVarieties();
  }, []);

  const evaluatePurity = async () => {
    if (!selectedVariety) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/weil-conjectures-purity/evaluate-frobenius-purity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variety_id: selectedVariety,
          finite_field_q: finiteFieldQ,
          cohomology_weight_w: cohomologyWeightW,
          barrier_gain: barrierGain,
        }),
      });
      if (!res.ok) throw new Error("Frobenius purity evaluation failed");
      setTelemetry(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error evaluating purity");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 shadow-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <Binary className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Weil Conjectures Frobenius Purity Barrier
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Capability 207
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Weil Conjectures &amp; Deligne Frobenius Purity |alpha_i| = q^(w/2) for zeta functions Z(X/F_q, T)
            </p>
          </div>
        </div>
        <button
          onClick={fetchVarieties}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm border border-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Target Variety over F_q
            </label>
            <select
              value={selectedVariety}
              onChange={(e) => setSelectedVariety(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {varieties.map((v) => (
                <option key={v.variety_id} value={v.variety_id}>
                  {v.name} ({v.variety_id})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Finite Field Cardinality (q): {finiteFieldQ}
              </label>
              <input
                type="range"
                min="3"
                max="31"
                step="2"
                value={finiteFieldQ}
                onChange={(e) => setFiniteFieldQ(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Cohomology Weight (w): {cohomologyWeightW}
              </label>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={cohomologyWeightW}
                onChange={(e) => setCohomologyWeightW(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Barrier Gain Multiplier: {barrierGain.toFixed(2)}x
              </label>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.05"
                value={barrierGain}
                onChange={(e) => setBarrierGain(parseFloat(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>

          <button
            onClick={evaluatePurity}
            disabled={loading || !selectedVariety}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-indigo-900/30 transition"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> Evaluating Eigenvalues...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" /> Lock Frobenius Purity
              </>
            )}
          </button>
        </div>

        <div className="lg:col-span-2">
          {telemetry ? (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-5 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Telemetry Status
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Shield className="w-3.5 h-3.5" /> {telemetry.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Eigenvalue |alpha|</span>
                  <span className="text-lg font-bold text-indigo-400">
                    {telemetry.frobenius_eigenvalue_modulus.toFixed(3)}
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Barrier Strength</span>
                  <span className="text-lg font-bold text-violet-400">
                    {telemetry.weil_barrier_strength_pev.toFixed(2)} PeV
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Zeta Suppr</span>
                  <span className="text-lg font-bold text-cyan-400">
                    {telemetry.zeta_pole_suppression_db.toFixed(1)} dB
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Fidelity</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {telemetry.effective_fidelity_pct.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="space-y-3 bg-slate-900/60 p-4 rounded-lg border border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  André Weil &amp; Pierre Deligne Purity Invariants
                </h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-slate-400">Frobenius Purity Defect:</div>
                  <div className="text-slate-200 font-mono text-right">
                    {telemetry.frobenius_purity_defect.toExponential(4)}
                  </div>

                  <div className="text-slate-400">Riemann Hypothesis Purity:</div>
                  <div className="text-indigo-400 font-semibold text-right flex items-center justify-end gap-1">
                    <Lock className="w-3.5 h-3.5" />{" "}
                    {telemetry.frobenius_purity_verified ? "FROBENIUS PURITY LOCKED" : "DEVIATING"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-800/20 border border-dashed border-slate-700/50 rounded-lg p-12 text-center text-slate-500">
              <Binary className="w-12 h-12 mb-3 text-slate-600" />
              <p className="text-base font-medium text-slate-400">No Variety Evaluated</p>
              <p className="text-sm">Select an algebraic variety over F_q and lock Frobenius purity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
