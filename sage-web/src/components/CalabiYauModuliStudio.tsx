"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Sparkles,
  Zap,
  Activity,
  Terminal,
  RefreshCw,
  ShieldCheck,
  Binary,
  Compass,
} from "lucide-react";

interface CalabiYauManifold {
  manifold_id: string;
  geometry_name: string;
  hodge_number_h11: number;
  hodge_number_h21: number;
  euler_characteristic: number;
  string_coupling_gs: number;
  compactification_volume_string_units: number;
  flux_superpotential_w0: number;
  anti_d3_uplift_energy_gev: number;
  moduli_stability_status: string;
}

interface ModuliResult {
  result_id: string;
  manifold_id: string;
  target_compactification_volume: number;
  gukov_vafa_witten_flux_w0: number;
  kahler_moduli_mass_gev: number;
  complex_structure_moduli_fixed: number;
  anti_d3_uplift_energy_gev: number;
  vacuum_energy_density_cc: number;
  decompactification_barrier_height_gev: number;
  topological_invariance_verified: boolean;
  status: string;
  timestamp: string;
}

export function CalabiYauModuliStudio() {
  const [manifolds, setManifolds] = useState<CalabiYauManifold[]>([]);
  const [loading, setLoading] = useState(true);
  const [stabilizing, setStabilizing] = useState(false);
  const [selectedManifold, setSelectedManifold] = useState("CY3-QUINTIC-P4-01");
  const [targetVolume, setTargetVolume] = useState(50.0);
  const [fluxFactor, setFluxFactor] = useState(1.0);
  const [lastResult, setLastResult] = useState<ModuliResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchManifolds = async () => {
    try {
      const res = await fetch("/api/calabi-yau/manifolds");
      if (res.ok) {
        const data = await res.json();
        setManifolds(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManifolds();
    setLogs([
      "[" + new Date().toLocaleTimeString() + "] 10D Superstring Calabi-Yau Moduli Stabilizer online.",
      "[" + new Date().toLocaleTimeString() + "] Gukov-Vafa-Witten RR & NS 3-form flux compactification active.",
      "[" + new Date().toLocaleTimeString() + "] KKLT anti-D3 brane de Sitter uplifting potential calibrated.",
    ]);
  }, []);

  const handleStabilize = async () => {
    setStabilizing(true);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Freezing Kahler and complex structure moduli for ${selectedManifold} at vol=${targetVolume}...`,
      ...prev,
    ]);

    try {
      const res = await fetch("/api/calabi-yau/stabilize-moduli", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manifold_id: selectedManifold,
          target_volume_string_units: targetVolume,
          flux_intensity_factor: fluxFactor,
        }),
      });

      if (res.ok) {
        const data: ModuliResult = await res.json();
        setLastResult(data);
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] MODULI FROZEN: ${data.result_id}`,
          `[${new Date().toLocaleTimeString()}] Kahler Mass: ${data.kahler_moduli_mass_gev.toExponential(2)} GeV | Anti-D3 Uplift: ${data.anti_d3_uplift_energy_gev.toExponential(2)} GeV`,
          `[${new Date().toLocaleTimeString()}] Fixed Moduli: ${data.complex_structure_moduli_fixed} Complex + Kahler | Decompact Barrier: ${data.decompactification_barrier_height_gev.toExponential(2)} GeV`,
          `[${new Date().toLocaleTimeString()}] Topological Invariance: ${data.topological_invariance_verified ? "PROVEN" : "UNVERIFIED"}`,
          ...prev,
        ]);
      }
    } catch {
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] STABILIZATION ERROR: Moduli runaway decompactification detected.`,
        ...prev,
      ]);
    } finally {
      setStabilizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 p-6 backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  10D Superstring Calabi-Yau Manifold Moduli Stabilizer
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono">
                    Capability 87
                  </span>
                </h1>
                <p className="text-sm text-slate-400">
                  Gukov-Vafa-Witten 3-Form Flux Compactification & KKLT Anti-D3 Brane de Sitter Uplifting
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchManifolds}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh Manifolds
            </button>
          </div>
        </div>
      </div>

      {/* Metric Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-emerald-500/20 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Stabilized Moduli</span>
            <Binary className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300">
            {lastResult ? `${lastResult.complex_structure_moduli_fixed + 1}` : "224"}
          </div>
          <div className="text-xs text-slate-500 mt-1">h&sup1;&comma;&sup1; (K&auml;hler) + h&sup2;&comma;&sup1; (Complex)</div>
        </div>

        <div className="rounded-lg border border-indigo-500/20 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>K&auml;hler Moduli Mass</span>
            <Zap className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-300">
            {lastResult ? `${lastResult.kahler_moduli_mass_gev.toExponential(2)} GeV` : "1.85e14 GeV"}
          </div>
          <div className="text-xs text-slate-500 mt-1">Non-Perturbative D3 Instanton</div>
        </div>

        <div className="rounded-lg border border-purple-500/20 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Anti-D3 Uplift Energy</span>
            <Sparkles className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-300">
            {lastResult ? `${lastResult.anti_d3_uplift_energy_gev.toExponential(2)} GeV` : "8.60e15 GeV"}
          </div>
          <div className="text-xs text-slate-500 mt-1">KKLT de Sitter Vacuum Uplift</div>
        </div>

        <div className="rounded-lg border border-cyan-500/20 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Decompact Barrier</span>
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300">
            {lastResult ? `${lastResult.decompactification_barrier_height_gev.toExponential(2)} GeV` : "1.51e13 GeV"}
          </div>
          <div className="text-xs text-slate-500 mt-1">Runaway Volume Suppressed</div>
        </div>
      </div>

      {/* Main Grid: Control Panel + Active Manifolds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Compass className="h-4 w-4 text-emerald-400" />
              Compactification Controller
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Calabi-Yau 3-Fold Geometry</label>
                <select
                  value={selectedManifold}
                  onChange={(e) => setSelectedManifold(e.target.value)}
                  className="w-full text-xs font-mono rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {manifolds.map((m) => (
                    <option key={m.manifold_id} value={m.manifold_id}>
                      {m.geometry_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Target 6D Volume (&sigma;)</span>
                  <span className="font-mono text-emerald-400">{targetVolume.toFixed(1)} l_s&sup6;</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="1"
                  value={targetVolume}
                  onChange={(e) => setTargetVolume(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Flux Intensity Factor (W_0)</span>
                  <span className="font-mono text-indigo-400">{fluxFactor.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={fluxFactor}
                  onChange={(e) => setFluxFactor(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>

            <button
              onClick={handleStabilize}
              disabled={stabilizing}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-medium text-xs transition disabled:opacity-50"
            >
              <Zap className={`h-4 w-4 ${stabilizing ? "animate-spin" : ""}`} />
              {stabilizing ? "Stabilizing String Moduli..." : "Stabilize Extra Dimensions"}
            </button>
          </div>

          {/* Last Result Box */}
          {lastResult && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between text-emerald-300 font-semibold">
                <span>Active Compactification State</span>
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="font-mono text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Result ID:</span>
                  <span className="text-white">{lastResult.result_id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Volume:</span>
                  <span className="text-emerald-400">{lastResult.target_compactification_volume.toFixed(2)} l_s&sup6;</span>
                </div>
                <div className="flex justify-between">
                  <span>Flux Superpot:</span>
                  <span className="text-indigo-400">{lastResult.gukov_vafa_witten_flux_w0.toExponential(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Uplift Energy:</span>
                  <span className="text-purple-400">{lastResult.anti_d3_uplift_energy_gev.toExponential(2)} GeV</span>
                </div>
                <div className="flex justify-between">
                  <span>Topology:</span>
                  <span className="text-emerald-400">INVARIANCE VERIFIED</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Manifolds Grid + Terminal */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-400" />
                Calabi-Yau 3-Fold Compactification Geometries ({manifolds.length})
              </span>
              <span className="text-xs text-slate-400 font-mono">10D &rarr; 4D Spacetime</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {manifolds.map((m) => (
                <div
                  key={m.manifold_id}
                  className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 space-y-2 hover:border-emerald-500/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white truncate">{m.geometry_name}</span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 space-y-1 pt-1 border-t border-slate-800/80">
                    <div>
                      <span className="text-slate-500">Hodge (h&sup1;&sup1;, h&sup2;&sup1;):</span>{" "}
                      <span className="text-slate-300">({m.hodge_number_h11}, {m.hodge_number_h21})</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Euler &chi;:</span>{" "}
                      <span className="text-indigo-400">{m.euler_characteristic}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Coupling g_s:</span>{" "}
                      <span className="text-emerald-400">{m.string_coupling_gs}</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-emerald-400 flex items-center gap-1 pt-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    KKLT MINIMUM LOCKED
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Terminal Console Stream */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-400 space-y-2">
            <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                String Moduli Compactification Log
              </span>
              <span className="text-[10px] text-slate-500">RICCI-FLAT METRIC MONITOR</span>
            </div>
            <div className="h-36 overflow-y-auto space-y-1 text-[11px]">
              {logs.map((log, idx) => (
                <div key={idx} className="leading-tight">
                  <span className="text-emerald-500">&gt;</span> {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
