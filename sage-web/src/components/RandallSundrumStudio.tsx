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
  Sliders,
  Maximize2,
  AlertTriangle,
} from "lucide-react";

interface RSBraneNode {
  brane_id: string;
  facility_name: string;
  bulk_curvature_scale_k_gev: number;
  compactification_radius_rc_planck: number;
  radion_mass_gev: number;
  warp_factor_exponent_k_pi_rc: number;
  inter_brane_tension_ev4: number;
  hierarchy_suppression_ratio: number;
  status: string;
}

interface RadionStabilizationResult {
  stabilization_id: string;
  brane_id: string;
  target_compactification_radius_planck: number;
  goldberger_wise_scalar_vev_gev: number;
  effective_warp_factor: number;
  radion_mass_eigenvalue_gev: number;
  bulk_graviton_leakage_quench_db: number;
  trans_dimensional_metric_drift_pct: number;
  status: string;
  timestamp: string;
}

export function RandallSundrumStudio() {
  const [branes, setBranes] = useState<RSBraneNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [stabilizing, setStabilizing] = useState(false);
  const [selectedBrane, setSelectedBrane] = useState("RS-BRANE-GENEVA-01");
  const [targetRc, setTargetRc] = useState(36.8);
  const [fluxBoost, setFluxBoost] = useState(1.0);
  const [lastEvent, setLastEvent] = useState<RadionStabilizationResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchBranes = async () => {
    setErrorMsg(null);
    try {
      const res = await fetch("/api/randall-sundrum/branes");
      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errData.error || "Failed to load RS-1 5D brane nodes");
      }
      const data = await res.json();
      setBranes(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load RS-1 5D brane nodes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranes();
    setLogs([
      "[" + new Date().toLocaleTimeString() + "] 5D Warped Spacetime Randall-Sundrum (RS-1) Stabilizer online.",
      "[" + new Date().toLocaleTimeString() + "] AdS5 bulk curvature locked: k ~ 1.2e18 GeV.",
      "[" + new Date().toLocaleTimeString() + "] Goldberger-Wise scalar field boundary potentials pinned on UV/IR branes.",
    ]);
  }, []);

  const handleStabilize = async () => {
    setStabilizing(true);
    setErrorMsg(null);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Pumping Goldberger-Wise scalar potential at ${selectedBrane} (Target r_c: ${targetRc} l_Pl, Boost: ${fluxBoost}x)...`,
      ...prev,
    ]);

    try {
      const res = await fetch("/api/randall-sundrum/stabilize-radion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brane_id: selectedBrane,
          target_rc_planck: targetRc,
          scalar_flux_boost: fluxBoost,
        }),
      });

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errData.error || "Radion modulus stabilization failed");
      }
      const data: RadionStabilizationResult = await res.json();
      setLastEvent(data);
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] RADION MODULUS CLAMPED: ${data.stabilization_id}`,
        `[${new Date().toLocaleTimeString()}] Radion Mass: ${data.radion_mass_eigenvalue_gev.toFixed(1)} GeV | Warp Factor: ${data.effective_warp_factor.toExponential(2)}`,
        `[${new Date().toLocaleTimeString()}] Bulk Graviton Quench: ${data.bulk_graviton_leakage_quench_db.toFixed(1)} dB | Metric Drift: ${data.trans_dimensional_metric_drift_pct}%`,
        `[${new Date().toLocaleTimeString()}] Status: ${data.status}`,
        ...prev,
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Trans-dimensional bulk shear detected.";
      setErrorMsg(msg);
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] STABILIZATION ERROR: ${msg}`,
        ...prev,
      ]);
    } finally {
      setStabilizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 p-6 backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  5D Warped Spacetime Randall-Sundrum (RS-1) Brane Metric Stabilizer
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono">
                    Capability 93
                  </span>
                </h1>
                <p className="text-sm text-slate-400">
                  AdS5 Bulk Slice Geometry, Goldberger-Wise Radion Modulus Stabilization & Bulk Graviton Leakage Quenching
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchBranes}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-mono rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Sync RS-1 Branes
            </button>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              WARP FACTOR 10^-16
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="bg-red-950/30 border border-red-800/60 rounded-lg px-4 py-2.5 text-xs font-mono text-red-300 flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-red-300 hover:text-white underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Grid: Brane Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {branes.map((b) => (
          <div
            key={b.brane_id}
            onClick={() => setSelectedBrane(b.brane_id)}
            className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
              selectedBrane === b.brane_id
                ? "border-emerald-500 bg-emerald-950/30 shadow-lg shadow-emerald-950/50"
                : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-emerald-400 truncate">
                {b.brane_id}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                {b.status}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white truncate mb-2">
              {b.facility_name}
            </h3>

            <div className="space-y-1.5 text-xs text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>AdS Curvature k:</span>
                <span className="text-slate-200">{b.bulk_curvature_scale_k_gev.toExponential(1)} GeV</span>
              </div>
              <div className="flex justify-between">
                <span>Radion Modulus r_c:</span>
                <span className="text-emerald-300 font-bold">{b.compactification_radius_rc_planck} l_Pl</span>
              </div>
              <div className="flex justify-between">
                <span>Radion Mass:</span>
                <span className="text-white font-bold">{b.radion_mass_gev} GeV</span>
              </div>
              <div className="flex justify-between">
                <span>Hierarchy Ratio:</span>
                <span className="text-teal-300">{b.hierarchy_suppression_ratio.toExponential(1)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Control Panel & Radion Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Zap className="h-4 w-4 text-emerald-400" />
            Goldberger-Wise Actuator
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-mono">
                Target 5D Brane Pair
              </label>
              <select
                value={selectedBrane}
                onChange={(e) => setSelectedBrane(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-200 font-mono focus:border-emerald-500 focus:outline-none"
              >
                {branes.map((b) => (
                  <option key={b.brane_id} value={b.brane_id}>
                    {b.brane_id} ({b.radion_mass_gev} GeV)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Target Radius r_c:</span>
                <span className="text-emerald-300 font-bold">{targetRc.toFixed(1)} l_Pl</span>
              </div>
              <input
                type="range"
                min="20.0"
                max="50.0"
                step="0.2"
                value={targetRc}
                onChange={(e) => setTargetRc(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Goldberger-Wise Flux Boost:</span>
                <span className="text-emerald-300 font-bold">{fluxBoost.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={fluxBoost}
                onChange={(e) => setFluxBoost(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <button
              type="button"
              onClick={handleStabilize}
              disabled={stabilizing}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
            >
              <Sparkles className={`h-4 w-4 ${stabilizing ? "animate-spin" : ""}`} />
              {stabilizing ? "Clamping Radion Modulus..." : "Stabilize Radion Modulus"}
            </button>
          </div>
        </div>

        {/* Telemetry Display */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            5D Metric Telemetry
          </h2>

          {lastEvent ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Stabilization ID:</span>
                  <span className="text-emerald-300 font-bold">{lastEvent.stabilization_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Radion Mass Eigenvalue:</span>
                  <span className="text-white font-bold">{lastEvent.radion_mass_eigenvalue_gev.toFixed(1)} GeV</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bulk Graviton Quench:</span>
                  <span className="text-teal-400 font-bold">{lastEvent.bulk_graviton_leakage_quench_db.toFixed(1)} dB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Effective Warp Factor:</span>
                  <span className="text-emerald-300">{lastEvent.effective_warp_factor.toExponential(2)}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Scalar VEV:</span>
                  <span className="text-slate-200">{lastEvent.goldberger_wise_scalar_vev_gev.toExponential(2)} GeV</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Metric Drift:</span>
                  <span className="text-emerald-400 font-bold">{lastEvent.trans_dimensional_metric_drift_pct}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-slate-500 text-xs font-mono space-y-2">
              <Layers className="h-8 w-8 text-slate-700" />
              <span>Ready for 5D Randall-Sundrum stabilization cycle.</span>
            </div>
          )}
        </div>

        {/* Live Execution Terminal */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs flex flex-col h-[280px]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-emerald-400" />
              RS-1 Brane Console
            </span>
            <span className="text-[10px] text-emerald-400/80">ONLINE</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 text-slate-300 pr-1 select-text">
            {logs.map((log, index) => (
              <div key={index} className="leading-relaxed">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

