"use client";

import React, { useState, useEffect } from "react";
import { Shield, Activity, RefreshCw, Zap, Lock, AlertTriangle, Award } from "lucide-react";

interface EulerSystem {
  system_id: string;
  name: string;
  motive_weight: number;
  tamagawa_product: number;
  tamagawa_verified: boolean;
  base_fidelity_pct: number;
}

interface TamagawaTelemetry {
  system_id: string;
  status: string;
  l_value_regulator_defect: number;
  tamagawa_verified: boolean;
  motive_weight: number;
  tamagawa_product: number;
  tamagawa_barrier_strength_pev: number;
  euler_system_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export function BlochKatoTamagawaStudio() {
  const [systems, setSystems] = useState<EulerSystem[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<string>("");
  const [motiveWeight, setMotiveWeight] = useState<number>(2);
  const [tamagawaProduct, setTamagawaProduct] = useState<number>(1);
  const [barrierGain, setBarrierGain] = useState<number>(1.25);
  const [telemetry, setTelemetry] = useState<TamagawaTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSystems = async () => {
    try {
      const res = await fetch("/api/bloch-kato-tamagawa/systems");
      if (!res.ok) throw new Error("Failed to fetch Euler systems");
      const data = await res.json();
      setSystems(data.systems || []);
      if (data.systems?.length > 0 && !selectedSystem) {
        setSelectedSystem(data.systems[0].system_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching systems");
    }
  };

  useEffect(() => {
    fetchSystems();
  }, []);

  const evaluateTamagawa = async () => {
    if (!selectedSystem) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bloch-kato-tamagawa/evaluate-tamagawa-number", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_id: selectedSystem,
          motive_weight: motiveWeight,
          tamagawa_product: tamagawaProduct,
          barrier_gain: barrierGain,
        }),
      });
      if (!res.ok) throw new Error("Tamagawa evaluation failed");
      setTelemetry(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error evaluating Tamagawa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 shadow-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Bloch-Kato Tamagawa Number Barrier
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Capability 213
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Tamagawa Number Conjecture relating L*(M, 0) to local Tamagawa factors c_p, regulators &amp; Euler systems
            </p>
          </div>
        </div>
        <button
          onClick={fetchSystems}
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
              Target Euler System
            </label>
            <select
              value={selectedSystem}
              onChange={(e) => setSelectedSystem(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {systems.map((s) => (
                <option key={s.system_id} value={s.system_id}>
                  {s.name} ({s.system_id})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Motive Weight: {motiveWeight}
              </label>
              <input
                type="range"
                min="2"
                max="8"
                step="2"
                value={motiveWeight}
                onChange={(e) => setMotiveWeight(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Tamagawa Product: {tamagawaProduct}
              </label>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={tamagawaProduct}
                onChange={(e) => setTamagawaProduct(parseInt(e.target.value))}
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
            onClick={evaluateTamagawa}
            disabled={loading || !selectedSystem}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-indigo-900/30 transition"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> Evaluating Tamagawa...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" /> Lock Euler System
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
                  <span className="text-xs text-slate-400 block mb-1">Tamagawa Prod</span>
                  <span className="text-lg font-bold text-indigo-400">
                    prod c_p = {telemetry.tamagawa_product}
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Barrier Strength</span>
                  <span className="text-lg font-bold text-violet-400">
                    {telemetry.tamagawa_barrier_strength_pev.toFixed(2)} PeV
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Euler Suppr</span>
                  <span className="text-lg font-bold text-cyan-400">
                    {telemetry.euler_system_suppression_db.toFixed(1)} dB
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
                  Spencer Bloch &amp; Kazuya Kato Tamagawa Invariants
                </h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-slate-400">L-Value Regulator Defect:</div>
                  <div className="text-slate-200 font-mono text-right">
                    {telemetry.l_value_regulator_defect.toExponential(4)}
                  </div>

                  <div className="text-slate-400">Tamagawa Status:</div>
                  <div className="text-indigo-400 font-semibold text-right flex items-center justify-end gap-1">
                    <Lock className="w-3.5 h-3.5" />{" "}
                    {telemetry.tamagawa_verified ? "TAMAGAWA NUMBER LOCKED" : "DEVIATING"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-800/20 border border-dashed border-slate-700/50 rounded-lg p-12 text-center text-slate-500">
              <Award className="w-12 h-12 mb-3 text-slate-600" />
              <p className="text-base font-medium text-slate-400">No Euler System Evaluated</p>
              <p className="text-sm">Select an Euler system and lock Tamagawa invariants</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
