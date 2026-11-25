"use client";

import React, { useState, useEffect } from "react";
import { Shield, Activity, RefreshCw, Zap, Lock, AlertTriangle, GitBranch } from "lucide-react";

interface MixedHodgeStructure {
  structure_id: string;
  name: string;
  weight_filtration_k: number;
  hodge_filtration_p: number;
  transversality_verified: boolean;
  base_fidelity_pct: number;
}

interface DeligneTelemetry {
  structure_id: string;
  status: string;
  griffiths_transversality_defect: number;
  transversality_verified: boolean;
  weight_filtration_k: number;
  hodge_filtration_p: number;
  deligne_barrier_strength_pev: number;
  weight_leakage_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export function HodgeDeligneStudio() {
  const [structures, setStructures] = useState<MixedHodgeStructure[]>([]);
  const [selectedStructure, setSelectedStructure] = useState<string>("");
  const [weightK, setWeightK] = useState<number>(2);
  const [hodgeP, setHodgeP] = useState<number>(1);
  const [barrierGain, setBarrierGain] = useState<number>(1.25);
  const [telemetry, setTelemetry] = useState<DeligneTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStructures = async () => {
    try {
      const res = await fetch("/api/hodge-deligne-mixed-motives/structures");
      if (!res.ok) throw new Error("Failed to fetch mixed Hodge structures");
      const data = await res.json();
      setStructures(data.structures || []);
      if (data.structures?.length > 0 && !selectedStructure) {
        setSelectedStructure(data.structures[0].structure_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching structures");
    }
  };

  useEffect(() => {
    fetchStructures();
  }, []);

  const evaluateMixedHodge = async () => {
    if (!selectedStructure) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/hodge-deligne-mixed-motives/evaluate-mixed-hodge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          structure_id: selectedStructure,
          weight_filtration_k: weightK,
          hodge_filtration_p: hodgeP,
          barrier_gain: barrierGain,
        }),
      });
      if (!res.ok) throw new Error("Mixed Hodge evaluation failed");
      setTelemetry(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error evaluating Mixed Hodge");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 shadow-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <GitBranch className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Hodge-Deligne Mixed Hodge Structures Barrier
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Capability 210
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Mixed Hodge Structures (W_., F^.), Deligne weight-filtration splitting &amp; Griffiths transversality nabla F^p
            </p>
          </div>
        </div>
        <button
          onClick={fetchStructures}
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
              Target Mixed Hodge Structure
            </label>
            <select
              value={selectedStructure}
              onChange={(e) => setSelectedStructure(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {structures.map((s) => (
                <option key={s.structure_id} value={s.structure_id}>
                  {s.name} ({s.structure_id})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Weight Filtration (W_k): {weightK}
              </label>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={weightK}
                onChange={(e) => setWeightK(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Hodge Filtration (F^p): {hodgeP}
              </label>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={hodgeP}
                onChange={(e) => setHodgeP(parseInt(e.target.value))}
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
            onClick={evaluateMixedHodge}
            disabled={loading || !selectedStructure}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-indigo-900/30 transition"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> Splitting Filtrations...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" /> Lock Griffiths Transversality
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
                  <span className="text-xs text-slate-400 block mb-1">Weight W_k</span>
                  <span className="text-lg font-bold text-indigo-400">
                    k = {telemetry.weight_filtration_k}
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Barrier Strength</span>
                  <span className="text-lg font-bold text-violet-400">
                    {telemetry.deligne_barrier_strength_pev.toFixed(2)} PeV
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Weight Suppr</span>
                  <span className="text-lg font-bold text-cyan-400">
                    {telemetry.weight_leakage_suppression_db.toFixed(1)} dB
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
                  W. V. D. Hodge &amp; Pierre Deligne Filtration Invariants
                </h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-slate-400">Griffiths Transversality Defect:</div>
                  <div className="text-slate-200 font-mono text-right">
                    {telemetry.griffiths_transversality_defect.toExponential(4)}
                  </div>

                  <div className="text-slate-400">Transversality Status:</div>
                  <div className="text-indigo-400 font-semibold text-right flex items-center justify-end gap-1">
                    <Lock className="w-3.5 h-3.5" />{" "}
                    {telemetry.transversality_verified ? "MIXED HODGE SPLITTING LOCKED" : "DEVIATING"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-800/20 border border-dashed border-slate-700/50 rounded-lg p-12 text-center text-slate-500">
              <GitBranch className="w-12 h-12 mb-3 text-slate-600" />
              <p className="text-base font-medium text-slate-400">No Mixed Hodge Structure Evaluated</p>
              <p className="text-sm">Select a structure and enforce Griffiths transversality</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
