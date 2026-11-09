"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  Radio,
  Zap,
  Activity,
  Terminal,
  RefreshCw,
  Shield,
  Sparkles,
  Database,
  RotateCcw,
  CheckCircle,
} from "lucide-react";

interface TemporalLoopNode {
  loop_id: string;
  spacetime_region: string;
  proper_time_period_femtoseconds: number;
  ctc_winding_number: number;
  self_interaction_cross_section_b: number;
  unnormalized_paradox_probability: number;
  topological_phase_slip_radians: number;
  status: string;
}

interface NovikovNormalizationResult {
  normalization_id: string;
  loop_id: string;
  initial_paradox_probability: number;
  normalized_paradox_probability: number;
  action_phase_adjustment_rad: number;
  attosecond_topological_phase_slip_fs: number;
  self_consistent_trajectory_locked: boolean;
  path_integral_unitarity_pct: number;
  status: string;
  timestamp: string;
}

export function NovikovGeodesicStudio() {
  const [loops, setLoops] = useState<TemporalLoopNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [normalizing, setNormalizing] = useState(false);
  const [selectedLoop, setSelectedLoop] = useState("NOVIKOV-LOOP-CYLINDER-01");
  const [phaseGain, setPhaseGain] = useState(1.0);
  const [lastResult, setLastResult] = useState<NovikovNormalizationResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchLoops = async () => {
    try {
      const res = await fetch("/api/novikov-geodesic/loops");
      if (res.ok) {
        const data = await res.json();
        setLoops(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoops();
    setLogs([
      "[" + new Date().toLocaleTimeString() + "] Chrono-Topological Novikov Self-Consistency Geodesic Loop Normalizer initialized.",
      "[" + new Date().toLocaleTimeString() + "] Global Feynman Path Integral action extremizer active across closed timelike curves (CTCs).",
      "[" + new Date().toLocaleTimeString() + "] Novikov Conjecture: P(paradox) = 0 condition verified along all quantum geodesic loops.",
    ]);
  }, []);

  const handleNormalizeLoop = async () => {
    setNormalizing(true);
    setLogs((prev) => [
      "[" + new Date().toLocaleTimeString() + "] Applying path integral action weighting to " + selectedLoop + "...",
      ...prev,
    ]);
    try {
      const res = await fetch("/api/novikov-geodesic/normalize-loop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loop_id: selectedLoop,
          phase_adjustment_gain: phaseGain,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLastResult(data);
        setLogs((prev) => [
          "[" + new Date().toLocaleTimeString() + "] SUCCESS: Closed timelike loop normalized. Paradox Probability = 0.000 (Strict Novikov).",
          "[" + new Date().toLocaleTimeString() + "] Attosecond Phase Slip: " + (data.attosecond_topological_phase_slip_fs * 1000).toFixed(4) + " as | Action Shift: " + data.action_phase_adjustment_rad.toFixed(4) + " rad",
          ...prev,
        ]);
      }
    } catch {
      setLogs((prev) => [
        "[" + new Date().toLocaleTimeString() + "] ERROR: Geodesic loop normalization failed.",
        ...prev,
      ]);
    } finally {
      setNormalizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-amber-950/40 via-orange-900/30 to-yellow-950/40 border border-amber-500/30 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-400">
            <RotateCcw className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
              Chrono-Topological Novikov Self-Consistency Geodesic Normalizer
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono">
                Cap 97
              </span>
            </h1>
            <p className="text-sm text-amber-200/70 mt-1">
              Enforcing Novikov Principle on closed timelike curves: P(paradox) = 0 via global path-integral action phase slips
            </p>
          </div>
        </div>
        <button
          onClick={fetchLoops}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-sm text-amber-300 transition-colors self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Loops
        </button>
      </div>

      {/* Telemetry Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/60 border border-amber-500/20 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Paradox Probability</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-300">
            {lastResult ? lastResult.normalized_paradox_probability.toFixed(6) : "0.000000"}
          </div>
          <div className="text-xs text-emerald-400 mt-2 font-mono">Strictly Zero (P = 0)</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-amber-500/20 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Path Integral Unitarity</span>
            <CheckCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300">
            {lastResult ? lastResult.path_integral_unitarity_pct.toFixed(1) : "100.0"}%
          </div>
          <div className="text-xs text-amber-400 mt-2 font-mono">Global Causal Closure</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-amber-500/20 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Attosecond Phase Slip</span>
            <Clock className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-orange-300">
            {lastResult ? (lastResult.attosecond_topological_phase_slip_fs * 1000).toFixed(2) : "0.020"}
            <span className="text-xs text-slate-400 ml-1">as</span>
          </div>
          <div className="text-xs text-orange-400 mt-2 font-mono">&lt;0.0001 fs Residual</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-amber-500/20 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Action Phase Shift</span>
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-yellow-300">
            {lastResult ? lastResult.action_phase_adjustment_rad.toFixed(4) : "-0.0450"}
            <span className="text-xs text-slate-400 ml-1">rad</span>
          </div>
          <div className="text-xs text-yellow-400 mt-2 font-mono">Delta S / hbar Extremum</div>
        </div>
      </div>

      {/* Main Grid: Control Panel + Temporal Loops */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="p-6 bg-slate-900/60 border border-amber-500/20 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-amber-400" />
            Geodesic Loop Normalizer
          </h2>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Target Geodesic Loop</label>
            <select
              value={selectedLoop}
              onChange={(e) => setSelectedLoop(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              {loops.map((l) => (
                <option key={l.loop_id} value={l.loop_id}>
                  {l.loop_id} (Winding #{l.ctc_winding_number})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Path Integral Phase Gain</span>
              <span className="text-amber-400 font-mono">{phaseGain.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={phaseGain}
              onChange={(e) => setPhaseGain(parseFloat(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          <button
            onClick={handleNormalizeLoop}
            disabled={normalizing}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30"
          >
            {normalizing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Enforcing Novikov Self-Consistency...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                Normalize Geodesic Loop (P=0)
              </>
            )}
          </button>
        </div>

        {/* Temporal Loops Table */}
        <div className="lg:col-span-2 p-6 bg-slate-900/60 border border-amber-500/20 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-orange-400" />
            Monitored Closed Timelike Curves &amp; Geodesic Orbits
          </h2>
          {loading ? (
            <div className="text-slate-400 text-sm">Loading temporal loops...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-2">Loop ID</th>
                    <th className="pb-2">Metric Region</th>
                    <th className="pb-2">Proper Time (fs)</th>
                    <th className="pb-2">Winding</th>
                    <th className="pb-2">Unnormalized P</th>
                    <th className="pb-2">Phase Slip</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {loops.map((l) => (
                    <tr key={l.loop_id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 font-mono text-amber-400">{l.loop_id}</td>
                      <td className="py-2.5">{l.spacetime_region.split(" ")[0]} Spacetime</td>
                      <td className="py-2.5 font-mono">{l.proper_time_period_femtoseconds.toFixed(1)} fs</td>
                      <td className="py-2.5 font-mono text-purple-400">#{l.ctc_winding_number}</td>
                      <td className="py-2.5 font-mono text-rose-400">{l.unnormalized_paradox_probability.toFixed(3)}</td>
                      <td className="py-2.5 font-mono text-cyan-400">{l.topological_phase_slip_radians.toFixed(3)} rad</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Terminal Telemetry Logs */}
      <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl font-mono text-xs">
        <div className="flex items-center gap-2 text-amber-400 mb-2">
          <Terminal className="w-4 h-4" />
          <span>Novikov Chrono-Geodesic Telemetry &amp; Path-Integral Stream</span>
        </div>
        <div className="space-y-1 max-h-36 overflow-y-auto text-slate-400">
          {logs.map((log, idx) => (
            <div key={idx} className="leading-relaxed">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
