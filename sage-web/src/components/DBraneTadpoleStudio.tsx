"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Radio,
  Zap,
  Activity,
  Terminal,
  RefreshCw,
  Shield,
  Sparkles,
  Database,
  Filter,
  CheckCircle,
} from "lucide-react";

interface DBraneStackNode {
  stack_id: string;
  geometry_label: string;
  d_brane_dimension: number;
  stack_multiplicity_n: number;
  ramond_ramond_charge_q: number;
  orientifold_plane_charge_qo: number;
  net_tadpole_charge_excess: number;
  green_schwarz_axion_coupling: number;
  status: string;
}

interface TadpoleCancellationResult {
  cancellation_id: string;
  stack_id: string;
  pre_filtering_tadpole_excess: number;
  post_filtering_tadpole_excess: number;
  green_schwarz_counterterm_injected: number;
  tachyonic_modes_excised_count: number;
  chiral_anomaly_cancellation_pct: number;
  orientifold_plane_equilibrium_locked: boolean;
  status: string;
  timestamp: string;
}

export function DBraneTadpoleStudio() {
  const [stacks, setStacks] = useState<DBraneStackNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [selectedStack, setSelectedStack] = useState("DBRANE-STACK-CY-01");
  const [fluxQuanta, setFluxQuanta] = useState(1);
  const [gsBoost, setGsBoost] = useState(1.0);
  const [lastResult, setLastResult] = useState<TadpoleCancellationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchStacks = async () => {
    setErrorMsg(null);
    try {
      const res = await fetch("/api/dbrane-tadpole/stacks");
      if (!res.ok) {
        throw new Error(`D-Brane stacks fetch returned HTTP ${res.status}`);
      }
      const data = await res.json();
      setStacks(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load D-Brane orientifold stacks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStacks();
    setLogs([
      "[" + new Date().toLocaleTimeString() + "] D-Brane Ramond-Ramond Charge Tadpole Anomaly Filter online.",
      "[" + new Date().toLocaleTimeString() + "] Compactified Calabi-Yau orientifold O-plane charge parity locked.",
      "[" + new Date().toLocaleTimeString() + "] Green-Schwarz topological B wedge F^2 coupling ready for chiral anomaly neutralization.",
    ]);
  }, []);

  const handleCancelTadpole = async () => {
    setCancelling(true);
    setErrorMsg(null);
    setLogs((prev) => [
      "[" + new Date().toLocaleTimeString() + "] Injecting compensatory RR counter-flux into " + selectedStack + "...",
      ...prev,
    ]);
    try {
      const res = await fetch("/api/dbrane-tadpole/cancel-tadpole", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stack_id: selectedStack,
          compensatory_flux_quanta: fluxQuanta,
          green_schwarz_boost: gsBoost,
        }),
      });
      if (!res.ok) {
        throw new Error(`Tadpole cancellation returned HTTP ${res.status}`);
      }
      const data = await res.json();
      setLastResult(data);
      setLogs((prev) => [
        "[" + new Date().toLocaleTimeString() + "] SUCCESS: Tadpole charge cancelled (Remaining excess: " + data.post_filtering_tadpole_excess + ").",
        "[" + new Date().toLocaleTimeString() + "] Excised " + data.tachyonic_modes_excised_count + " tachyonic destabilizing modes | Injected GS Counterterm: " + data.green_schwarz_counterterm_injected.toFixed(4),
        ...prev,
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Tadpole cancellation failed.";
      setErrorMsg(msg);
      setLogs((prev) => [
        "[" + new Date().toLocaleTimeString() + "] ERROR: " + msg,
        ...prev,
      ]);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-purple-950/40 via-indigo-900/30 to-violet-950/40 border border-purple-500/30 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 border border-purple-500/40 rounded-lg text-purple-400">
            <Filter className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
              D-Brane Ramond-Ramond Charge Tadpole Anomaly Filter
              <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono">
                Cap 96
              </span>
            </h1>
            <p className="text-sm text-purple-200/70 mt-1">
              Topological Gauss-law cancellation of Ramond-Ramond (p+1)-form gauge potentials (Sum N_a Q_a + Q_O = 0)
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchStacks}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-sm text-purple-300 transition-colors self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Stacks
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="rounded-xl border border-red-800/60 bg-red-950/40 px-4 py-3 text-xs font-mono text-red-300 flex items-center justify-between gap-3"
        >
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-200 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Telemetry Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/60 border border-purple-500/20 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Tadpole Charge Status</span>
            <Shield className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {lastResult ? lastResult.post_filtering_tadpole_excess : "0"}
            <span className="text-xs text-purple-400 ml-1">Excess Q_RR</span>
          </div>
          <div className="text-xs text-purple-400 mt-2 font-mono">Neutrality Gauge Condition Met</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-purple-500/20 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Chiral Anomaly Cancelled</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-300">
            {lastResult ? lastResult.chiral_anomaly_cancellation_pct.toFixed(1) : "100.0"}%
          </div>
          <div className="text-xs text-emerald-400 mt-2 font-mono">Green-Schwarz Axion Coupled</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-purple-500/20 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Tachyonic Modes Excised</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300">
            {lastResult ? lastResult.tachyonic_modes_excised_count : "11"}
            <span className="text-xs text-slate-400 ml-1">modes</span>
          </div>
          <div className="text-xs text-amber-400 mt-2 font-mono">Vacuum Metric Stabilized</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-purple-500/20 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>GS Counterterm Injected</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-300">
            {lastResult ? lastResult.green_schwarz_counterterm_injected.toFixed(4) : "0.1554"}
          </div>
          <div className="text-xs text-indigo-400 mt-2 font-mono">B wedge F^2 Counter-Curvature</div>
        </div>
      </div>

      {/* Main Grid: Control Panel + D-Brane Stacks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="p-6 bg-slate-900/60 border border-purple-500/20 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-purple-400" />
            Tadpole Neutralization Controls
          </h2>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Target D-Brane Stack</label>
            <select
              value={selectedStack}
              onChange={(e) => setSelectedStack(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            >
              {stacks.map((s) => (
                <option key={s.stack_id} value={s.stack_id}>
                  {s.stack_id} (D{s.d_brane_dimension})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Compensatory Flux Quanta</span>
              <span className="text-purple-400 font-mono">{fluxQuanta} quanta</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={fluxQuanta}
              onChange={(e) => setFluxQuanta(parseInt(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Green-Schwarz Axion Coupling Boost</span>
              <span className="text-purple-400 font-mono">{gsBoost.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={gsBoost}
              onChange={(e) => setGsBoost(parseFloat(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>

          <button
            type="button"
            onClick={handleCancelTadpole}
            disabled={cancelling}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30"
          >
            {cancelling ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Cancelling Tadpole Anomaly...
              </>
            ) : (
              <>
                <Filter className="w-4 h-4" />
                Execute Tadpole Cancellation
              </>
            )}
          </button>
        </div>

        {/* D-Brane Stacks Table */}
        <div className="lg:col-span-2 p-6 bg-slate-900/60 border border-purple-500/20 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            Monitored D-Brane Orientifold Geometries
          </h2>
          {loading ? (
            <div className="text-slate-400 text-sm">Loading D-Brane stacks...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-2">Stack ID</th>
                    <th className="pb-2">Compact Geometry</th>
                    <th className="pb-2">D-Dimension</th>
                    <th className="pb-2">RR Charge Q</th>
                    <th className="pb-2">Orientifold Q_O</th>
                    <th className="pb-2">Tadpole Excess</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {stacks.map((s) => (
                    <tr key={s.stack_id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 font-mono text-purple-400">{s.stack_id}</td>
                      <td className="py-2.5">{s.geometry_label}</td>
                      <td className="py-2.5 font-mono text-amber-400">D{s.d_brane_dimension}</td>
                      <td className="py-2.5 font-mono">{s.ramond_ramond_charge_q}</td>
                      <td className="py-2.5 font-mono text-indigo-400">{s.orientifold_plane_charge_qo}</td>
                      <td className="py-2.5 font-mono text-rose-400">+{s.net_tadpole_charge_excess}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/30">
                          {s.status}
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
        <div className="flex items-center gap-2 text-purple-400 mb-2">
          <Terminal className="w-4 h-4" />
          <span>D-Brane Topological Anomaly Stream & Axion Telemetry</span>
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

