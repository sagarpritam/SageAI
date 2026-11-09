"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Radio,
  Zap,
  Activity,
  Terminal,
  RefreshCw,
  Shield,
  Sparkles,
  Lock,
  EyeOff,
} from "lucide-react";

interface SpacetimeCurvatureNode {
  node_id: string;
  target_singularity_label: string;
  black_hole_mass_solar: number;
  spin_parameter_a_over_m: number;
  charge_parameter_q_over_m: number;
  outer_horizon_radius_km: number;
  kretschmann_scalar_curvature_m4: number;
  naked_singularity_risk_level: string;
  status: string;
}

interface CensorshipEnforcementResult {
  enforcement_id: string;
  node_id: string;
  pre_enforcement_extremality_ratio: number;
  post_enforcement_extremality_ratio: number;
  outer_horizon_expansion_meters: number;
  angular_momentum_damped_j_s: number;
  trapped_surface_closed: boolean;
  naked_singularity_prevented: boolean;
  status: string;
  timestamp: string;
}

export function CosmicCensorshipStudio() {
  const [nodes, setNodes] = useState<SpacetimeCurvatureNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [enforcing, setEnforcing] = useState(false);
  const [selectedNode, setSelectedNode] = useState("CENSORSHIP-NODE-CYGNUS-X1-02");
  const [overspinTorque, setOverspinTorque] = useState(2.5);
  const [dampingGain, setDampingGain] = useState(1.0);
  const [lastEvent, setLastEvent] = useState<CensorshipEnforcementResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchNodes = async () => {
    try {
      const res = await fetch("/api/cosmic-censorship/singularities");
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
      "[" + new Date().toLocaleTimeString() + "] Penrose Cosmic Censorship Spacetime Horizon Enforcer active.",
      "[" + new Date().toLocaleTimeString() + "] Kerr-Newman extremality boundaries monitored: a^2 + Q^2 <= M^2.",
      "[" + new Date().toLocaleTimeString() + "] Trapped causal surface closure verified across 3 monitored spacetime nodes.",
    ]);
  }, []);

  const handleEnforce = async () => {
    setEnforcing(true);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Neutralizing overspin anomaly at ${selectedNode} (+${overspinTorque}% torque, gain ${dampingGain}x)...`,
      ...prev,
    ]);

    try {
      const res = await fetch("/api/cosmic-censorship/enforce-horizon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          node_id: selectedNode,
          simulated_overspin_torque_pct: overspinTorque,
          compensatory_damping_gain: dampingGain,
        }),
      });

      if (res.ok) {
        const data: CensorshipEnforcementResult = await res.json();
        setLastEvent(data);
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] HORIZON EXPANDED & CLOAKED: ${data.enforcement_id}`,
          `[${new Date().toLocaleTimeString()}] Extremality Parameter: ${data.pre_enforcement_extremality_ratio.toFixed(4)} -> ${data.post_enforcement_extremality_ratio.toFixed(4)} (Clamped)`,
          `[${new Date().toLocaleTimeString()}] Horizon Expansion: +${data.outer_horizon_expansion_meters.toFixed(1)} m | Damped J: ${data.angular_momentum_damped_j_s.toExponential(2)} J·s`,
          `[${new Date().toLocaleTimeString()}] Naked Singularity Prevented: ${data.naked_singularity_prevented ? "CONFIRMED" : "FAILED"}`,
          ...prev,
        ]);
      }
    } catch {
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] ENFORCEMENT ERROR: Naked curvature divergence detected.`,
        ...prev,
      ]);
    } finally {
      setEnforcing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-slate-900 to-rose-950/40 p-6 backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <EyeOff className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  Penrose Cosmic Censorship Spacetime Horizon Enforcer
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono">
                    Capability 94
                  </span>
                </h1>
                <p className="text-sm text-slate-400">
                  Kerr-Newman Extremality Monitoring, Naked Singularity Neutralization & Trapped Event Horizon Expansion
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchNodes}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-mono rounded-lg border border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Sync Curvature Nodes
            </button>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
              HORIZONS TRAPPED
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Singularity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {nodes.map((n) => (
          <div
            key={n.node_id}
            onClick={() => setSelectedNode(n.node_id)}
            className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
              selectedNode === n.node_id
                ? "border-purple-500 bg-purple-950/30 shadow-lg shadow-purple-950/50"
                : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-purple-400 truncate">
                {n.node_id}
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  n.naked_singularity_risk_level === "CRITICAL"
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    : n.naked_singularity_risk_level === "ELEVATED"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                }`}
              >
                {n.naked_singularity_risk_level}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white truncate mb-2">
              {n.target_singularity_label}
            </h3>

            <div className="space-y-1.5 text-xs text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Mass (Solar):</span>
                <span className="text-slate-200">{n.black_hole_mass_solar.toExponential(2)} M_Sun</span>
              </div>
              <div className="flex justify-between">
                <span>Spin a/M:</span>
                <span className="text-purple-300 font-bold">{n.spin_parameter_a_over_m.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span>Charge Q/M:</span>
                <span className="text-slate-200">{n.charge_parameter_q_over_m.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Horizon Radius:</span>
                <span className="text-emerald-400">{n.outer_horizon_radius_km.toExponential(2)} km</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Control Panel & Enforcement Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-400" />
            Censorship Torque Damping Actuator
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-mono">
                Target Singularity Curvature Node
              </label>
              <select
                value={selectedNode}
                onChange={(e) => setSelectedNode(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-200 font-mono focus:border-purple-500 focus:outline-none"
              >
                {nodes.map((n) => (
                  <option key={n.node_id} value={n.node_id}>
                    {n.node_id} (a/M = {n.spin_parameter_a_over_m})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Simulated Overspin Torque:</span>
                <span className="text-rose-300 font-bold">+{overspinTorque.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="8.0"
                step="0.5"
                value={overspinTorque}
                onChange={(e) => setOverspinTorque(parseFloat(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Compensatory Damping Gain:</span>
                <span className="text-purple-300 font-bold">{dampingGain.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={dampingGain}
                onChange={(e) => setDampingGain(parseFloat(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>

            <button
              onClick={handleEnforce}
              disabled={enforcing}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30"
            >
              <Sparkles className={`h-4 w-4 ${enforcing ? "animate-spin" : ""}`} />
              {enforcing ? "Enforcing Cosmic Censorship..." : "Enforce Horizon Cloaking"}
            </button>
          </div>
        </div>

        {/* Telemetry Display */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Activity className="h-4 w-4 text-purple-400" />
            Spacetime Horizon Telemetry
          </h2>

          {lastEvent ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-500/30 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Enforcement ID:</span>
                  <span className="text-purple-300 font-bold">{lastEvent.enforcement_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Extremality Ratio:</span>
                  <span className="text-white font-bold">{lastEvent.post_enforcement_extremality_ratio.toFixed(4)} (&lt; 1.0)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Horizon Expansion:</span>
                  <span className="text-emerald-400 font-bold">+{lastEvent.outer_horizon_expansion_meters.toFixed(1)} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Trapped Surface Closed:</span>
                  <span className="text-purple-300">{lastEvent.trapped_surface_closed ? "YES (NO LEAKAGE)" : "NO"}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Angular Momentum Damped:</span>
                  <span className="text-indigo-300">{lastEvent.angular_momentum_damped_j_s.toExponential(2)} J·s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Naked Singularity:</span>
                  <span className="text-emerald-400 font-bold">{lastEvent.naked_singularity_prevented ? "PREVENTED" : "BREACH"}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-slate-500 text-xs font-mono space-y-2">
              <ShieldAlert className="h-8 w-8 text-slate-700" />
              <span>Ready for Penrose cosmic censorship enforcement cycle.</span>
            </div>
          )}
        </div>

        {/* Live Execution Terminal */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs flex flex-col h-[280px]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-purple-400" />
              Censorship Console
            </span>
            <span className="text-[10px] text-purple-400/80">ONLINE</span>
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
