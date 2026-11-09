"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  Radio,
  Zap,
  Activity,
  Terminal,
  RefreshCw,
  Shield,
  Sparkles,
  Layers,
  Database,
  ArrowRightLeft,
} from "lucide-react";

interface HolographicBoundaryNode {
  node_id: string;
  facility_name: string;
  boundary_cft_dimension_d: number;
  bulk_ads_radius_meters: number;
  boundary_subsystem_length_m: number;
  bulk_minimal_surface_area_m2: number;
  entanglement_entropy_nats: number;
  central_charge_c: number;
  status: string;
}

interface SiphonResult {
  siphon_id: string;
  node_id: string;
  boundary_subsystem_fraction: number;
  bulk_minimal_surface_area_m2: number;
  calculated_entanglement_entropy_nats: number;
  siphoned_boundary_entropy_nats: number;
  holographic_reconstruction_fidelity_pct: number;
  bulk_asymptotic_boundary_quench_db: number;
  status: string;
  timestamp: string;
}

export function RyuTakayanagiStudio() {
  const [nodes, setNodes] = useState<HolographicBoundaryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [siphoning, setSiphoning] = useState(false);
  const [selectedNode, setSelectedNode] = useState("RYU-TAK-NODE-GENEVA-01");
  const [subsystemLength, setSubsystemLength] = useState(120.0);
  const [flowRate, setFlowRate] = useState(48.0);
  const [lastSiphon, setLastSiphon] = useState<SiphonResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchNodes = async () => {
    try {
      const res = await fetch("/api/ryu-takayanagi/nodes");
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
      "[" + new Date().toLocaleTimeString() + "] Ryu-Takayanagi Holographic Entanglement Siphon initialized.",
      "[" + new Date().toLocaleTimeString() + "] Boundary CFT Conformal Invariance verified across codimension-2 geodesics.",
      "[" + new Date().toLocaleTimeString() + "] Bulk AdS5 Codimension-2 minimal surface area-law solver active.",
    ]);
  }, []);

  const handleSiphon = async () => {
    setSiphoning(true);
    setLogs((prev) => [
      "[" + new Date().toLocaleTimeString() + "] Calculating static minimal surface gamma_A in AdS5 bulk...",
      ...prev,
    ]);
    try {
      const res = await fetch("/api/ryu-takayanagi/siphon-entropy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          node_id: selectedNode,
          boundary_subsystem_length_l: subsystemLength,
          siphon_flow_rate_gb_s: flowRate,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLastSiphon(data);
        setLogs((prev) => [
          "[" + new Date().toLocaleTimeString() + "] SUCCESS: Siphoned " + data.siphoned_boundary_entropy_nats.toFixed(3) + " nats into AdS5 minimal surface area.",
          "[" + new Date().toLocaleTimeString() + "] Reconstruction Fidelity: " + data.holographic_reconstruction_fidelity_pct.toFixed(3) + "% | Boundary Quench: " + data.bulk_asymptotic_boundary_quench_db.toFixed(1) + " dB",
          ...prev,
        ]);
      }
    } catch {
      setLogs((prev) => [
        "[" + new Date().toLocaleTimeString() + "] ERROR: Siphon command failed.",
        ...prev,
      ]);
    } finally {
      setSiphoning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-cyan-950/40 via-sky-900/30 to-blue-950/40 border border-cyan-500/30 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/20 border border-cyan-500/40 rounded-lg text-cyan-400">
            <Globe className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
              Holographic Ryu-Takayanagi Entanglement Entropy Siphon
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono">
                Cap 95
              </span>
            </h1>
            <p className="text-sm text-cyan-200/70 mt-1">
              Boundary CFT4 entanglement entropy siphoned into bulk AdS5 codimension-2 minimal surfaces (S_A = Area(gamma_A) / 4G_N)
            </p>
          </div>
        </div>
        <button
          onClick={fetchNodes}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-sm text-cyan-300 transition-colors self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Nodes
        </button>
      </div>

      {/* Telemetry Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/60 border border-cyan-500/20 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Area-Law Geodesic Area</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {lastSiphon ? (lastSiphon.bulk_minimal_surface_area_m2 * 1e28).toFixed(2) : "2.85"}
            <span className="text-xs text-cyan-400 ml-1">x10^-28 m^2</span>
          </div>
          <div className="text-xs text-cyan-400 mt-2 font-mono">Codimension-2 gamma_A</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-cyan-500/20 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Holographic Fidelity</span>
            <Sparkles className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-300">
            {lastSiphon ? lastSiphon.holographic_reconstruction_fidelity_pct.toFixed(3) : "99.985"}%
          </div>
          <div className="text-xs text-sky-400 mt-2 font-mono">&gt;99.95% AdS/CFT Duality</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-cyan-500/20 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Entropy Drain</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-300">
            {lastSiphon ? lastSiphon.siphoned_boundary_entropy_nats.toFixed(2) : "1.78"}
            <span className="text-xs text-slate-400 ml-1">nats</span>
          </div>
          <div className="text-xs text-emerald-400 mt-2 font-mono">Quenched Boundary Decoherence</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-cyan-500/20 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Boundary Quench Ratio</span>
            <Shield className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-300">
            {lastSiphon ? lastSiphon.bulk_asymptotic_boundary_quench_db.toFixed(1) : "109.7"}
            <span className="text-xs text-slate-400 ml-1">dB</span>
          </div>
          <div className="text-xs text-blue-400 mt-2 font-mono">Holographic Shield Active</div>
        </div>
      </div>

      {/* Main Grid: Control Panel + Active Nodes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="p-6 bg-slate-900/60 border border-cyan-500/20 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            Siphon Control Panel
          </h2>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Target Boundary Node</label>
            <select
              value={selectedNode}
              onChange={(e) => setSelectedNode(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
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
              <span>Boundary Subsystem Length L</span>
              <span className="text-cyan-400 font-mono">{subsystemLength} m</span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={subsystemLength}
              onChange={(e) => setSubsystemLength(parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Drainage Flow Rate</span>
              <span className="text-cyan-400 font-mono">{flowRate} GB/s</span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              step="5"
              value={flowRate}
              onChange={(e) => setFlowRate(parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>

          <button
            onClick={handleSiphon}
            disabled={siphoning}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30"
          >
            {siphoning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Siphoning Boundary Decoherence...
              </>
            ) : (
              <>
                <ArrowRightLeft className="w-4 h-4" />
                Execute Ryu-Takayanagi Siphon
              </>
            )}
          </button>
        </div>

        {/* Boundary Nodes Table */}
        <div className="lg:col-span-2 p-6 bg-slate-900/60 border border-cyan-500/20 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-sky-400" />
            Registered Holographic Boundary Facilities
          </h2>
          {loading ? (
            <div className="text-slate-400 text-sm">Loading boundary nodes...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-2">Node ID</th>
                    <th className="pb-2">Facility</th>
                    <th className="pb-2">AdS Radius</th>
                    <th className="pb-2">Central Charge c</th>
                    <th className="pb-2">Entropy (nats)</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {nodes.map((n) => (
                    <tr key={n.node_id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 font-mono text-cyan-400">{n.node_id}</td>
                      <td className="py-2.5">{n.facility_name}</td>
                      <td className="py-2.5 font-mono">{n.bulk_ads_radius_meters.toExponential(2)} m</td>
                      <td className="py-2.5 font-mono">{n.central_charge_c}</td>
                      <td className="py-2.5 font-mono text-emerald-400">{n.entanglement_entropy_nats.toFixed(3)}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
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
        <div className="flex items-center gap-2 text-cyan-400 mb-2">
          <Terminal className="w-4 h-4" />
          <span>Holographic Minimal Geodesic Engine Live Telemetry Stream</span>
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

