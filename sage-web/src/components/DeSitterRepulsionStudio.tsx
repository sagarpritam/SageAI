"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  Compass,
  Zap,
  Activity,
  Terminal,
  RefreshCw,
  Shield,
  Sparkles,
  Radio,
} from "lucide-react";

interface DeSitterNode {
  grid_id: string;
  facility_name: string;
  latitude: number;
  longitude: number;
  altitude_m: number;
  metamaterial_dipole_density_cm3: number;
  resonant_polarizability_alpha0: number;
  effective_screening_radius_m: number;
  de_sitter_horizon_coupling: number;
  vacuum_repulsion_force_nn: number;
  status: string;
}

interface DeSitterEvent {
  event_id: string;
  grid_id: string;
  target_metric_region: string;
  polarizability_tensor_trace: number;
  casimir_polder_potential_ev: number;
  repulsive_metric_force_nn: number;
  gibbons_hawking_temp_nK: number;
  curvature_screening_efficiency_pct: number;
  cosmological_expansion_decoupled: boolean;
  status: string;
  timestamp: string;
}

export function DeSitterRepulsionStudio() {
  const [nodes, setNodes] = useState<DeSitterNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedNode, setSelectedNode] = useState("DESITTER-GRID-MAUNA-KEA-01");
  const [targetRegion, setTargetRegion] = useState("LOCAL_INERTIAL_FRAME_SEC_1");
  const [couplingGain, setCouplingGain] = useState(1.0);
  const [lastEvent, setLastEvent] = useState<DeSitterEvent | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchNodes = async () => {
    setErrorMsg(null);
    try {
      const res = await fetch("/api/desitter-repulsion/grids");
      if (!res.ok) {
        throw new Error(`de Sitter grid fetch returned HTTP ${res.status}`);
      }
      const data = await res.json();
      setNodes(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load de Sitter repulsion grids.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();
    setLogs([
      "[" + new Date().toLocaleTimeString() + "] Cosmological de Sitter Horizon Casimir-Polder Grid online.",
      "[" + new Date().toLocaleTimeString() + "] Gibbons-Hawking event horizon boundary condition locked (T_dS ~ 2.4e-30 K).",
      "[" + new Date().toLocaleTimeString() + "] Metamaterial resonant dipole arrays polarized for metric barrier repulsion.",
    ]);
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setErrorMsg(null);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Pumping resonant dipole potential at ${selectedNode} with gain ${couplingGain}x...`,
      ...prev,
    ]);

    try {
      const res = await fetch("/api/desitter-repulsion/generate-repulsion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grid_id: selectedNode,
          target_metric_region: targetRegion,
          coupling_gain: couplingGain,
        }),
      });

      if (!res.ok) {
        throw new Error(`Repulsion generation returned HTTP ${res.status}`);
      }
      const data: DeSitterEvent = await res.json();
      setLastEvent(data);
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] REPULSION BARRIER ACTIVE: ${data.event_id}`,
        `[${new Date().toLocaleTimeString()}] Repulsive Metric Force: ${data.repulsive_metric_force_nn.toFixed(2)} nN | Screening: ${data.curvature_screening_efficiency_pct}%`,
        `[${new Date().toLocaleTimeString()}] Casimir-Polder Potential: ${data.casimir_polder_potential_ev.toExponential(4)} eV`,
        `[${new Date().toLocaleTimeString()}] Cosmic Expansion Decoupled: ${data.cosmological_expansion_decoupled ? "CONFIRMED" : "PENDING"}`,
        ...prev,
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Metric phase incoherence detected.";
      setErrorMsg(msg);
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] GENERATION ERROR: ${msg}`,
        ...prev,
      ]);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900 to-cyan-950/40 p-6 backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  Cosmological de Sitter Horizon Casimir-Polder Repulsion Grid
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono">
                    Capability 86
                  </span>
                </h1>
                <p className="text-sm text-slate-400">
                  Gibbons-Hawking Horizon Dipole Shielding & Retarded Vacuum Metric Repulsion Barrier
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchNodes}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh Grid
            </button>
          </div>
        </div>
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

      {/* Metric Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-amber-500/20 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Repulsive Force</span>
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300">
            {lastEvent ? `${lastEvent.repulsive_metric_force_nn.toFixed(2)} nN` : "54.20 nN"}
          </div>
          <div className="text-xs text-slate-500 mt-1">Casimir-Polder Retarded Vector</div>
        </div>

        <div className="rounded-lg border border-cyan-500/20 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Screening Efficiency</span>
            <Shield className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300">
            {lastEvent ? `${lastEvent.curvature_screening_efficiency_pct.toFixed(2)}%` : "99.65%"}
          </div>
          <div className="text-xs text-slate-500 mt-1">Expansion Shear Quenched</div>
        </div>

        <div className="rounded-lg border border-purple-500/20 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Dipole Polarizability</span>
            <Sparkles className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-300">
            9.12e-39
          </div>
          <div className="text-xs text-slate-500 mt-1">C&middot;m&sup2; / V Resonant Lattices</div>
        </div>

        <div className="rounded-lg border border-emerald-500/20 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Cosmic Decoupling</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300">
            DECOUPLED
          </div>
          <div className="text-xs text-slate-500 mt-1">Inertial Frame Preserved</div>
        </div>
      </div>

      {/* Main Grid: Control Panel + Active Nodes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Compass className="h-4 w-4 text-amber-400" />
              Horizon Dipole Controller
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Grid Array Node</label>
                <select
                  value={selectedNode}
                  onChange={(e) => setSelectedNode(e.target.value)}
                  className="w-full text-xs font-mono rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {nodes.map((n) => (
                    <option key={n.grid_id} value={n.grid_id}>
                      {n.facility_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Spacetime Region</label>
                <input
                  type="text"
                  value={targetRegion}
                  onChange={(e) => setTargetRegion(e.target.value)}
                  className="w-full text-xs font-mono rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Coupling Gain Factor</span>
                  <span className="font-mono text-amber-400">{couplingGain.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.05"
                  value={couplingGain}
                  onChange={(e) => setCouplingGain(parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-600 to-cyan-600 hover:from-amber-500 hover:to-cyan-500 text-white font-medium text-xs transition disabled:opacity-50"
            >
              <Zap className={`h-4 w-4 ${generating ? "animate-spin" : ""}`} />
              {generating ? "Synthesizing de Sitter Barrier..." : "Generate Repulsion Barrier"}
            </button>
          </div>

          {/* Last Event Summary */}
          {lastEvent && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between text-amber-300 font-semibold">
                <span>Active Repulsion Event</span>
                <Radio className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="font-mono text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Event ID:</span>
                  <span className="text-white">{lastEvent.event_id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Force:</span>
                  <span className="text-amber-400">{lastEvent.repulsive_metric_force_nn.toFixed(2)} nN</span>
                </div>
                <div className="flex justify-between">
                  <span>Screening:</span>
                  <span className="text-cyan-400">{lastEvent.curvature_screening_efficiency_pct.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Potential:</span>
                  <span className="text-purple-400">{lastEvent.casimir_polder_potential_ev.toExponential(3)} eV</span>
                </div>
                <div className="flex justify-between">
                  <span>Horizon State:</span>
                  <span className="text-emerald-400">EXPANSION DECOUPLED</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Nodes Grid + Terminal */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-amber-400" />
                Cosmological Horizon Grid Arrays ({nodes.length} Nodes)
              </span>
              <span className="text-xs text-slate-400 font-mono">&Lambda; = 1.1056e-52 m&sup2;</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {nodes.map((n) => (
                <div
                  key={n.grid_id}
                  className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 space-y-2 hover:border-amber-500/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white truncate">{n.facility_name}</span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 space-y-1 pt-1 border-t border-slate-800/80">
                    <div>
                      <span className="text-slate-500">Radius:</span>{" "}
                      <span className="text-slate-300">{n.effective_screening_radius_m}m</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Force:</span>{" "}
                      <span className="text-amber-400">{n.vacuum_repulsion_force_nn} nN</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Coupling:</span>{" "}
                      <span className="text-cyan-400">{(n.de_sitter_horizon_coupling * 100).toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-emerald-400 flex items-center gap-1 pt-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    HORIZON LOCKED
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Terminal Console Stream */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-400 space-y-2">
            <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-amber-400" />
                de Sitter Horizon Metamaterial Stream
              </span>
              <span className="text-[10px] text-slate-500">REALTIME TELEMETRY</span>
            </div>
            <div className="h-36 overflow-y-auto space-y-1 text-[11px]">
              {logs.map((log, idx) => (
                <div key={idx} className="leading-tight">
                  <span className="text-amber-500">&gt;</span> {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
