"use client";

import React, { useState, useEffect } from "react";
import { Shield, Activity, RefreshCw, Zap, Lock, AlertTriangle, Layers } from "lucide-react";

interface FlagVariety {
  variety_id: string;
  name: string;
  lie_algebra: string;
  flag_dimension: number;
  twisted_lambda: number;
  base_fidelity_pct: number;
  holonomic_verified: boolean;
}

interface BeilinsonTelemetry {
  variety_id: string;
  status: string;
  localization_defect: number;
  holonomic_verified: boolean;
  flag_dimension: number;
  twisted_lambda: number;
  characteristic_cycle_dimension: number;
  beilinson_barrier_strength_pev: number;
  differential_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export function BeilinsonBernsteinStudio() {
  const [algebras, setAlgebras] = useState<FlagVariety[]>([]);
  const [selectedVariety, setSelectedVariety] = useState<string>("");
  const [flagDimension, setFlagDimension] = useState<number>(3);
  const [twistedLambda, setTwistedLambda] = useState<number>(1.0);
  const [barrierGain, setBarrierGain] = useState<number>(1.25);
  const [telemetry, setTelemetry] = useState<BeilinsonTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlgebras = async () => {
    try {
      const res = await fetch("/api/beilinson-bernstein-localization/algebras");
      if (!res.ok) throw new Error("Failed to fetch flag varieties");
      const data = await res.json();
      setAlgebras(data.algebras || []);
      if (data.algebras?.length > 0 && !selectedVariety) {
        setSelectedVariety(data.algebras[0].variety_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching algebras");
    }
  };

  useEffect(() => {
    fetchAlgebras();
  }, []);

  const handleEvaluateDModuleLocalization = async () => {
    if (!selectedVariety) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/beilinson-bernstein-localization/evaluate-d-module-localization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variety_id: selectedVariety,
          flag_dimension: Number(flagDimension),
          twisted_lambda: Number(twistedLambda),
          barrier_gain: Number(barrierGain),
        }),
      });
      if (!res.ok) throw new Error("Failed to evaluate D-module localization");
      const data = await res.json();
      setTelemetry(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Evaluation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Beilinson-Bernstein Localization & Flag Variety D-Modules Barrier
              <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-mono border border-indigo-500/30">
                CAP-195
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Alexander Beilinson & Joseph Bernstein localization theorem: equivalence of Lie algebra representations U(g)_lambda and twisted D-modules on flag varieties X = G/B.
            </p>
          </div>
        </div>
        <button
          onClick={fetchAlgebras}
          className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/50"
          title="Refresh Varieties"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-900/30 border border-red-500/40 rounded-lg flex items-center gap-3 text-red-300 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Flag Variety (G/B)
          </label>
          <select
            value={selectedVariety}
            onChange={(e) => setSelectedVariety(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            {algebras.map((v) => (
              <option key={v.variety_id} value={v.variety_id}>
                {v.name} ({v.lie_algebra})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Flag Dimension
          </label>
          <input
            type="number"
            value={flagDimension}
            onChange={(e) => setFlagDimension(Number(e.target.value))}
            min={1}
            max={12}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Twisted Character (λ)
          </label>
          <input
            type="number"
            value={twistedLambda}
            onChange={(e) => setTwistedLambda(Number(e.target.value))}
            step={0.1}
            min={0.1}
            max={5.0}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Barrier Gain Multiplier
          </label>
          <input
            type="number"
            value={barrierGain}
            onChange={(e) => setBarrierGain(Number(e.target.value))}
            step={0.05}
            min={0.5}
            max={3.0}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleEvaluateDModuleLocalization}
          disabled={loading || !selectedVariety}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm rounded-lg transition-colors shadow-lg shadow-indigo-900/30"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          {loading ? "Verifying D-Module Localization..." : "Lock D-Module Barrier"}
        </button>
      </div>

      {telemetry && (
        <div className="mt-6 border border-slate-800 bg-slate-950/60 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold text-sm text-white font-mono">
                {telemetry.status}
              </span>
            </div>
            <span className="text-xs text-slate-500">
              {new Date(telemetry.timestamp * 1000).toISOString()}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-3">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                Beilinson Barrier Strength
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {telemetry.beilinson_barrier_strength_pev} PeV
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-3">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                Differential Suppression
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {telemetry.differential_suppression_db} dB
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-3">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                Localization Defect
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {telemetry.localization_defect}
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-3">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Holonomic Fidelity
              </div>
              <div className="text-lg font-bold text-emerald-400 mt-1">
                {telemetry.effective_fidelity_pct}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
