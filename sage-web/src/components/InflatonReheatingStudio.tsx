"use client";

import React, { useState, useEffect } from "react";
import {
  Flame,
  Radio,
  Zap,
  Activity,
  Terminal,
  RefreshCw,
  Shield,
  Sparkles,
  Layers,
  Thermometer,
} from "lucide-react";

interface InflatonResonanceNode {
  node_id: string;
  facility_name: string;
  inflaton_mass_gev: number;
  quartic_coupling_lambda: number;
  reheating_temperature_gev: number;
  baryon_asymmetry_eta_b: number;
  resonance_band_k_cutoff_gev: number;
  entropy_drain_rate_tw: number;
  status: string;
}

interface ReheatingCycleResult {
  cycle_id: string;
  node_id: string;
  initial_inflaton_amplitude_planck: number;
  parametric_growth_floquet_mu: number;
  thermalized_reheat_temp_gev: number;
  synthesized_baryon_density_cm3: number;
  quenched_anomalous_entropy_nats: number;
  plasma_relativistic_dof_g_star: number;
  status: string;
  timestamp: string;
}

export function InflatonReheatingStudio() {
  const [nodes, setNodes] = useState<InflatonResonanceNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [reheating, setReheating] = useState(false);
  const [selectedNode, setSelectedNode] = useState("INFLATON-PUMP-CERN-01");
  const [amplitude, setAmplitude] = useState(0.85);
  const [couplingGain, setCouplingGain] = useState(1.0);
  const [lastCycle, setLastCycle] = useState<ReheatingCycleResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchNodes = async () => {
    try {
      const res = await fetch("/api/inflaton-reheating/nodes");
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
      "[" + new Date().toLocaleTimeString() + "] Inflaton Field Chaotic Phase Reheating & Baryogenesis Pump online.",
      "[" + new Date().toLocaleTimeString() + "] Parametric resonance Floquet band calibrated across 3 early-universe cavities.",
      "[" + new Date().toLocaleTimeString() + "] Sakharov non-equilibrium CP-violation baseline locked (eta_B ~ 6.12e-10).",
    ]);
  }, []);

  const handleTriggerCycle = async () => {
    setReheating(true);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Igniting inflaton preheating at ${selectedNode} (Amplitude: ${amplitude} M_Pl, Gain: ${couplingGain}x)...`,
      ...prev,
    ]);

    try {
      const res = await fetch("/api/inflaton-reheating/reheat-cycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          node_id: selectedNode,
          initial_amplitude_planck: amplitude,
          coupling_gain: couplingGain,
        }),
      });

      if (res.ok) {
        const data: ReheatingCycleResult = await res.json();
        setLastCycle(data);
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] REHEATING CYCLE SUCCESS: ${data.cycle_id}`,
          `[${new Date().toLocaleTimeString()}] Reheat Temp: ${data.thermalized_reheat_temp_gev.toExponential(2)} GeV | Floquet Growth: mu=${data.parametric_growth_floquet_mu.toFixed(4)}`,
          `[${new Date().toLocaleTimeString()}] Baryon Density: ${data.synthesized_baryon_density_cm3.toExponential(2)} cm^-3 | Quenched Entropy: ${data.quenched_anomalous_entropy_nats.toFixed(2)} nats`,
          `[${new Date().toLocaleTimeString()}] Relativistic DOF g*: ${data.plasma_relativistic_dof_g_star} | Status: ${data.status}`,
          ...prev,
        ]);
      }
    } catch {
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] REHEATING ERROR: Inflaton potential decoherence.`,
        ...prev,
      ]);
    } finally {
      setReheating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-orange-500/30 bg-gradient-to-r from-orange-950/40 via-slate-900 to-red-950/40 p-6 backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400">
                <Flame className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  Inflaton Field Chaotic Phase Reheating & Thermal Baryogenesis Entropy Pump
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 font-mono">
                    Capability 92
                  </span>
                </h1>
                <p className="text-sm text-slate-400">
                  Parametric Resonance Preheating, Sakharov Baryogenesis & High-Enthalpy Entropy Evacuation
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchNodes}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-mono rounded-lg border border-orange-500/40 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Sync Reheating Cavities
            </button>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-orange-900/40 border border-orange-500/30 text-orange-300 text-xs font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
              RESONANCE LOCKED
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Resonance Node Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {nodes.map((n) => (
          <div
            key={n.node_id}
            onClick={() => setSelectedNode(n.node_id)}
            className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
              selectedNode === n.node_id
                ? "border-orange-500 bg-orange-950/30 shadow-lg shadow-orange-950/50"
                : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-orange-400 truncate">
                {n.node_id}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border bg-orange-500/20 text-orange-300 border-orange-500/40">
                {n.status}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white truncate mb-2">
              {n.facility_name}
            </h3>

            <div className="space-y-1.5 text-xs text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Inflaton Mass:</span>
                <span className="text-slate-200">{n.inflaton_mass_gev.toExponential(1)} GeV</span>
              </div>
              <div className="flex justify-between">
                <span>Reheat Temp:</span>
                <span className="text-orange-300 font-bold">{n.reheating_temperature_gev.toExponential(2)} GeV</span>
              </div>
              <div className="flex justify-between">
                <span>Baryon Asymmetry:</span>
                <span className="text-emerald-400 font-bold">{n.baryon_asymmetry_eta_b.toExponential(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Entropy Drain:</span>
                <span className="text-amber-400">{n.entropy_drain_rate_tw} TW</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Control Panel & Reheating Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Zap className="h-4 w-4 text-orange-400" />
            Parametric Resonance Ignition
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-mono">
                Active Reheating Node
              </label>
              <select
                value={selectedNode}
                onChange={(e) => setSelectedNode(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-200 font-mono focus:border-orange-500 focus:outline-none"
              >
                {nodes.map((n) => (
                  <option key={n.node_id} value={n.node_id}>
                    {n.node_id} ({n.entropy_drain_rate_tw} TW)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Inflaton Amplitude:</span>
                <span className="text-orange-300 font-bold">{amplitude.toFixed(2)} M_Pl</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.5"
                step="0.05"
                value={amplitude}
                onChange={(e) => setAmplitude(parseFloat(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Resonance Coupling Gain:</span>
                <span className="text-orange-300 font-bold">{couplingGain.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="5.0"
                step="0.1"
                value={couplingGain}
                onChange={(e) => setCouplingGain(parseFloat(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>

            <button
              onClick={handleTriggerCycle}
              disabled={reheating}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-orange-900/30"
            >
              <Sparkles className={`h-4 w-4 ${reheating ? "animate-spin" : ""}`} />
              {reheating ? "Thermalizing Relativistic Plasma..." : "Ignite Reheating Cycle"}
            </button>
          </div>
        </div>

        {/* Telemetry Display */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Activity className="h-4 w-4 text-orange-400" />
            Thermal Plasma Telemetry
          </h2>

          {lastCycle ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-orange-950/30 border border-orange-500/30 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Cycle ID:</span>
                  <span className="text-orange-300 font-bold">{lastCycle.cycle_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reheat Temperature:</span>
                  <span className="text-white font-bold">{lastCycle.thermalized_reheat_temp_gev.toExponential(2)} GeV</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Floquet Growth mu:</span>
                  <span className="text-emerald-400 font-bold">{lastCycle.parametric_growth_floquet_mu.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Entropy Quenched:</span>
                  <span className="text-orange-300 font-bold">{lastCycle.quenched_anomalous_entropy_nats.toFixed(2)} nats</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Baryon Density:</span>
                  <span className="text-emerald-300 font-bold">{lastCycle.synthesized_baryon_density_cm3.toExponential(2)} cm^-3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Degrees of Freedom g*:</span>
                  <span className="text-indigo-300 font-bold">{lastCycle.plasma_relativistic_dof_g_star}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-slate-500 text-xs font-mono space-y-2">
              <Thermometer className="h-8 w-8 text-slate-700" />
              <span>Ready for cosmological reheating cycle.</span>
            </div>
          )}
        </div>

        {/* Live Execution Terminal */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs flex flex-col h-[280px]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-orange-400" />
              Inflaton Console
            </span>
            <span className="text-[10px] text-orange-400/80">ONLINE</span>
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

