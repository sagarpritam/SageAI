"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  ShieldCheck,
  Zap,
  RefreshCw,
  Terminal,
  Layers,
  Compass,
  Radio,
  Eye,
  AlertTriangle,
  Flame,
} from "lucide-react";

interface GravNode {
  node_id: string;
  facility_name: string;
  latitude: number;
  longitude: number;
  altitude_m: number;
  condensate_atom_type: string;
  trap_temperature_nk: number;
  interferometer_baseline_m: number;
  gravity_gradient_sensitivity_eotvos: number;
  holographic_entropy_nats: number;
  status: string;
}

interface DistortionObservation {
  observation_id: string;
  node_id: string;
  target_spacetime_region: string;
  metric_perturbation_delta_g: number;
  riemann_curvature_scalar_r: number;
  holographic_entanglement_entropy_nats: number;
  topological_defect_detected: boolean;
  defect_classification: string | null;
  anomalous_mass_equivalent_kg: number;
  confidence_score: number;
  status: string;
  timestamp: string;
}

export function QuantumGravitationalStudio() {
  const [nodes, setNodes] = useState<GravNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [measuring, setMeasuring] = useState(false);
  const [selectedNode, setSelectedNode] = useState("QGRAV-NODE-GENEVA-01");
  const [targetRegion, setTargetRegion] = useState("LOCAL_EARTH_GEOID_SECTOR_7");
  const [integrationTime, setIntegrationTime] = useState(30.0);
  const [lastObs, setLastObs] = useState<DistortionObservation | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchNodes = async () => {
    setErrorMsg(null);
    try {
      const res = await fetch("/api/quantum-gravitational/nodes");
      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errData.error || "Failed to load quantum gravitational interferometer nodes");
      }
      const data = await res.json();
      setNodes(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load quantum gravitational interferometer nodes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();
    setLogs([
      "[" + new Date().toLocaleTimeString() + "] Quantum Gravitational Entanglement Mesh initialized.",
      "[" + new Date().toLocaleTimeString() + "] Rb-87 Bose-Einstein condensates locked at T < 65 nK.",
      "[" + new Date().toLocaleTimeString() + "] Multi-photon Bragg optical lattice interferometers phase-coherent.",
    ]);
  }, []);

  const handleMeasure = async () => {
    setMeasuring(true);
    setErrorMsg(null);
    setLogs((prev) => [
      "[" + new Date().toLocaleTimeString() + "] Firing Bragg optical lattice pulse through " + selectedNode + "...",
      ...prev,
    ]);

    try {
      const res = await fetch("/api/quantum-gravitational/measure-distortion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          node_id: selectedNode,
          target_region: targetRegion,
          integration_time_sec: integrationTime,
        }),
      });

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errData.error || "Quantum gravitational distortion measurement failed");
      }
      const data: DistortionObservation = await res.json();
      setLastObs(data);
      setLogs((prev) => [
        "[" + new Date().toLocaleTimeString() + "] Metric deviation resolved: δg = " + data.metric_perturbation_delta_g.toExponential(4) + " (Confidence: " + data.confidence_score + "%)",
        "[" + new Date().toLocaleTimeString() + "] Observation status: " + data.status,
        ...prev,
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error connecting to quantum gravitational node.";
      setErrorMsg(msg);
      setLogs((prev) => [
        "[" + new Date().toLocaleTimeString() + "] Error: " + msg,
        ...prev,
      ]);
    } finally {
      setMeasuring(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-950/60 via-purple-900/30 to-indigo-950/60 border border-violet-800/40 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400">
              <Radio className="w-8 h-8 animate-pulse text-violet-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Spacetime Metric Distortions & Quantum Gravitational Sensor
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  Capability 80 &bull; Wave 20
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1">
                Cryogenic Bose-Einstein Condensate (&sup8;&sup7;Rb, T &lt; 65 nK) atom interferometry measuring geodesic tensor perturbations (&delta;g/g ~ 10⁻¹⁸) and Ryu-Takayanagi entanglement entropy.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchNodes}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-900/40 hover:bg-violet-800/50 border border-violet-700/50 text-violet-200 text-sm font-medium transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Sync Nodes
          </button>
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

      {/* Nodes Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {nodes.map((node) => (
          <div
            key={node.node_id}
            onClick={() => setSelectedNode(node.node_id)}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              selectedNode === node.node_id
                ? "bg-violet-950/70 border-violet-500 ring-2 ring-violet-500/30 shadow-lg"
                : "bg-slate-900/40 border-slate-800/80 hover:border-violet-700/50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">{node.facility_name}</h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{node.node_id}</p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                LOCKED
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-slate-800/40 border border-slate-700/30">
                <span className="text-slate-400 block text-[10px]">Condensate Temp</span>
                <span className="font-mono text-violet-300 font-bold">{node.trap_temperature_nk} nK</span>
              </div>
              <div className="p-2 rounded bg-slate-800/40 border border-slate-700/30">
                <span className="text-slate-400 block text-[10px]">Baseline</span>
                <span className="font-mono text-cyan-300 font-bold">{node.interferometer_baseline_m} m</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Control Panel & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Compass className="w-5 h-5 text-violet-400" />
            <h3 className="font-semibold text-white">Interferometer Pulse Control</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Target Geodesic Sector</label>
              <select
                value={targetRegion}
                onChange={(e) => setTargetRegion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
              >
                <option value="LOCAL_EARTH_GEOID_SECTOR_7">LOCAL_EARTH_GEOID_SECTOR_7 (Anomalous Test Vector)</option>
                <option value="CERN_DEEP_MANTLE_INTERSECTION">CERN_DEEP_MANTLE_INTERSECTION (Nominal Deep Earth)</option>
                <option value="LAGRANGE_L1_SPACETIME_WELL">LAGRANGE_L1_SPACETIME_WELL (Orbital Solar Vacuum)</option>
                <option value="WARP_METRIC_TRANSIENT_PROBE">WARP_METRIC_TRANSIENT_PROBE (Extreme Artificial Curvature)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Interferometer Integration Time</span>
                <span className="font-mono text-violet-300 font-bold">{integrationTime} seconds</span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={integrationTime}
                onChange={(e) => setIntegrationTime(parseFloat(e.target.value))}
                className="w-full accent-violet-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={handleMeasure}
              disabled={measuring}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-violet-900/30 flex items-center justify-center gap-2"
            >
              <Zap className={`w-4 h-4 ${measuring ? "animate-spin" : ""}`} />
              {measuring ? "Sampling Spacetime Metric..." : "Execute Interferometric Observation"}
            </button>
          </div>
        </div>

        {/* Observation Results */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Eye className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-white">Quantum Gravitational Telemetry</h3>
          </div>

          {lastObs ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">{lastObs.observation_id}</span>
                <span
                  className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    lastObs.topological_defect_detected
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  }`}
                >
                  {lastObs.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Metric Deviation (&delta;g)</span>
                  <span className="text-lg font-mono font-bold text-violet-400">
                    {lastObs.metric_perturbation_delta_g.toExponential(3)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Curvature Scalar (R)</span>
                  <span className="text-lg font-mono font-bold text-cyan-400">
                    {lastObs.riemann_curvature_scalar_r.toExponential(2)} m⁻²
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Entanglement Entropy</span>
                  <span className="text-sm font-mono font-bold text-purple-300">
                    {lastObs.holographic_entanglement_entropy_nats.toExponential(3)} nats
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Anomalous Mass Eq.</span>
                  <span className="text-sm font-mono font-bold text-amber-400">
                    {lastObs.anomalous_mass_equivalent_kg.toLocaleString()} kg
                  </span>
                </div>
              </div>

              {lastObs.defect_classification && (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Defect Classification: <strong>{lastObs.defect_classification}</strong></span>
                </div>
              )}
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-slate-500 text-sm">
              <Radio className="w-8 h-8 mb-2 opacity-40 text-violet-400" />
              <span>No active interferometric observation recorded.</span>
              <span className="text-xs text-slate-600 mt-1">Execute pulse above to measure spacetime curvature.</span>
            </div>
          )}
        </div>
      </div>

      {/* Telemetry Log Terminal */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-400">
        <div className="flex items-center gap-2 text-slate-500 mb-2 border-b border-slate-800/50 pb-2">
          <Terminal className="w-4 h-4 text-violet-400" />
          <span>QUANTUM_GRAVITATIONAL_INTERFEROMETER_TELEMETRY</span>
        </div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {logs.map((log, idx) => (
            <div key={idx} className="text-slate-300">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

