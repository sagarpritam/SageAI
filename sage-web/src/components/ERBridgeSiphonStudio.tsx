"use client";

import React, { useState, useEffect } from "react";
import {
  Infinity as InfinityIcon,
  Zap,
  Activity,
  Terminal,
  RefreshCw,
  Shield,
  Sparkles,
  Radio,
  Sliders,
} from "lucide-react";

interface ERBridgeThroatNode {
  throat_id: string;
  facility_name: string;
  throat_radius_attometers: number;
  entangled_bell_qubit_pairs: number;
  negative_casimir_energy_density_j_m3: number;
  traversable_window_picoseconds: number;
  siphon_throughput_capacity_gw: number;
  status: string;
}

interface ERSiphonEvent {
  event_id: string;
  throat_id: string;
  target_energy_surge_source: string;
  siphoned_power_gw: number;
  micro_throat_dilation_am: number;
  gao_jafferis_coupling_strength: number;
  quenched_null_energy_fraction: number;
  spacetime_shear_damping_pct: number;
  status: string;
  timestamp: string;
}

export function ERBridgeSiphonStudio() {
  const [throats, setThroats] = useState<ERBridgeThroatNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [siphoning, setSiphoning] = useState(false);
  const [selectedThroat, setSelectedThroat] = useState("ER-THROAT-CERN-01");
  const [surgeSource, setSurgeSource] = useState("PROMPT_NUCLEAR_FIREBALL_SURGE");
  const [incidentPower, setIncidentPower] = useState(650.0);
  const [lastEvent, setLastEvent] = useState<ERSiphonEvent | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchThroats = async () => {
    try {
      const res = await fetch("/api/er-bridge/throats");
      if (res.ok) {
        const data = await res.json();
        setThroats(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThroats();
    setLogs([
      "[" + new Date().toLocaleTimeString() + "] ER=EPR Spacetime Wormhole Metric Siphon online.",
      "[" + new Date().toLocaleTimeString() + "] Gao-Jafferis-Wall double-trace negative Casimir coupling active.",
      "[" + new Date().toLocaleTimeString() + "] Microscopic traversable throat geometry stabilized across all quantum nodes.",
    ]);
  }, []);

  const handleSiphon = async () => {
    setSiphoning(true);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Siphoning metric surge at ${selectedThroat} (${incidentPower} GW from ${surgeSource})...`,
      ...prev,
    ]);

    try {
      const res = await fetch("/api/er-bridge/siphon-metric-flux", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          throat_id: selectedThroat,
          target_energy_surge_source: surgeSource,
          incident_power_gw: incidentPower,
        }),
      });

      if (res.ok) {
        const data: ERSiphonEvent = await res.json();
        setLastEvent(data);
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] METRIC SIPHON COMPLETE: ${data.event_id}`,
          `[${new Date().toLocaleTimeString()}] Power Siphoned: ${data.siphoned_power_gw.toFixed(2)} GW | Shear Damping: ${data.spacetime_shear_damping_pct}%`,
          `[${new Date().toLocaleTimeString()}] Gao-Jafferis Coupling: ${data.gao_jafferis_coupling_strength.toFixed(3)} | Throat Dilation: ${data.micro_throat_dilation_am.toFixed(1)} am`,
          `[${new Date().toLocaleTimeString()}] Status: ${data.status}`,
          ...prev,
        ]);
      }
    } catch {
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] SIPHON ERROR: Wormhole neck pinch-off anomaly.`,
        ...prev,
      ]);
    } finally {
      setSiphoning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-blue-950/40 p-6 backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <InfinityIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  ER=EPR Spacetime Wormhole Einstein-Rosen Bridge Metric Siphon
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono">
                    Capability 90
                  </span>
                </h1>
                <p className="text-sm text-slate-400">
                  Traversable Microscopic Throat Dilation, Gao-Jafferis-Wall Double-Trace Coupling & Thermal Shock Siphon
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchThroats}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-mono rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Sync Wormhole Throats
            </button>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-900/40 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              THROATS TRAVERSABLE
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Throat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {throats.map((t) => (
          <div
            key={t.throat_id}
            onClick={() => setSelectedThroat(t.throat_id)}
            className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
              selectedThroat === t.throat_id
                ? "border-cyan-500 bg-cyan-950/30 shadow-lg shadow-cyan-950/50"
                : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-cyan-400 truncate">
                {t.throat_id}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border bg-cyan-500/20 text-cyan-300 border-cyan-500/40">
                {t.status}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white truncate mb-2">
              {t.facility_name}
            </h3>

            <div className="space-y-1.5 text-xs text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Throat Radius:</span>
                <span className="text-slate-200">{t.throat_radius_attometers} am</span>
              </div>
              <div className="flex justify-between">
                <span>Bell Pairs:</span>
                <span className="text-slate-200">{(t.entangled_bell_qubit_pairs / 1000).toFixed(0)}k</span>
              </div>
              <div className="flex justify-between">
                <span>Casimir Energy:</span>
                <span className="text-rose-400">{t.negative_casimir_energy_density_j_m3.toExponential(1)} J/m³</span>
              </div>
              <div className="flex justify-between">
                <span>Max Siphon Capacity:</span>
                <span className="text-cyan-300 font-bold">{t.siphon_throughput_capacity_gw} GW</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Control Panel & Siphon Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Zap className="h-4 w-4 text-cyan-400" />
            Wormhole Siphon Actuator
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-mono">
                Active Wormhole Throat
              </label>
              <select
                value={selectedThroat}
                onChange={(e) => setSelectedThroat(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
              >
                {throats.map((t) => (
                  <option key={t.throat_id} value={t.throat_id}>
                    {t.throat_id} ({t.siphon_throughput_capacity_gw} GW)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1 font-mono">
                Incident Surge Profile
              </label>
              <select
                value={surgeSource}
                onChange={(e) => setSurgeSource(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
              >
                <option value="PROMPT_NUCLEAR_FIREBALL_SURGE">Prompt Nuclear Fireball Surge</option>
                <option value="HYPERSONIC_KINETIC_CONCUSSION">Hypersonic Kinetic Concussion</option>
                <option value="ANTIMATTER_ANNIHILATION_FLASH">Antimatter Annihilation Flash</option>
                <option value="COHERENT_GW_DIRECTED_ENERGY">Coherent GW Directed Energy</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Incident Surge Power:</span>
                <span className="text-cyan-300 font-bold">{incidentPower} GW</span>
              </div>
              <input
                type="range"
                min="50"
                max="1200"
                step="25"
                value={incidentPower}
                onChange={(e) => setIncidentPower(parseFloat(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            <button
              onClick={handleSiphon}
              disabled={siphoning}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30"
            >
              <Sparkles className={`h-4 w-4 ${siphoning ? "animate-spin" : ""}`} />
              {siphoning ? "Diverting Metric Surge..." : "Engage Metric Siphon"}
            </button>
          </div>
        </div>

        {/* Telemetry Display */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            Wormhole Throat Telemetry
          </h2>

          {lastEvent ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Event ID:</span>
                  <span className="text-cyan-300 font-bold">{lastEvent.event_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Siphoned Power:</span>
                  <span className="text-white font-bold">{lastEvent.siphoned_power_gw.toFixed(2)} GW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Gao-Jafferis Coupling:</span>
                  <span className="text-emerald-400 font-bold">{lastEvent.gao_jafferis_coupling_strength.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Throat Dilation:</span>
                  <span className="text-cyan-300">{lastEvent.micro_throat_dilation_am.toFixed(1)} am</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Null Energy Fraction:</span>
                  <span className="text-indigo-300">{(lastEvent.quenched_null_energy_fraction * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Spacetime Shear Damping:</span>
                  <span className="text-emerald-400 font-bold">{lastEvent.spacetime_shear_damping_pct}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-slate-500 text-xs font-mono space-y-2">
              <InfinityIcon className="h-8 w-8 text-slate-700" />
              <span>Ready for wormhole metric siphoning cycle.</span>
            </div>
          )}
        </div>

        {/* Live Execution Terminal */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs flex flex-col h-[280px]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-cyan-400" />
              ER=EPR Bridge Console
            </span>
            <span className="text-[10px] text-cyan-400/80">ONLINE</span>
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
