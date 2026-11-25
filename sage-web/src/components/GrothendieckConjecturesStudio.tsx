"use client";

import React, { useState, useEffect } from "react";
import { Shield, Activity, RefreshCw, Zap, Lock, AlertTriangle, Layers } from "lucide-react";

interface ChowMotive {
  motive_id: string;
  name: string;
  cycle_codimension: number;
  lefschetz_degree: number;
  semisimple_verified: boolean;
  base_fidelity_pct: number;
}

interface GrothendieckTelemetry {
  motive_id: string;
  status: string;
  numerical_homological_defect: number;
  semisimple_verified: boolean;
  cycle_codimension: number;
  lefschetz_degree: number;
  grothendieck_shield_strength_pev: number;
  cycle_equivalence_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export function GrothendieckConjecturesStudio() {
  const [motives, setMotives] = useState<ChowMotive[]>([]);
  const [selectedMotive, setSelectedMotive] = useState<string>("");
  const [cycleCodimension, setCycleCodimension] = useState<number>(1);
  const [lefschetzDegree, setLefschetzDegree] = useState<number>(2);
  const [shieldGain, setShieldGain] = useState<number>(1.25);
  const [telemetry, setTelemetry] = useState<GrothendieckTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMotives = async () => {
    try {
      const res = await fetch("/api/grothendieck-standard-conjectures/motives");
      if (!res.ok) throw new Error("Failed to fetch Chow motives");
      const data = await res.json();
      setMotives(data.motives || []);
      if (data.motives?.length > 0 && !selectedMotive) {
        setSelectedMotive(data.motives[0].motive_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching motives");
    }
  };

  useEffect(() => {
    fetchMotives();
  }, []);

  const evaluateConjectures = async () => {
    if (!selectedMotive) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/grothendieck-standard-conjectures/evaluate-standard-conjectures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          motive_id: selectedMotive,
          cycle_codimension: cycleCodimension,
          lefschetz_degree: lefschetzDegree,
          shield_gain: shieldGain,
        }),
      });
      if (!res.ok) throw new Error("Standard Conjectures evaluation failed");
      setTelemetry(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error evaluating conjectures");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 shadow-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Grothendieck Standard Conjectures Shield
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Capability 209
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Lefschetz-type conjecture B(X), Hodge positivity, numerical = homological equivalence &amp; pure Chow motive semisimplicity
            </p>
          </div>
        </div>
        <button
          onClick={fetchMotives}
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
              Target Chow Motive
            </label>
            <select
              value={selectedMotive}
              onChange={(e) => setSelectedMotive(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {motives.map((m) => (
                <option key={m.motive_id} value={m.motive_id}>
                  {m.name} ({m.motive_id})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Cycle Codimension: {cycleCodimension}
              </label>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={cycleCodimension}
                onChange={(e) => setCycleCodimension(parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Lefschetz Degree: {lefschetzDegree}
              </label>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={lefschetzDegree}
                onChange={(e) => setLefschetzDegree(parseInt(e.target.value))}
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
            onClick={evaluateConjectures}
            disabled={loading || !selectedMotive}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-emerald-900/30 transition"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> Evaluating Equivalence...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" /> Lock Chow Semisimplicity
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
                  <span className="text-xs text-slate-400 block mb-1">Lefschetz Deg</span>
                  <span className="text-lg font-bold text-emerald-400">
                    L^{telemetry.lefschetz_degree}
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Shield Strength</span>
                  <span className="text-lg font-bold text-teal-400">
                    {telemetry.grothendieck_shield_strength_pev.toFixed(2)} PeV
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Cycle Suppr</span>
                  <span className="text-lg font-bold text-cyan-400">
                    {telemetry.cycle_equivalence_suppression_db.toFixed(1)} dB
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
                  Alexander Grothendieck Algebraic Cycle Invariants
                </h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-slate-400">Numerical = Homological Defect:</div>
                  <div className="text-slate-200 font-mono text-right">
                    {telemetry.numerical_homological_defect.toExponential(4)}
                  </div>

                  <div className="text-slate-400">Semisimplicity Status:</div>
                  <div className="text-emerald-400 font-semibold text-right flex items-center justify-end gap-1">
                    <Lock className="w-3.5 h-3.5" />{" "}
                    {telemetry.semisimple_verified ? "CHOW MOTIVE SEMISIMPLE LOCKED" : "DEVIATING"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-800/20 border border-dashed border-slate-700/50 rounded-lg p-12 text-center text-slate-500">
              <Layers className="w-12 h-12 mb-3 text-slate-600" />
              <p className="text-base font-medium text-slate-400">No Chow Motive Evaluated</p>
              <p className="text-sm">Select a motive and verify Lefschetz &amp; Hodge standard conjectures</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
