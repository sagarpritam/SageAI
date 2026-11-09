"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingDown,
  Radio,
  Zap,
  Activity,
  Terminal,
  RefreshCw,
  Shield,
  Sparkles,
  Database,
  Layers,
  CheckCircle,
} from "lucide-react";

interface RGScaleNode {
  node_id: string;
  facility_name: string;
  cutoff_scale_k_gev: number;
  dimensionless_newton_g: number;
  dimensionless_cosmo_lambda: number;
  uv_fixed_point_attractor_g_star: number;
  uv_fixed_point_attractor_lambda_star: number;
  wetterich_morris_flow_rate: number;
  status: string;
}

interface RGStabilizationResult {
  stabilization_id: string;
  node_id: string;
  target_cutoff_scale_k_gev: number;
  pre_flow_divergence_measure: number;
  post_flow_divergence_measure: number;
  uv_fixed_point_reach_pct: number;
  anomalous_graviton_dimension_eta: number;
  effective_average_action_gamma: number;
  status: string;
  timestamp: string;
}

export function AsymptoticSafetyStudio() {
  const [nodes, setNodes] = useState<RGScaleNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [stabilizing, setStabilizing] = useState(false);
  const [selectedNode, setSelectedNode] = useState("RG-NODE-REUTER-CERN-01");
  const [scaleK, setScaleK] = useState(1.22);
  const [regulatorShape, setRegulatorShape] = useState(1.0);
  const [lastResult, setLastResult] = useState<RGStabilizationResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchNodes = async () => {
    try {
      const res = await fetch("/api/asymptotic-safety/nodes");
      if (res.ok) {
        const data = await res.json();
        setNodes(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();
    setLogs([
      "[" + new Date().toLocaleTimeString() + "] Asymptotically Safe Renormalization Group Flow Stabilizer online.",
      "[" + new Date().toLocaleTimeString() + "] Wetterich-Morris Exact Functional RG flow solver calibrated.",
      "[" + new Date().toLocaleTimeString() + "] Reuter UV Fixed Point Attractor locked (g_* = 0.707, lambda_* = 0.193).",
    ]);
  }, []);

  const handleStabilizeFlow = async () => {
    setStabilizing(true);
    setLogs((prev) => [
      "[" + new Date().toLocaleTimeString() + "] Integrating FRG flow equation toward Reuter fixed point at " + scaleK + "x10^19 GeV...",
      ...prev,
    ]);
    try {
      const res = await fetch("/api/asymptotic-safety/stabilize-flow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          node_id: selectedNode,
          flow_momentum_k_gev: scaleK * 1e19,
          regulator_shape_parameter: regulatorShape,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLastResult(data);
        setLogs((prev) => [
          "[" + new Date().toLocaleTimeString() + "] SUCCESS: Reuter UV Fixed Point Attained (" + data.uv_fixed_point_reach_pct.toFixed(3) + "%). Divergence: " + data.post_flow_divergence_measure + ".",
          "[" + new Date().toLocaleTimeString() + "] Anomalous Graviton Dimension: eta = " + data.anomalous_graviton_dimension_eta.toFixed(4) + " | Effective Action: Gamma = " + data.effective_average_action_gamma.toFixed(3),
          ...prev,
        ]);
      }
    } catch {
      setLogs((prev) => [
        "[" + new Date().toLocaleTimeString() + "] ERROR: RG flow stabilization failed.",
        ...prev,
      ]);
    } finally {
      setStabilizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-emerald-950/40 via-teal-900/30 to-cyan-950/40 border border-emerald-500/30 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-400">
            <TrendingDown className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
              Asymptotically Safe Renormalization Group Flow Stabilizer
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono">
                Cap 98
              </span>
            </h1>
            <p className="text-sm text-emerald-200/70 mt-1">
              Wetterich-Morris functional RG solver steering dimensionless couplings (g_k, lambda_k) to Reuter UV Fixed Point
            </p>
          </div>
        </div>
        <button
          onClick={fetchNodes}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-sm text-emerald-300 transition-colors self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Nodes
        </button>
      </div>

      {/* Telemetry Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/60 border border-emerald-500/20 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Reuter Fixed Point Reach</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-300">
            {lastResult ? lastResult.uv_fixed_point_reach_pct.toFixed(3) : "99.982"}%
          </div>
          <div className="text-xs text-emerald-400 mt-2 font-mono">g* = 0.707 | lambda* = 0.193</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-emerald-500/20 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>UV Divergence Measure</span>
            <Shield className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {lastResult ? lastResult.post_flow_divergence_measure.toFixed(4) : "0.0000"}
          </div>
          <div className="text-xs text-teal-400 mt-2 font-mono">Zero Ghost Metric Invariance</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-emerald-500/20 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Anomalous Graviton Dim</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-300">
            {lastResult ? lastResult.anomalous_graviton_dimension_eta.toFixed(4) : "-0.9980"}
          </div>
          <div className="text-xs text-cyan-400 mt-2 font-mono">eta_graviton &lt; 0 Scale Ward ID</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-emerald-500/20 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Cutoff Momentum Scale k</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {scaleK.toFixed(2)}
            <span className="text-xs text-emerald-400 ml-1">x10^19 GeV</span>
          </div>
          <div className="text-xs text-emerald-400 mt-2 font-mono">Trans-Planckian RG Flow</div>
        </div>
      </div>

      {/* Main Grid: Control Panel + Registered RG Nodes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="p-6 bg-slate-900/60 border border-emerald-500/20 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400" />
            RG Flow Controller
          </h2>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Target RG Scale Node</label>
            <select
              value={selectedNode}
              onChange={(e) => setSelectedNode(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              {nodes.map((n) => (
                <option key={n.node_id} value={n.node_id}>
                  {n.node_id} ({n.facility_name.split(" ")[0]})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Cutoff Scale k (x10^19 GeV)</span>
              <span className="text-emerald-400 font-mono">{scaleK.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={scaleK}
              onChange={(e) => setScaleK(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Wetterich-Morris Regulator Shape Factor</span>
              <span className="text-emerald-400 font-mono">{regulatorShape.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={regulatorShape}
              onChange={(e) => setRegulatorShape(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <button
            onClick={handleStabilizeFlow}
            disabled={stabilizing}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
          >
            {stabilizing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Integrating Wetterich-Morris Flow...
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4" />
                Stabilize RG Fixed Point Flow
              </>
            )}
          </button>
        </div>

        {/* Nodes Table */}
        <div className="lg:col-span-2 p-6 bg-slate-900/60 border border-emerald-500/20 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-teal-400" />
            Registered Trans-Planckian Flow Regulators
          </h2>
          {loading ? (
            <div className="text-slate-400 text-sm">Loading RG nodes...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-2">Node ID</th>
                    <th className="pb-2">Facility</th>
                    <th className="pb-2">Scale k (GeV)</th>
                    <th className="pb-2">g_k</th>
                    <th className="pb-2">lambda_k</th>
                    <th className="pb-2">Flow Rate</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {nodes.map((n) => (
                    <tr key={n.node_id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 font-mono text-emerald-400">{n.node_id}</td>
                      <td className="py-2.5">{n.facility_name}</td>
                      <td className="py-2.5 font-mono">{n.cutoff_scale_k_gev.toExponential(2)}</td>
                      <td className="py-2.5 font-mono text-cyan-400">{n.dimensionless_newton_g.toFixed(3)}</td>
                      <td className="py-2.5 font-mono text-teal-400">{n.dimensionless_cosmo_lambda.toFixed(3)}</td>
                      <td className="py-2.5 font-mono text-amber-400">{n.wetterich_morris_flow_rate.toFixed(3)}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                          {n.status}
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
        <div className="flex items-center gap-2 text-emerald-400 mb-2">
          <Terminal className="w-4 h-4" />
          <span>Asymptotic Safety Functional RG Live Telemetry Stream</span>
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
