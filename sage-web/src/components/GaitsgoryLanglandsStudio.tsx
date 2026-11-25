"use client";

import React, { useState, useEffect } from "react";
import { Shield, Activity, RefreshCw, Zap, Lock, AlertTriangle, Sparkles } from "lucide-react";

interface LanglandsFunctor {
  functor_id: string;
  name: string;
  dual_rank: number;
  nilpotent_orbit_dim: number;
  whittaker_normalized: boolean;
  categorical_equivalence_verified: boolean;
  base_fidelity_pct: number;
}

interface GaitsgoryTelemetry {
  functor_id: string;
  status: string;
  whittaker_equivalence_defect: number;
  categorical_equivalence_verified: boolean;
  dual_rank: number;
  nilpotent_orbit_dim: number;
  gaitsgory_shield_strength_pev: number;
  spectral_anomaly_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export function GaitsgoryLanglandsStudio() {
  const [functors, setFunctors] = useState<LanglandsFunctor[]>([]);
  const [selectedFunctor, setSelectedFunctor] = useState<string>("");
  const [dualRank, setDualRank] = useState<number>(2);
  const [nilpotentOrbitDim, setNilpotentOrbitDim] = useState<number>(4);
  const [shieldGain, setShieldGain] = useState<number>(1.25);
  const [telemetry, setTelemetry] = useState<GaitsgoryTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFunctors = async () => {
    try {
      const res = await fetch("/api/gaitsgory-categorical-langlands/functors");
      if (!res.ok) throw new Error("Failed to fetch Langlands functors");
      const data = await res.json();
      setFunctors(data.functors || []);
      if (data.functors?.length > 0 && !selectedFunctor) {
        setSelectedFunctor(data.functors[0].functor_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching functors");
    }
  };

  useEffect(() => {
    fetchFunctors();
  }, []);

  const evaluateEquivalence = async () => {
    if (!selectedFunctor) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/gaitsgory-categorical-langlands/evaluate-categorical-equivalence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          functor_id: selectedFunctor,
          dual_rank: dualRank,
          nilpotent_orbit_dim: nilpotentOrbitDim,
          shield_gain: shieldGain,
        }),
      });
      if (!res.ok) throw new Error("Categorical equivalence evaluation failed");
      const data = await res.json();
      setTelemetry(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error evaluating equivalence");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 shadow-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Gaitsgory Categorical Langlands Shield
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Capability 203
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Categorical Geometric Langlands Correspondence IndCoh_N(LocSys_G_check) ~= D-Mod(Bun_G), Whittaker normalization &amp; spectral Eisenstein functors
            </p>
          </div>
        </div>
        <button
          onClick={fetchFunctors}
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
              Target Langlands Functor
            </label>
            <select
              value={selectedFunctor}
              onChange={(e) => setSelectedFunctor(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {functors.map((f) => (
                <option key={f.functor_id} value={f.functor_id}>
                  {f.name} ({f.functor_id})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Langlands Dual Rank: {dualRank}
              </label>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={dualRank}
                onChange={(e) => setDualRank(parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Nilpotent Orbit Dim: {nilpotentOrbitDim}
              </label>
              <input
                type="range"
                min="2"
                max="32"
                step="2"
                value={nilpotentOrbitDim}
                onChange={(e) => setNilpotentOrbitDim(parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Shield Gain Multiplier: {shieldGain.toFixed(2)}x
              </label>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.05"
                value={shieldGain}
                onChange={(e) => setShieldGain(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          <button
            onClick={evaluateEquivalence}
            disabled={loading || !selectedFunctor}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-emerald-900/30 transition"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> Verifying Equivalence...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" /> Lock Categorical Equivalence
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
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Shield className="w-3.5 h-3.5" /> {telemetry.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Dual Rank</span>
                  <span className="text-lg font-bold text-emerald-400">
                    rk = {telemetry.dual_rank}
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Shield Strength</span>
                  <span className="text-lg font-bold text-teal-400">
                    {telemetry.gaitsgory_shield_strength_pev.toFixed(2)} PeV
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Spectral Suppr</span>
                  <span className="text-lg font-bold text-cyan-400">
                    {telemetry.spectral_anomaly_suppression_db.toFixed(1)} dB
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Fidelity</span>
                  <span className="text-lg font-bold text-amber-400">
                    {telemetry.effective_fidelity_pct.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="space-y-3 bg-slate-900/60 p-4 rounded-lg border border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Dennis Gaitsgory &amp; Sam Raskin Categorical Invariants
                </h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-slate-400">Nilpotent Orbit Dimension:</div>
                  <div className="text-slate-200 font-mono text-right">{telemetry.nilpotent_orbit_dim}</div>

                  <div className="text-slate-400">Whittaker Defect:</div>
                  <div className="text-slate-200 font-mono text-right">
                    {telemetry.whittaker_equivalence_defect.toExponential(4)}
                  </div>

                  <div className="text-slate-400">Categorical Equivalence:</div>
                  <div className="text-emerald-400 font-semibold text-right flex items-center justify-end gap-1">
                    <Lock className="w-3.5 h-3.5" />{" "}
                    {telemetry.categorical_equivalence_verified ? "WHITTAKER EQUIVALENCE LOCKED" : "DEVIATING"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-800/20 border border-dashed border-slate-700/50 rounded-lg p-12 text-center text-slate-500">
              <Sparkles className="w-12 h-12 mb-3 text-slate-600" />
              <p className="text-base font-medium text-slate-400">No Functor Evaluated</p>
              <p className="text-sm">Select a Langlands functor and verify categorical equivalence</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
